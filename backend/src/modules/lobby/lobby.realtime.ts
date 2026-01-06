import { randomUUID } from "node:crypto";
import type { Server as SocketIOServer } from "socket.io";
import type { Lobby } from "./lobby.model.js";

export type LobbyChatMessage = {
  id: string;
  type: "system" | "chat";
  authorId: string | null;
  content: string;
  timestamp: number;
};

const MAX_MESSAGES = 15;
const lobbyMessages = new Map<string, LobbyChatMessage[]>();
let io: SocketIOServer | null = null;

export const lobbyRoomName = (lobbyId: string) => `lobby:${lobbyId}`;

export function initLobbyRealtime(ioInstance: SocketIOServer): void {
  io = ioInstance;
}

export function getLobbyChatHistory(lobbyId: string): LobbyChatMessage[] {
  return lobbyMessages.get(lobbyId) ?? [];
}

function pushMessage(lobbyId: string, message: LobbyChatMessage): LobbyChatMessage[] {
  const messages = [...getLobbyChatHistory(lobbyId), message];
  while (messages.length > MAX_MESSAGES) {
    messages.shift();
  }
  lobbyMessages.set(lobbyId, messages);
  return messages;
}

function broadcastChat(lobbyId: string, payload: { message: LobbyChatMessage; messages: LobbyChatMessage[] }): void {
  if (!io) return;
  io.to(lobbyRoomName(lobbyId)).emit("lobby:chat", payload);
}

export function emitLobbyChatMessage(lobbyId: string, content: string, authorId: string | null): LobbyChatMessage {
  const message: LobbyChatMessage = {
    id: randomUUID(),
    type: "chat",
    authorId,
    content,
    timestamp: Date.now(),
  };
  const messages = pushMessage(lobbyId, message);
  broadcastChat(lobbyId, { message, messages });
  return message;
}

export function emitSystemMessage(lobbyId: string, content: string): LobbyChatMessage {
  const message: LobbyChatMessage = {
    id: randomUUID(),
    type: "system",
    authorId: null,
    content,
    timestamp: Date.now(),
  };
  const messages = pushMessage(lobbyId, message);
  broadcastChat(lobbyId, { message, messages });
  return message;
}

export function emitLobbyUpdate(
  lobby: Lobby,
  options?: {
    systemMessage?: string;
    authorId?: string | null;
  }
): void {
  if (!io) return;
  const { systemMessage } = options ?? {};
  let messages = getLobbyChatHistory(lobby.id);

  if (systemMessage) {
    const systemMsg: LobbyChatMessage = {
      id: randomUUID(),
      type: "system",
      authorId: options?.authorId ?? null,
      content: systemMessage,
      timestamp: Date.now(),
    };
    messages = pushMessage(lobby.id, systemMsg);
  }

  io.to(lobbyRoomName(lobby.id)).emit("lobby:update", { lobby, messages });
}

export function emitLobbyClosed(lobbyId: string, reason?: string): void {
  if (!io) return;
  const message = reason ? emitSystemMessage(lobbyId, reason) : null;
  io.to(lobbyRoomName(lobbyId)).emit("lobby:closed", {
    lobbyId,
    reason: reason ?? "Lobby closed",
    message,
    messages: getLobbyChatHistory(lobbyId),
  });
  lobbyMessages.delete(lobbyId);
  io.in(lobbyRoomName(lobbyId)).socketsLeave(lobbyRoomName(lobbyId));
}

export function clearLobbyHistory(lobbyId: string): void {
  lobbyMessages.delete(lobbyId);
}
