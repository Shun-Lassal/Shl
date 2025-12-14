import { Role } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(64),
  email: z.email().max(128),
  password: z.string().min(8).max(128),
  role: z.enum(Role).optional().default(Role.USER),
});

export type Register = z.infer<typeof registerSchema>;
