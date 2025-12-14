import { BaseRepository } from "../../shared/base/index.ts";
import { NotFoundError } from "../../shared/errors.ts";
import type { GameScore, GameScoreWithRelations, NewGameScore } from "./gameScore.model.ts";

const defaultInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  lobby: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
};

export class GameScoreRepository extends BaseRepository {
  async findAll(options?: { skip?: number; take?: number }): Promise<GameScoreWithRelations[]> {
    return this.db.gamescore.findMany({
      ...options,
      include: defaultInclude,
      orderBy: [{ lobbyId: "asc" }, { position: "asc" }],
    });
  }

  async findById(id: string): Promise<GameScoreWithRelations> {
    const score = await this.db.gamescore.findUnique({
      where: { id },
      include: defaultInclude,
    });

    if (!score) {
      throw new NotFoundError(`GameScore ${id} not found`);
    }

    return score;
  }

  async findByLobby(lobbyId: string): Promise<GameScoreWithRelations[]> {
    return this.db.gamescore.findMany({
      where: { lobbyId },
      include: defaultInclude,
      orderBy: { position: "asc" },
    });
  }

  async findByUserAndLobby(userId: string, lobbyId: string): Promise<GameScoreWithRelations | null> {
    return this.db.gamescore.findFirst({
      where: { userId, lobbyId },
      include: defaultInclude,
    });
  }

  async create(data: NewGameScore): Promise<GameScoreWithRelations> {
    return this.db.gamescore.create({
      data,
      include: defaultInclude,
    });
  }

  async update(id: string, data: { position: number }): Promise<GameScoreWithRelations> {
    return this.db.gamescore.update({
      where: { id },
      data,
      include: defaultInclude,
    });
  }

  async delete(id: string): Promise<GameScore> {
    return this.db.gamescore.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const score = await this.db.gamescore.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!score;
  }
}
