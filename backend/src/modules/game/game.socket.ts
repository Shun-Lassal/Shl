import type { Server, Socket } from "socket.io";
import { GameService } from "./game.service.ts";
import { gameActionSchema, startGameSchema } from "./game.model.ts";
import { gameRoomName } from "./game.realtime.ts";

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

export function registerGameSocketHandlers(io: Server): void {
  const gameService = new GameService();

  io.on("connection", (socket) => {
    socket.on("game:start", async (payload) => {
      const parsed = startGameSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("game:error", { message: "Invalid start game payload" });
        return;
      }

      try {
        const game = await gameService.startGame(parsed.data.lobbyId);
        
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

        socket.emit("game:started", { game });
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
        const game = await gameService.executeAction(parsed.data);
        // emitGameUpdate called in service
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
