import { BaseRepository } from "../../shared/base/index.ts";
import { NotFoundError } from "../../shared/errors.ts";
import type { Game, PlayerState, EnemyState } from "./game.model.ts";
import { GamePhase } from "@prisma/client";

export class GameRepository extends BaseRepository {
  async findAll(): Promise<Game[]> {
    const result = await this.db.game.findMany({
      include: {
        players: true,
        enemies: true,
      },
    });
    return result as unknown as Game[];
  }

  async exists(id: string): Promise<boolean> {
    const game = await this.db.game.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!game;
  }

  async create(data: {
    lobbyId: string;
    phase: GamePhase;
    currentFloor: number;
    seed: string;
    turnOrder: string[];
  }): Promise<Game> {
    const result = await this.db.game.create({
      data: {
        lobbyId: data.lobbyId,
        phase: data.phase,
        currentFloor: data.currentFloor,
        seed: data.seed,
        turnOrder: data.turnOrder,
        currentTurn: 0,
      },
      include: {
        players: true,
        enemies: true,
      },
    });
    return result as unknown as Game;
  }

  async findById(id: string): Promise<Game> {
    const game = await this.db.game.findUnique({
      where: { id },
      include: {
        players: true,
        enemies: true,
      },
    });
    if (!game) {
      throw new NotFoundError(`Game ${id} not found`);
    }
    return game as unknown as Game;
  }

  async findByLobbyId(lobbyId: string): Promise<Game | null> {
    const result = await this.db.game.findUnique({
      where: { lobbyId },
      include: {
        players: true,
        enemies: true,
      },
    });
    return result as unknown as Game | null;
  }

  async update(
    id: string,
    data: {
      phase?: GamePhase;
      currentFloor?: number;
      turnOrder?: string[];
      currentTurn?: number;
    }
  ): Promise<Game> {
    const result = await this.db.game.update({
      where: { id },
      data,
      include: {
        players: true,
        enemies: true,
      },
    });
    return result as unknown as Game;
  }

  async delete(id: string): Promise<void> {
    await this.db.game.delete({ where: { id } });
  }

  async createPlayerState(data: {
    gameId: string;
    userId: string;
    hp: number;
    maxHp: number;
    deck: any;
    hand: any;
    discard: any;
    bonuses: any;
    order: number;
  }): Promise<PlayerState> {
    const result = await this.db.playerState.create({
      data,
    });
    return result as unknown as PlayerState;
  }

  async updatePlayerState(
    id: string,
    data: {
      hp?: number;
      deck?: any;
      hand?: any;
      discard?: any;
      bonuses?: any;
      isAlive?: boolean;
    }
  ): Promise<PlayerState> {
    const result = await this.db.playerState.update({
      where: { id },
      data,
    });
    return result as unknown as PlayerState;
  }

  async createEnemyState(data: {
    gameId: string;
    type: string;
    hp: number;
    maxHp: number;
    intent: any;
    order: number;
  }): Promise<EnemyState> {
    const result = await this.db.enemyState.create({
      data,
    });
    return result as unknown as EnemyState;
  }

  async updateEnemyState(
    id: string,
    data: {
      hp?: number;
      intent?: any;
    }
  ): Promise<EnemyState> {
    const result = await this.db.enemyState.update({
      where: { id },
      data,
    });
    return result as unknown as EnemyState;
  }

  async deleteEnemyState(id: string): Promise<void> {
    await this.db.enemyState.delete({ where: { id } });
  }
}
