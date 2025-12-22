import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.ts";
import { UnauthorizedError } from "../../shared/errors.ts";
import { LobbyService } from "./lobby.service.ts";
import type { Lobby } from "./lobby.model.ts";
import type { LobbyUpdateData } from "./lobby.repository.ts";

export class LobbyController extends BaseController {
  private lobbyService: LobbyService;

  constructor() {
    super();
    this.lobbyService = new LobbyService();
  }

  async createLobby(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { name, slots, password } = req.body;
      const ownerId = res.locals.userId;
      if (!ownerId) {
        throw new UnauthorizedError("Session userId not defined");
      }

      const lobby = await this.lobbyService.createLobby({
        name,
        slots: Number(slots),
        ownerId,
        password: password ?? null,
        status: "WAITING",
      });

      this.sendSuccess(res, lobby, "Lobby created successfully", 201);
    }, req, res);
  }

  async listLobbies(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
      const take = req.query.take ? parseInt(req.query.take as string) : 10;

      const lobbies = await this.lobbyService.listLobbies({ skip, take });
      this.sendSuccess(res, lobbies, "Lobbies retrieved successfully");
    }, req, res);
  }

  async getLobbyById(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const lobby = await this.lobbyService.getLobbyById(id);
      this.sendSuccess(res, lobby);
    }, req, res);
  }

  async updateLobby(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const { status, name, slots, ownerId, password } = req.body;

      const data: LobbyUpdateData = {};
      if (typeof status === "string") {
        data.status = status as Lobby["status"];
      }
      if (typeof name === "string") {
        data.name = name;
      }
      if (typeof slots !== "undefined") {
        data.slots = Number(slots);
      }
      if (typeof ownerId === "string") {
        data.ownerId = ownerId;
      }
      if (typeof password !== "undefined") {
        data.password = password;
      }

      const lobby = await this.lobbyService.updateLobby(id, data);
      this.sendSuccess(res, lobby, "Lobby updated successfully");
    }, req, res);
  }

  async setLobbyPlayers(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const { players } = req.body;

      const lobby = await this.lobbyService.setLobbyPlayers(
        id,
        Array.isArray(players) ? players : []
      );

      this.sendSuccess(res, lobby, "Lobby players updated successfully");
    }, req, res);
  }

  async addPlayerToLobby(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const { password } = req.body;
      const playerId = res.locals.userId;
      if (!playerId) {
        throw new UnauthorizedError("Session userId not defined");
      }

      const lobby = await this.lobbyService.addPlayerToLobby(id, playerId, password);
      this.sendSuccess(res, lobby, "Player added to lobby");
    }, req, res);
  }

  async removePlayerFromLobby(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id, playerId: playerIdParam } = req.params;
      const playerId = res.locals.userId;
      if (!playerId) {
        throw new UnauthorizedError("Session userId not defined");
      }
      if (playerIdParam && playerIdParam !== playerId) {
        throw new UnauthorizedError("Cannot remove another player");
      }

      const lobby = await this.lobbyService.removePlayerFromLobby(id, playerId);
      if (lobby) {
        this.sendSuccess(res, lobby, "Player removed from lobby");
      } else {
        this.sendSuccess(res, null, "Lobby deleted (last player left)");
      }
    }, req, res);
  }

  async deleteLobby(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      await this.lobbyService.deleteLobby(id);
      this.sendSuccess(res, null, "Lobby deleted successfully");
    }, req, res);
  }

  // Static methods for route handlers
  static createLobby = (req: Request, res: Response) => {
    new LobbyController().createLobby(req, res);
  };

  static listLobbies = (req: Request, res: Response) => {
    new LobbyController().listLobbies(req, res);
  };

  static getLobbyById = (req: Request, res: Response) => {
    new LobbyController().getLobbyById(req, res);
  };

  static updateLobby = (req: Request, res: Response) => {
    new LobbyController().updateLobby(req, res);
  };

  static setLobbyPlayers = (req: Request, res: Response) => {
    new LobbyController().setLobbyPlayers(req, res);
  };

  static addPlayerToLobby = (req: Request, res: Response) => {
    new LobbyController().addPlayerToLobby(req, res);
  };

  static removePlayerFromLobby = (req: Request, res: Response) => {
    new LobbyController().removePlayerFromLobby(req, res);
  };

  static deleteLobby = (req: Request, res: Response) => {
    new LobbyController().deleteLobby(req, res);
  };
}
