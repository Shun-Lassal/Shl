import { BaseService } from "../../shared/base/index.ts";
import { ValidationError, NotFoundError } from "../../shared/errors.ts";
import { newLobbySchema, lobbySchema } from "./lobby.model.ts";
import type { Lobby, NewLobby } from "./lobby.model.ts";
import { LobbyRepository, type LobbyUpdateData } from "./lobby.repository.ts";
import { emitLobbyClosed, emitLobbyUpdate } from "./lobby.realtime.ts";

export class LobbyService extends BaseService {
  private repo: LobbyRepository;

  constructor() {
    super();
    this.repo = new LobbyRepository();
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

  async addPlayerToLobby(id: string, playerId: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId: playerId });
    const lobby = await this.repo.addPlayer(id, playerId);
    emitLobbyUpdate(lobby, { systemMessage: `Player ${playerId} joined the lobby` });
    return lobby;
  }

  async removePlayerFromLobby(id: string, playerId: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId: playerId });
    const lobby = await this.repo.removePlayer(id, playerId);
    emitLobbyUpdate(lobby, { systemMessage: `Player ${playerId} left the lobby` });
    return lobby;
  }

  async deleteLobby(id: string): Promise<void> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });

    // Verify lobby exists
    await this.repo.findById(id);

    await this.repo.delete(id);
    emitLobbyClosed(id, "Lobby deleted");
  }
}
