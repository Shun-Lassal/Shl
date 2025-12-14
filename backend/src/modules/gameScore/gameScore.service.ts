import type { GameScoreWithRelations, NewGameScore } from "./gameScore.model.ts";
import { GameScoreRepository } from "./gameScore.repository.ts";

export class GameScoreService {
  private repo: GameScoreRepository;

  constructor() {
    this.repo = new GameScoreRepository();
  }

  async listGameScores(lobbyId?: string): Promise<GameScoreWithRelations[]> {
    if (lobbyId) {
      this.assertNonEmpty(lobbyId, "Lobby id");
      return this.repo.findByLobby(lobbyId);
    }
    return this.repo.findAll();
  }

  async getGameScore(id: string): Promise<GameScoreWithRelations> {
    this.assertNonEmpty(id, "GameScore id");
    const score = await this.repo.findById(id);
    if (!score) {
      throw "GameScore not found";
    }
    return score;
  }

  async createGameScore(data: NewGameScore): Promise<GameScoreWithRelations> {
    this.assertNonEmpty(data.userId, "User id");
    this.assertNonEmpty(data.lobbyId, "Lobby id");
    this.assertValidPosition(data.position);

    const existingScore = await this.repo.findByUserAndLobby(data.userId, data.lobbyId);
    if (existingScore) {
      throw "A score already exists for this user in the lobby";
    }

    return this.repo.create(data);
  }

  async updateGameScorePosition(id: string, position: number): Promise<GameScoreWithRelations> {
    this.assertNonEmpty(id, "GameScore id");
    this.assertValidPosition(position);

    await this.getGameScore(id);
    return this.repo.updatePosition(id, position);
  }

  async deleteGameScore(id: string): Promise<void> {
    this.assertNonEmpty(id, "GameScore id");
    await this.getGameScore(id);
    await this.repo.deleteById(id);
  }

  private assertNonEmpty(value: string | undefined, label: string) {
    if (!value || value.trim().length === 0) {
      throw `${label} is empty`;
    }
  }

  private assertValidPosition(position: number) {
    if (!Number.isInteger(position) || position < 1) {
      throw "Position must be a positive integer";
    }
  }
}
