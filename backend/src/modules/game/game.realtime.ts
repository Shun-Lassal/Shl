import { randomUUID } from "node:crypto";
import type { Server as SocketIOServer } from "socket.io";
import type { Game } from "./game.model.js";
import type { Card } from "./game.model.js";

let io: SocketIOServer | null = null;

export function initGameRealtime(ioInstance: SocketIOServer): void {
  io = ioInstance;
}

export const gameRoomName = (gameId: string) => `game:${gameId}`;

export function emitGameUpdate(game: Game): void {
  if (!io) return;
  io.to(gameRoomName(game.id)).emit("game:update", { game });
}

export function emitGamePlanning(
  gameId: string,
  payload: { endsAt: number; confirmedUserIds: string[]; plannedActionsByUserId?: Record<string, unknown> }
): void {
  if (!io) return;
  io.to(gameRoomName(gameId)).emit("game:planning", { gameId, ...payload });
}

export function emitGameReward(
  gameId: string,
  payload: { endsAt: number; confirmedUserIds: string[]; options: Card[]; pickedByUserId?: Record<string, string> }
): void {
  if (!io) return;
  io.to(gameRoomName(gameId)).emit("game:reward", { gameId, ...payload });
}

export function emitGamePhaseChange(game: Game, phase: string): void {
  if (!io) return;
  io.to(gameRoomName(game.id)).emit("game:phase_change", { game, phase });
}

export function emitGameOver(gameId: string, winners: string[], finalFloor: number): void {
  if (!io) return;
  io.to(gameRoomName(gameId)).emit("game:over", {
    gameId,
    winners,
    finalFloor,
  });
}

export function emitTurnChange(gameId: string, currentPlayerId: string, turnIndex: number): void {
  if (!io) return;
  io.to(gameRoomName(gameId)).emit("game:turn_change", {
    gameId,
    currentPlayerId,
    turnIndex,
  });
}
