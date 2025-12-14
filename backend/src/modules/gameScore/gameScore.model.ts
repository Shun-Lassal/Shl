import { z } from "zod";
import { lobbySummarySchema } from "../lobby/lobby.model.ts";
import { userPublicSchema } from "../user/user.model.ts";

export const gameScoreSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  lobbyId: z.uuid(),
  position: z.number().int().min(1),
});

export type GameScore = z.infer<typeof gameScoreSchema>;

export const newGameScoreSchema = gameScoreSchema.omit({ id: true });

export type NewGameScore = z.infer<typeof newGameScoreSchema>;

export const gameScoreWithRelationsSchema = gameScoreSchema.extend({
  user: userPublicSchema.optional(),
  lobby: lobbySummarySchema.optional(),
});

export type GameScoreWithRelations = z.infer<typeof gameScoreWithRelationsSchema>;
