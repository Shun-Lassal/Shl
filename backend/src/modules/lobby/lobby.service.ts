import { BaseService } from "../../shared/base/index.ts";
import { ValidationError, NotFoundError } from "../../shared/errors.ts";
import { newLobbySchema, lobbySchema } from "./lobby.model.ts";
import type { Lobby, NewLobby } from "./lobby.model.ts";
import { LobbyRepository, type LobbyUpdateData } from "./lobby.repository.ts";

export class LobbyService extends BaseService {
  private repo: LobbyRepository;

  constructor() {
    super();
    this.repo = new LobbyRepository();
  }

  async createLobby(data: NewLobby): Promise<Lobby> {
    const validatedData = this.validate<NewLobby>(newLobbySchema, data);
    return this.repo.create(validatedData);
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

    return this.repo.update(id, data);
  }

  async updateLobbyStatus(id: string, status: Lobby["status"]): Promise<Lobby> {
    return this.updateLobby(id, { status });
  }

  async updateLobbyName(id: string, name: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, name: true });
    this.validate(schema, { id, name });
    return this.repo.update(id, { name });
  }

  async updateLobbySlots(id: string, slots: number): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, slots: true });
    this.validate(schema, { id, slots });
    return this.repo.update(id, { slots });
  }

  async updateLobbyOwner(id: string, ownerId: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId });
    return this.repo.update(id, { ownerId });
  }

  async updateLobbyPassword(id: string, password: string | null): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });
    return this.repo.update(id, { password });
  }

  async setLobbyPlayers(id: string, players: string[]): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });

    const lobby = await this.repo.findById(id);
    if (players.length > lobby.slots) {
      throw new ValidationError(`Player count (${players.length}) exceeds lobby slots (${lobby.slots})`);
    }

    return this.repo.setPlayers(id, players);
  }

  async addPlayerToLobby(id: string, playerId: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId: playerId });
    return this.repo.addPlayer(id, playerId);
  }

  async removePlayerFromLobby(id: string, playerId: string): Promise<Lobby> {
    const schema = lobbySchema.pick({ id: true, ownerId: true });
    this.validate(schema, { id, ownerId: playerId });
    return this.repo.removePlayer(id, playerId);
  }

  async deleteLobby(id: string): Promise<void> {
    const schema = lobbySchema.pick({ id: true });
    this.validate(schema, { id });

    // Verify lobby exists
    await this.repo.findById(id);

    await this.repo.delete(id);
  }
}
