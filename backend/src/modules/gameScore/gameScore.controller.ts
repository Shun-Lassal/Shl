import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.ts";
import { GameScoreService } from "./gameScore.service.ts";
import type { GameScoreWithRelations } from "./gameScore.model.ts";

export class GameScoreController extends BaseController {
  private gameScoreService: GameScoreService;

  constructor() {
    super();
    this.gameScoreService = new GameScoreService();
  }

  async listGameScores(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const lobbyId = typeof req.query.lobbyId === "string" ? req.query.lobbyId : undefined;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
      const take = req.query.take ? parseInt(req.query.take as string) : 10;

      const scores = await this.gameScoreService.listGameScores({
        lobbyId,
        skip,
        take,
      });

      this.sendSuccess(res, scores, "GameScores retrieved successfully");
    }, req, res);
  }

  async getGameScore(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const score = await this.gameScoreService.getGameScore(id);
      this.sendSuccess(res, score);
    }, req, res);
  }

  async createGameScore(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { userId, lobbyId, position } = req.body;
      const score = await this.gameScoreService.createGameScore({
        userId,
        lobbyId,
        position: parseInt(position),
      });

      this.sendSuccess(res, score, "GameScore created successfully", 201);
    }, req, res);
  }

  async updateGameScorePosition(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const { position } = req.body;
      const score = await this.gameScoreService.updateGameScorePosition(id, parseInt(position));
      this.sendSuccess(res, score, "GameScore updated successfully");
    }, req, res);
  }

  async deleteGameScore(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      await this.gameScoreService.deleteGameScore(id);
      this.sendSuccess(res, null, "GameScore deleted successfully");
    }, req, res);
  }

  async getScoreboard(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
      const take = req.query.take ? parseInt(req.query.take as string) : 200;

      const scores = await this.gameScoreService.listGameScores({ skip, take });

      type Run = {
        lobbyId: string;
        lobbyName: string;
        endedAt: string | null;
        position: number;
        players: { userId: string; name: string; position: number }[];
      };

      type ScoreWithGame = GameScoreWithRelations & {
        lobby?: { game?: { updatedAt?: Date; phase?: string } } | null;
      };

      const byLobby = new Map<string, { lobbyName: string; endedAt: string | null; items: GameScoreWithRelations[] }>();
      for (const raw of scores) {
        const s = raw as ScoreWithGame;
        // Only show finished runs (scores are normally written at GAME_OVER).
        if (s.lobby?.status !== "ENDED" && s.lobby?.game?.phase !== "GAME_OVER") continue;

        const lobbyId = s.lobbyId;
        const lobbyName = s.lobby?.name ?? lobbyId;
        const endedAt = s.lobby?.game?.updatedAt
          ? new Date(s.lobby.game.updatedAt).toISOString()
          : null;
        const existing = byLobby.get(lobbyId);
        if (existing) {
          // keep most recent endedAt if present
          const nextEndedAt = endedAt ?? existing.endedAt;
          byLobby.set(lobbyId, { ...existing, endedAt: nextEndedAt, items: [...existing.items, s] });
        } else {
          byLobby.set(lobbyId, { lobbyName, endedAt, items: [s] });
        }
      }

      const runs: Run[] = Array.from(byLobby.entries()).map(([lobbyId, payload]) => {
        const positions = payload.items.map((x) => x.position);
        const position = positions.some((p) => p === -1) ? -1 : Math.max(...positions);
        const players = payload.items
          .map((x) => ({
            userId: x.userId,
            name: x.user?.name ?? x.userId,
            position: x.position,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          lobbyId,
          lobbyName: payload.lobbyName,
          endedAt: payload.endedAt,
          position,
          players,
        };
      });

      runs.sort((a, b) => {
        const at = a.endedAt ? new Date(a.endedAt).getTime() : 0;
        const bt = b.endedAt ? new Date(b.endedAt).getTime() : 0;
        return bt - at;
      });

      this.sendSuccess(res, runs, "Scoreboard retrieved successfully");
    }, req, res);
  }

  // Static methods for route handlers
  static listGameScores = (req: Request, res: Response) => {
    new GameScoreController().listGameScores(req, res);
  };

  static getGameScore = (req: Request, res: Response) => {
    new GameScoreController().getGameScore(req, res);
  };

  static createGameScore = (req: Request, res: Response) => {
    new GameScoreController().createGameScore(req, res);
  };

  static updateGameScorePosition = (req: Request, res: Response) => {
    new GameScoreController().updateGameScorePosition(req, res);
  };

  static deleteGameScore = (req: Request, res: Response) => {
    new GameScoreController().deleteGameScore(req, res);
  };

  static getScoreboard = (req: Request, res: Response) => {
    new GameScoreController().getScoreboard(req, res);
  };
}
