import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.ts";
import { GameScoreService } from "./gameScore.service.ts";

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
}
