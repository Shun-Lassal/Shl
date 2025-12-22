import { GamePhase } from "@prisma/client";
import { z } from "zod";

export type CardSuit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES" | "JOKER";
export type CardRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "JOKER";

export interface Card {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  value: number;
}

export interface PlayerState {
  id: string;
  gameId: string;
  userId: string;
  hp: number;
  maxHp: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  bonuses: any[];
  isAlive: boolean;
  order: number;
}

export interface EnemyState {
  id: string;
  gameId: string;
  type: string;
  hp: number;
  maxHp: number;
  intent: EnemyIntent;
  order: number;
}

export interface EnemyIntent {
  type: "ATTACK" | "DEFEND" | "SPECIAL";
  value: number;
  targets?: string[];
}

export interface Game {
  id: string;
  lobbyId: string;
  phase: GamePhase;
  currentFloor: number;
  seed: string;
  turnOrder: string[];
  currentTurn: number;
  players: PlayerState[];
  enemies: EnemyState[];
  createdAt: Date;
  updatedAt: Date;
}

export const gameActionSchema = z.object({
  gameId: z.string().uuid(),
  playerId: z.string().uuid(),
  action: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("PLAY_CARD"),
      cardId: z.string().uuid(),
      targetIds: z.array(z.string().uuid()).optional(),
    }),
    z.object({
      type: z.literal("END_TURN"),
    }),
  ]),
});

export type GameAction = z.infer<typeof gameActionSchema>;

export const startGameSchema = z.object({
  lobbyId: z.string().uuid(),
});

export type StartGame = z.infer<typeof startGameSchema>;
