import { Lobby, NewLobby } from "./lobby.model.js";
import { LobbyRepository } from "./lobby.repository.js";


export class LobbyService {
  private repo: LobbyRepository;
  
  constructor() {
    this.repo = new LobbyRepository();
  }

  async createLobby(data: NewLobby): Promise<Lobby> {
    return this.repo.createLobby(data);
  }

  async listLobbies(): Promise<Array<Lobby>> {
    return this.repo.listLobbies();
  }

  async getLobbyById(id: string): Promise<Lobby | null> {
    if (!id) {
      throw "Lobby id is empty"
    }

    return this.repo.getLobbyById(id);
  }

  async getLobbyByName(name: string): Promise<Lobby | null> {
    if (!name) {
      throw "Lobby name is empty"
    }

    return this.repo.getLobbyByName(name);
  }

  async updateLobbyStatus(id: string, status: Lobby['status']): Promise<Lobby> {
    return this.repo.updateLobbyStatus(id, status);
  }
  
  async updateLobbyName(id: string, name: string): Promise<Lobby> {
    return this.repo.renameLobby(id, name);
  }

  async updateLobbySlots(id: string, slots: number): Promise<Lobby> {
    return this.repo.updateLobbySlots(id, slots);
  }

  async updateLobbyOwner(id: string, ownerId: string): Promise<Lobby> {
    return this.repo.updateLobbyOwner(id, ownerId);
  }

  async updateLobbyPassword(id: string, password: string | null): Promise<Lobby> {
    return this.repo.updateLobbyPassword(id, password);
  }

  

}
