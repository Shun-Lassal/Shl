import type { Request, Response } from "express";
import { GameScoreService } from "./gameScore.service.ts";

const gScoreService = new GameScoreService();

export class GameScoreController {
  static async listGameScores(req: Request, res: Response) {
    try {
      const lobbyId = typeof req.query.lobbyId === "string" ? req.query.lobbyId : undefined;
      const scores = await gScoreService.listGameScores(lobbyId);
      res.status(200).json(scores);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async getGameScore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const score = await gScoreService.getGameScore(id);
      res.status(200).json(score);
    } catch (e) {
      res.status(404).json({ error: e });
    }
  }

  static async createGameScore(req: Request, res: Response) {
    try {
      const { userId, lobbyId, position } = req.body;
      const parsedPosition = Number(position);
      const score = await gScoreService.createGameScore({ userId, lobbyId, position: parsedPosition });
      res.status(201).json(score);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async updateGameScorePosition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { position } = req.body;
      const parsedPosition = Number(position);
      const score = await gScoreService.updateGameScorePosition(id, parsedPosition);
      res.status(200).json(score);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async deleteGameScore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await gScoreService.deleteGameScore(id);
      res.status(200).json({ message: "GameScore deleted successfully" });
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }
}
