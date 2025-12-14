import type { Request, Response } from "express";
import { LobbyService } from "./lobby.service.ts";
import type { Lobby } from "./lobby.model.ts";
import type { LobbyUpdateData } from "./lobby.repository.ts";

const lobbyService = new LobbyService();

export class LobbyController {
  static async createLobby(req: Request, res: Response) {
    try {
      const { name, slots, ownerId, password, players } = req.body;
      const lobby = await lobbyService.createLobby({
        name,
        slots: Number(slots),
        ownerId,
        password: password ?? null,
        players: Array.isArray(players) ? players : [],
        status: "WAITING",
      });

      res.status(201).json(lobby);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async listLobbies(req: Request, res: Response) {
    try {
      const lobbies = await lobbyService.listLobbies();
      res.status(200).json(lobbies);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async getLobbyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lobby = await lobbyService.getLobbyById(id);
      res.status(200).json(lobby);
    } catch (e) {
      res.status(404).json({ error: e });
    }
  }

  static async updateLobby(req: Request, res: Response) {
    try {
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

      const lobby = await lobbyService.updateLobby(id, data);
      res.status(200).json(lobby);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async setLobbyPlayers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { players } = req.body;
      const lobby = await lobbyService.setLobbyPlayers(id, Array.isArray(players) ? players : []);
      res.status(200).json(lobby);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async addPlayerToLobby(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { playerId } = req.body;
      const lobby = await lobbyService.addPlayerToLobby(id, playerId);
      res.status(200).json(lobby);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async removePlayerFromLobby(req: Request, res: Response) {
    try {
      const { id, playerId } = req.params;
      const lobby = await lobbyService.removePlayerFromLobby(id, playerId);
      res.status(200).json(lobby);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async deleteLobby(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await lobbyService.deleteLobby(id);
      res.status(200).json({ message: "Lobby deleted successfully" });
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }
}
