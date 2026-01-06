import { BaseService } from "../../shared/base/index.js";
import { ValidationError, NotFoundError, ForbiddenError } from "../../shared/errors.js";
import { newLobbySchema, lobbySchema } from "./lobby.model.js";
import type { Lobby, NewLobby } from "./lobby.model.js";
import { LobbyRepository, type LobbyUpdateData } from "./lobby.repository.js";
import { emitLobbyClosed, emitLobbyUpdate } from "./lobby.realtime.js";
import { GameRepository } from "../game/game.repository.js";

export class LobbyService extends BaseService {
  private repo: LobbyRepository;
  private gameRepo: GameRepository;

  constructor() {
    super();
    this.repo = new LobbyRepository();
    this.gameRepo = new GameRepository();
  }

  private async sweepEndedLobbies(): Promise<void> {
    await this.repo.deleteEnded();
  }

  async createLobby(data: NewLobby): Promise<Lobby> {
    const validatedData = this.validate<NewLobby>(newLobbySchema, data);
    const lobby = await this.repo.create(validatedData);
    emitLobbyUpdate(lobby, { systemMessage: `Lobby created by ${lobby.ownerId}` });
    return lobby;
  }

  async listLobbies(options?: { skip?: number; take?: number }): Promise<Lobby[]> {
    return this.repo.findAll(options);
  }

  async getLobbyById(id: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });
    return this.repo.findById(id);
  }

  async getLobbyByName(name: string): Promise<Lobby | null> {
    const schema = lobbySchema.pick({ name: true });
    this.validate(schema, { name });
    return this.repo.findByName(name);
  }

  async updateLobby(id: string, data: LobbyUpdateData): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });

    // Verify lobby exists
    await this.repo.findById(id);

    const changes: string[] = [];
    if (typeof data.name !== "undefined") {
      changes.push(`name -> ${data.name}`);
    }
    if (typeof data.slots !== "undefined") {
      changes.push(`slots -> ${data.slots}`);
    }
    if (typeof data.password !== "undefined") {
      changes.push(data.password ? "password updated" : "password removed");
    }
    if (typeof data.status !== "undefined") {
      changes.push(`status -> ${data.status}`);
    }
    if (typeof data.ownerId !== "undefined") {
      changes.push(`owner -> ${data.ownerId}`);
    }

    const lobby = await this.repo.update(id, data);
    emitLobbyUpdate(lobby, {
      systemMessage: changes.length ? `Lobby updated: ${changes.join(", ")}` : "Lobby updated",
    });
    return lobby;
  }

  async updateLobbyStatus(id: string, status: Lobby["status"]): Promise<Lobby> {
    return this.updateLobby(id, { status });
  }

  async updateLobbyName(id: string, name: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, name: true });
    this.validate(schema, { id, name });
    return this.updateLobby(id, { name });
  }

  async updateLobbySlots(id: string, slots: number): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, slots: true });
    this.validate(schema, { id, slots });
    return this.updateLobby(id, { slots });
  }

  async updateLobbyOwner(id: string, ownerId: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId });
    return this.updateLobby(id, { ownerId });
  }

  async updateLobbyPassword(id: string, password: string | null): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });
    return this.updateLobby(id, { password });
  }

  async setLobbyPlayers(id: string, players: string[]): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });

    const lobby = await this.repo.findById(id);
    if (players.length > lobby.slots) {
      throw new ValidationError(`Player count (${players.length}) exceeds lobby slots (${lobby.slots})`);
    }

    const updatedLobby = await this.repo.setPlayers(id, players);
    emitLobbyUpdate(updatedLobby, {
      systemMessage: `Lobby players set (${players.length}/${updatedLobby.slots})`,
    });
    return updatedLobby;
  }

  async addPlayerToLobby(id: string, playerId: string, password?: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId: playerId });

    const lobby = await this.repo.findById(id);
    const players = ((lobby as any).players ?? []) as any[];
    const alreadyInLobby = players.some((p) => p?.id === playerId);

    // Re-joining an existing lobby membership should be idempotent (e.g. refresh/reconnect)
    if (alreadyInLobby) {
      return lobby;
    }

    // Reconnect flow: if the lobby is already PLAYING, only allow re-joining if the user
    // is an actual participant in the running game.
    if (lobby.status !== "WAITING") {
      if (lobby.status === "PLAYING") {
        const game = await this.gameRepo.findByLobbyId(id);
        const isParticipant = game?.players?.some((p) => p.userId === playerId);
        if (isParticipant) {
          const updatedLobby = await this.repo.addPlayer(id, playerId);
          emitLobbyUpdate(updatedLobby, { systemMessage: `Player ${playerId} re-joined the lobby` });
          return updatedLobby;
        }
      }
      throw new ValidationError("Cannot join a lobby that is not waiting");
    }

    if (players.length >= lobby.slots) {
      throw new ValidationError("Lobby is full");
    }

    if (lobby.password) {
      if (!password) {
        throw new ForbiddenError("Lobby password required");
      }
      if (password !== lobby.password) {
        throw new ForbiddenError("Invalid lobby password");
      }
    }

    const updatedLobby = await this.repo.addPlayer(id, playerId);
    emitLobbyUpdate(updatedLobby, { systemMessage: `Player ${playerId} joined the lobby` });
    return updatedLobby;
  }

  async removePlayerFromLobby(id: string, playerId: string): Promise<Lobby | null> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId: playerId });

    const lobby = await this.repo.findById(id);
    const players = ((lobby as any).players ?? []) as any[];

    if (players.length === 1 && players[0]?.id === playerId) {
      await this.repo.delete(id);
      emitLobbyClosed(id, "Lobby deleted (last player left)");
      await this.sweepEndedLobbies();
      return null;
    }

    const updatedLobby = await this.repo.removePlayer(id, playerId);
    emitLobbyUpdate(updatedLobby, { systemMessage: `Player ${playerId} left the lobby` });
    return updatedLobby;
  }

  async deleteLobby(id: string): Promise<void> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });

    // Verify lobby exists
    await this.repo.findById(id);

    await this.repo.delete(id);
    emitLobbyClosed(id, "Lobby deleted");
    await this.sweepEndedLobbies();
  }
}
