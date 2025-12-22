import { z } from "zod";
import { lobbySummarySchema } from "../lobby/lobby.model.ts";
import { userPublicSchema } from "../user/user.model.ts";

export const gameScoreSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  lobbyId: z.uuid(),
  // `position` is the floor reached (>= 1). Special case: `-1` means the run was completed (finished the game).
  position: z
    .number()
    .int()
    .refine((v) => v === -1 || v >= 1, "position must be -1 (win) or >= 1 (floor reached)"),
});

export type GameScore = z.infer<typeof gameScoreSchema>;

export const newGameScoreSchema = gameScoreSchema.omit({ id: true });

export type NewGameScore = z.infer<typeof newGameScoreSchema>;

export const gameScoreWithRelationsSchema = gameScoreSchema.extend({
  user: userPublicSchema.optional(),
  lobby: lobbySummarySchema.optional(),
});

export type GameScoreWithRelations = z.infer<typeof gameScoreWithRelationsSchema>;
