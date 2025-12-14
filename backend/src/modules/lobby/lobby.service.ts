import type { Lobby, NewLobby } from "./lobby.model.ts";
import { LobbyRepository, type LobbyUpdateData } from "./lobby.repository.ts";


export class LobbyService {
  private repo: LobbyRepository;
  
  constructor() {
    this.repo = new LobbyRepository();
  }

  async createLobby(data: NewLobby): Promise<Lobby> {
    this.validateLobbyData(data);
    return this.repo.createLobby({
      ...data,
      players: data.players ?? [],
      password: data.password ?? null,
    });
  }

  async listLobbies(): Promise<Array<Lobby>> {
    return this.repo.listLobbies();
  }

  async getLobbyById(id: string): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    const lobby = await this.repo.getLobbyById(id);
    if (!lobby) {
      throw "Lobby not found";
    }
    return lobby;
  }

  async getLobbyByName(name: string): Promise<Lobby | null> {
    this.assertNonEmpty(name, "Lobby name");
    return this.repo.getLobbyByName(name);
  }

  async updateLobby(id: string, data: LobbyUpdateData): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    return this.repo.updateLobby(id, data);
  }

  async updateLobbyStatus(id: string, status: Lobby['status']): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    return this.repo.updateLobbyStatus(id, status);
  }
  
  async updateLobbyName(id: string, name: string): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    this.assertNonEmpty(name, "Lobby name");
    return this.repo.renameLobby(id, name);
  }

  async updateLobbySlots(id: string, slots: number): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    this.assertValidSlotCount(slots);
    return this.repo.updateLobbySlots(id, slots);
  }

  async updateLobbyOwner(id: string, ownerId: string): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    this.assertNonEmpty(ownerId, "Owner id");
    return this.repo.updateLobbyOwner(id, ownerId);
  }

  async updateLobbyPassword(id: string, password: string | null): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    return this.repo.updateLobbyPassword(id, password);
  }

  async setLobbyPlayers(id: string, players: Array<string>): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    if (!Array.isArray(players)) {
      throw "Players payload must be an array";
    }
    const lobby = await this.getLobbyById(id);
    if (players.length > lobby.slots) {
      throw "Player count exceeds lobby slots";
    }
    return this.repo.setLobbyPlayers(id, players);
  }

  async addPlayerToLobby(id: string, playerId: string): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    this.assertNonEmpty(playerId, "Player id");
    return this.repo.addPlayerToLobby(id, playerId);
  }

  async removePlayerFromLobby(id: string, playerId: string): Promise<Lobby> {
    this.assertNonEmpty(id, "Lobby id");
    this.assertNonEmpty(playerId, "Player id");
    return this.repo.removePlayerFromLobby(id, playerId);
  }

  async deleteLobby(id: string): Promise<void> {
    this.assertNonEmpty(id, "Lobby id");
    await this.repo.deleteLobby(id);
  }

  private validateLobbyData(data: NewLobby) {
    this.assertNonEmpty(data.name, "Lobby name");
    this.assertNonEmpty(data.ownerId, "Owner id");
    this.assertValidSlotCount(data.slots);
    if (data.players && data.players.length > data.slots) {
      throw "Players cannot exceed slots";
    }
  }

  private assertNonEmpty(value: string | undefined, label: string) {
    if (!value || value.trim().length === 0) {
      throw `${label} is empty`;
    }
  }

  private assertValidSlotCount(slots: number) {
    if (!Number.isInteger(slots) || slots < 2) {
      throw "Slots must be a positive integer or higher than 1";
    }
  }

}
