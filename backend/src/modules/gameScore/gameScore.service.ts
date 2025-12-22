import { BaseService } from "../../shared/base/index.ts";
import { ValidationError, ConflictError } from "../../shared/errors.ts";
import { gameScoreSchema, newGameScoreSchema } from "./gameScore.model.ts";
import type { GameScoreWithRelations, NewGameScore } from "./gameScore.model.ts";
import { GameScoreRepository } from "./gameScore.repository.ts";

export class GameScoreService extends BaseService {
  private repo: GameScoreRepository;

  constructor() {
    super();
    this.repo = new GameScoreRepository();
  }

  async listGameScores(options?: { lobbyId?: string; skip?: number; take?: number }): Promise<GameScoreWithRelations[]> {
    if (options?.lobbyId) {
      const schema = gameScoreSchema.pick({ lobbyId: true });
      this.validate(schema, { lobbyId: options.lobbyId });
      return this.repo.findByLobby(options.lobbyId);
    }
    return this.repo.findAll({
      skip: options?.skip,
      take: options?.take,
    });
  }

  async getGameScore(id: string): Promise<GameScoreWithRelations> {
    const schema = gameScoreSchema.pick({ id: true });
    this.validate(schema, { id });
    return this.repo.findById(id);
  }

  async createGameScore(data: NewGameScore): Promise<GameScoreWithRelations> {
    const validatedData = this.validate<NewGameScore>(newGameScoreSchema, data);

    // Check if score already exists for this user in this lobby
    const existingScore = await this.repo.findByUserAndLobby(
      validatedData.userId,
      validatedData.lobbyId
    );

    if (existingScore) {
      throw new ConflictError(
        `User ${validatedData.userId} already has a score in lobby ${validatedData.lobbyId}`
      );
    }

    return this.repo.create(validatedData);
  }

  async upsertGameScore(data: NewGameScore): Promise<GameScoreWithRelations> {
    const validatedData = this.validate<NewGameScore>(newGameScoreSchema, data);

    const existing = await this.repo.findByUserAndLobby(validatedData.userId, validatedData.lobbyId);
    if (existing) {
      return this.repo.update(existing.id, { position: validatedData.position });
    }
    return this.repo.create(validatedData);
  }

  async updateGameScorePosition(id: string, position: number): Promise<GameScoreWithRelations> {
    const schema = gameScoreSchema.pick({ id: true, position: true });
    this.validate(schema, { id, position });

    // Verify the score exists
    await this.repo.findById(id);

    return this.repo.update(id, { position });
  }

  async deleteGameScore(id: string): Promise<void> {
    const schema = gameScoreSchema.pick({ id: true });
    this.validate(schema, { id });

    // Verify the score exists
    await this.repo.findById(id);

    await this.repo.delete(id);
  }
}
