import { LobbyStatus } from "@prisma/client";
import { z } from "zod";

export interface Lobby {
  id: string;
  status: "WAITING" | "PLAYING" | "ENDED";
  name: string;
  slots: number;
  ownerId: string;
  players: string[];
  password?: string | null;
  gameScores?: string[];
}

export interface NewLobby {
  status: "WAITING";
  name: string;
  slots: number;
  ownerId: string;
  players: string[];
  password: string | null;
}

export const lobbySchema = z.object({
  id: z.uuid(),
  status: z.enum(LobbyStatus),
  name: z.string().trim().min(3).max(64),
  slots: z.number().int().min(1),
  ownerId: z.uuid(),
  players: z.array(z.uuid()),
  password: z.string().min(1).max(128).nullable().optional(),
  gameScores: z.array(z.uuid()).optional(),
});

export const lobbySummarySchema = lobbySchema.pick({
  id: true,
  name: true,
  status: true,
});

export const newLobbySchema = z.object({
  status: z.enum(LobbyStatus).default(LobbyStatus.WAITING),
  name: z.string().trim().min(3).max(64),
  slots: z.number().int().min(1),
  ownerId: z.uuid(),
  players: z.array(z.uuid()).default([]),
  password: z.string().min(1).max(128).nullable().optional(),
});
