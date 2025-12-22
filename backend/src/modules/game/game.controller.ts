import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.ts";
import { GameService } from "./game.service.ts";

export class GameController extends BaseController {
  private gameService: GameService;

  constructor() {
    super();
    this.gameService = new GameService();
  }

  async getGameByLobby(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { lobbyId } = req.params;
      const game = await this.gameService.getGameByLobbyId(lobbyId);
      this.sendSuccess(res, { game }, "Game retrieved successfully");
    }, req, res);
  }

  static getGameByLobby = (req: Request, res: Response) => {
    new GameController().getGameByLobby(req, res);
  };
}

