import { z } from "zod";

export const sessionSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Session = z.infer<typeof sessionSchema>;
