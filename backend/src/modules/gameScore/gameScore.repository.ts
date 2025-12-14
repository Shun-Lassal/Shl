import { prisma } from "../../shared/prisma.ts";
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

export class GameScoreRepository {
  async findAll(): Promise<GameScoreWithRelations[]> {
    return prisma.gamescore.findMany({
      include: defaultInclude,
      orderBy: [{ lobbyId: "asc" }, { position: "asc" }],
    });
  }

  async findById(id: string): Promise<GameScoreWithRelations | null> {
    return prisma.gamescore.findUnique({ where: { id }, include: defaultInclude });
  }

  async findByLobby(lobbyId: string): Promise<GameScoreWithRelations[]> {
    return prisma.gamescore.findMany({
      where: { lobbyId },
      include: defaultInclude,
      orderBy: { position: "asc" },
    });
  }

  async findByUserAndLobby(userId: string, lobbyId: string): Promise<GameScoreWithRelations | null> {
    return prisma.gamescore.findFirst({
      where: { userId, lobbyId },
      include: defaultInclude,
    });
  }

  async create(data: NewGameScore): Promise<GameScoreWithRelations> {
    return prisma.gamescore.create({
      data,
      include: defaultInclude,
    });
  }

  async updatePosition(id: string, position: number): Promise<GameScoreWithRelations> {
    return prisma.gamescore.update({
      where: { id },
      data: { position },
      include: defaultInclude,
    });
  }

  async deleteById(id: string): Promise<GameScore> {
    return prisma.gamescore.delete({ where: { id } });
  }
}
