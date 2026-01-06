import cookieParser from "cookie-parser";
import { z } from "zod";
import type { Server, Socket } from "socket.io";
import { sessionCookieChecker } from "../../shared/sessionCookie.service.js";
import { LobbyService } from "./lobby.service.js";
import {
  emitLobbyChatMessage,
  emitLobbyUpdate,
  emitSystemMessage,
  getLobbyChatHistory,
  lobbyRoomName,
} from "./lobby.realtime.js";

const joinSchema = z.object({ lobbyId: z.uuid() });
const leaveSchema = z.object({ lobbyId: z.uuid() });
const chatSchema = z.object({ lobbyId: z.uuid(), message: z.string().trim().min(1).max(500) });

type SocketAuthData = {
  sessionId: string;
  userId: string;
};

function parseSignedSessionId(socket: Socket, secret: string): string {
  const rawCookie = socket.handshake.headers.cookie;
  if (!rawCookie) {
    throw new Error("Missing auth cookie");
  }

  const cookies = Object.fromEntries(
    rawCookie
      .split(";")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((pair) => {
        const [key, ...rest] = pair.split("=");
        return [key, rest.join("=")];
      })
  );

  const signed = cookies["sid"];
  if (!signed) {
    throw new Error("Missing session id cookie");
  }

  const unsigned = cookieParser.signedCookie(decodeURIComponent(signed), secret);
  if (typeof unsigned !== "string") {
    throw new Error("Invalid session signature");
  }

  return unsigned;
}

async function authenticateSocket(socket: Socket, secret: string): Promise<SocketAuthData> {
  const checker = new sessionCookieChecker();
  const sessionId = parseSignedSessionId(socket, secret);
  const session = await checker.getSessionFromCookie(sessionId);
  const valid = await checker.isSessionValid(session);

  if (!valid) {
    throw new Error("Session expired");
  }

  return { sessionId: session.id, userId: session.userId };
}

function ensureJoined(socket: Socket, lobbyId: string): boolean {
  return socket.rooms.has(lobbyRoomName(lobbyId));
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

export function registerLobbySocketHandlers(io: Server, options: { cookieSecret: string }): void {
  const lobbyService = new LobbyService();

  io.use(async (socket, next) => {
    try {
      const auth = await authenticateSocket(socket, options.cookieSecret);
      socket.data.auth = auth;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });

  io.on("connection", (socket) => {
    socket.on("lobby:join", async (payload) => {
      const parsed = joinSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("lobby:error", { message: "Invalid lobby id" });
        return;
      }

      try {
        const lobby = await lobbyService.getLobbyById(parsed.data.lobbyId);
        await socket.join(lobbyRoomName(lobby.id));

        // Send immediate state to the newly joined socket
        socket.emit("lobby:update", { lobby, messages: getLobbyChatHistory(lobby.id) });

        emitLobbyUpdate(lobby, {
          systemMessage: `User ${socket.data.auth?.userId ?? "unknown"} joined the lobby`,
          authorId: socket.data.auth?.userId ?? null,
        });
      } catch (error) {
        socket.emit("lobby:error", { message: formatError(error) });
      }
    });

    socket.on("lobby:leave", async (payload) => {
      const parsed = leaveSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("lobby:error", { message: "Invalid lobby id" });
        return;
      }

      try {
        const lobby = await lobbyService.getLobbyById(parsed.data.lobbyId);
        await socket.leave(lobbyRoomName(lobby.id));

        emitSystemMessage(lobby.id, `User ${socket.data.auth?.userId ?? "unknown"} left the lobby`);
        emitLobbyUpdate(lobby);
      } catch (error) {
        socket.emit("lobby:error", { message: formatError(error) });
      }
    });

    socket.on("lobby:chat", async (payload) => {
      const parsed = chatSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("lobby:error", { message: "Invalid chat payload" });
        return;
      }

      if (!ensureJoined(socket, parsed.data.lobbyId)) {
        socket.emit("lobby:error", { message: "Join the lobby before chatting" });
        return;
      }

      try {
        emitLobbyChatMessage(parsed.data.lobbyId, parsed.data.message, socket.data.auth?.userId ?? null);
      } catch (error) {
        socket.emit("lobby:error", { message: formatError(error) });
      }
    });
  });
}
