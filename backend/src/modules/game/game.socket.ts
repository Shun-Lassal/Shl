import type { Server, Socket } from "socket.io";
import { GameService } from "./game.service.js";
import { gameActionSchema, startGameSchema } from "./game.model.js";
import { emitGameUpdate, gameRoomName } from "./game.realtime.js";
import { z } from "zod";

const joinGameSchema = z.object({ gameId: z.string().uuid() });
const leaveGameSchema = z.object({ gameId: z.string().uuid() });
const confirmSchema = z.object({ gameId: z.string().uuid() });
const rewardPickSchema = z.object({ gameId: z.string().uuid(), cardId: z.string().uuid().nullable().optional() });
const rewardConfirmSchema = z.object({ gameId: z.string().uuid() });

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

export function registerGameSocketHandlers(io: Server): void {
  const gameService = new GameService();

  io.on("connection", (socket) => {
    socket.on("game:join", async (payload) => {
      const parsed = joinGameSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("game:error", { message: "Invalid join payload" });
        return;
      }

      try {
        const userId = socket.data.auth?.userId;
        if (!userId) {
          socket.emit("game:error", { message: "Unauthorized" });
          return;
        }

        const game = await gameService.getGame(parsed.data.gameId);
        const isPlayer = game.players.some((p) => p.userId === userId);
        if (!isPlayer) {
          socket.emit("game:error", { message: "You are not a player in this game" });
          return;
        }

        await socket.join(gameRoomName(game.id));
        socket.emit("game:update", { game });

        // Ensure planning exists for battle games, and send planning state to joining socket
        if (game.phase === "BATTLE") {
          const planning = gameService.getPlanningState(game.id);
          if (planning) {
            socket.emit("game:planning", { gameId: game.id, ...planning });
          } else {
            await gameService.startPlanningRound(game.id);
          }
        }

        if (game.phase === "REWARD") {
          const reward = gameService.getRewardState(game.id);
          if (reward) {
            socket.emit("game:reward", { gameId: game.id, ...reward });
          } else {
            await gameService.startRewardPhase(game.id);
          }
        }
      } catch (error) {
        socket.emit("game:error", { message: formatError(error) });
      }
    });

    socket.on("game:leave", async (payload) => {
      const parsed = leaveGameSchema.safeParse(payload);
      if (!parsed.success) return;
      await socket.leave(gameRoomName(parsed.data.gameId));
    });

    socket.on("game:start", async (payload) => {
      const parsed = startGameSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("game:error", { message: "Invalid start game payload" });
        return;
      }

      try {
        const userId = socket.data.auth?.userId;
        if (!userId) {
          socket.emit("game:error", { message: "Unauthorized" });
          return;
        }

        const game = await gameService.startGame(parsed.data.lobbyId, userId);
        
        // Join all connected players to game room
        const sockets = await io.fetchSockets();
        for (const s of sockets) {
          if (s.data.auth?.userId) {
            const isPlayer = game.players.some((p) => p.userId === s.data.auth.userId);
            if (isPlayer) {
              await s.join(gameRoomName(game.id));
            }
          }
        }

        io.to(gameRoomName(game.id)).emit("game:started", { game });
        emitGameUpdate(game);
        await gameService.startPlanningRound(game.id);
      } catch (error) {
        socket.emit("game:error", { message: formatError(error) });
      }
    });

    socket.on("game:action", async (payload) => {
      const parsed = gameActionSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("game:error", { message: "Invalid game action" });
        return;
      }

      try {
        const userId = socket.data.auth?.userId;
        if (!userId) {
          socket.emit("game:error", { message: "Unauthorized" });
          return;
        }
        if (parsed.data.playerId !== userId) {
          socket.emit("game:error", { message: "Cannot act for another player" });
          return;
        }

        await socket.join(gameRoomName(parsed.data.gameId));

        // In planning mode, actions are submissions (not immediately executed)
        gameService.submitPlannedAction(parsed.data.gameId, userId, parsed.data.action);
      } catch (error) {
        socket.emit("game:error", { message: formatError(error) });
      }
    });

    socket.on("game:confirm", async (payload) => {
      const parsed = confirmSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("game:error", { message: "Invalid confirm payload" });
        return;
      }

      try {
        const userId = socket.data.auth?.userId;
        if (!userId) {
          socket.emit("game:error", { message: "Unauthorized" });
          return;
        }
        await socket.join(gameRoomName(parsed.data.gameId));
        gameService.confirmPlannedAction(parsed.data.gameId, userId);
      } catch (error) {
        socket.emit("game:error", { message: formatError(error) });
      }
    });

    socket.on("game:reward_pick", async (payload) => {
      const parsed = rewardPickSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("game:error", { message: "Invalid reward pick payload" });
        return;
      }

      try {
        const userId = socket.data.auth?.userId;
        if (!userId) {
          socket.emit("game:error", { message: "Unauthorized" });
          return;
        }
        await socket.join(gameRoomName(parsed.data.gameId));
        gameService.pickReward(parsed.data.gameId, userId, parsed.data.cardId);
      } catch (error) {
        socket.emit("game:error", { message: formatError(error) });
      }
    });

    socket.on("game:reward_confirm", async (payload) => {
      const parsed = rewardConfirmSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("game:error", { message: "Invalid reward confirm payload" });
        return;
      }

      try {
        const userId = socket.data.auth?.userId;
        if (!userId) {
          socket.emit("game:error", { message: "Unauthorized" });
          return;
        }
        await socket.join(gameRoomName(parsed.data.gameId));
        gameService.confirmReward(parsed.data.gameId, userId);
      } catch (error) {
        socket.emit("game:error", { message: formatError(error) });
      }
    });

    socket.on("game:get_state", async (payload: { gameId: string }) => {
      try {
        const game = await gameService.getGame(payload.gameId);
        socket.emit("game:update", { game });
      } catch (error) {
        socket.emit("game:error", { message: formatError(error) });
      }
    });
  });
}
