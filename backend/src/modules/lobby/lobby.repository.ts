import { BaseRepository } from "../../shared/base/index.ts";
import { NotFoundError, ValidationError } from "../../shared/errors.ts";
import type { Lobby, NewLobby } from "./lobby.model.ts";

export type LobbyUpdateData = {
  status?: Lobby["status"];
  name?: string;
  slots?: number;
  ownerId?: string;
  password?: string | null;
};

export class LobbyRepository extends BaseRepository {
  async create(data: NewLobby): Promise<Lobby> {
    return this.db.lobby.create({
      data: {
        status: data.status,
        name: data.name,
        slots: data.slots,
        ownerId: data.ownerId,
        password: data.password ?? null,
        players: {
          connect: { id: data.ownerId },
        },
      },
      include: { players: true },
    });
  }

  async findAll(options?: { skip?: number; take?: number }): Promise<Lobby[]> {
    return this.db.lobby.findMany({
      ...options,
      where: {
        status: { not: "ENDED" },
      },
      include: { players: true },
    });
  }

  async findById(id: string): Promise<Lobby> {
    const lobby = await this.db.lobby.findUnique({
      where: { id },
      include: { players: true },
    });
    if (!lobby) {
      throw new NotFoundError(`Lobby ${id} not found`);
    }
    return lobby as Lobby;
  }

  async findByName(name: string): Promise<Lobby | null> {
    return this.db.lobby.findFirst({
      where: { name },
      include: { players: true },
    }) as Promise<Lobby | null>;
  }

  async update(id: string, data: LobbyUpdateData): Promise<Lobby> {
    const updateData: Record<string, unknown> = {};

    if (typeof data.status !== "undefined") {
      updateData.status = data.status;
    }
    if (typeof data.name !== "undefined") {
      updateData.name = data.name;
    }
    if (typeof data.slots !== "undefined") {
      updateData.slots = data.slots;
    }
    if (typeof data.ownerId !== "undefined") {
      updateData.ownerId = data.ownerId;
    }
    if (typeof data.password !== "undefined") {
      updateData.password = data.password;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("No update data provided");
    }

    return this.db.lobby.update({
      where: { id },
      data: updateData,
      include: { players: true },
    }) as Promise<Lobby>;
  }

  async setPlayers(id: string, playerIds: string[]): Promise<Lobby> {
    return this.db.lobby.update({
      where: { id },
      data: {
        players: {
          set: playerIds.map((id) => ({ id })),
        },
      },
      include: { players: true },
    }) as Promise<Lobby>;
  }

  async addPlayer(id: string, playerId: string): Promise<Lobby> {
    const lobby = await this.findById(id);
    const playerExists = (lobby as any).players?.some((p: any) => p.id === playerId);

    if (playerExists) {
      return lobby;
    }

    return this.db.lobby.update({
      where: { id },
      data: {
        players: {
          connect: { id: playerId },
        },
      },
      include: { players: true },
    }) as Promise<Lobby>;
  }

  async removePlayer(id: string, playerId: string): Promise<Lobby> {
    const lobby = await this.findById(id);
    const players = (lobby as any).players as any[];

    if (!players.some((p) => p.id === playerId)) {
      throw new NotFoundError("Player not found in lobby");
    }

    if (players.length === 1) {
      throw new ValidationError("Cannot remove the last player from the lobby");
    }

    if (lobby.ownerId === playerId) {
      throw new ValidationError("Cannot remove the owner from the lobby");
    }

    return this.db.lobby.update({
      where: { id },
      data: {
        players: {
          disconnect: { id: playerId },
        },
      },
      include: { players: true },
    }) as Promise<Lobby>;
  }

  async delete(id: string): Promise<Lobby> {
    return this.db.lobby.delete({
      where: { id },
      include: { players: true },
    }) as Promise<Lobby>;
  }

  async deleteEnded(): Promise<number> {
    const ended = await this.db.lobby.findMany({ where: { status: "ENDED" }, select: { id: true } });
    const ids = ended.map((l) => l.id);
    if (ids.length === 0) return 0;

    await this.db.gamescore.deleteMany({ where: { lobbyId: { in: ids } } });
    const result = await this.db.lobby.deleteMany({ where: { id: { in: ids } } });
    return result.count;
  }

  async exists(id: string): Promise<boolean> {
    const lobby = await this.db.lobby.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!lobby;
  }
}
