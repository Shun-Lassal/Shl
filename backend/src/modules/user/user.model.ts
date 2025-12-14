import { Role } from "@prisma/client";
import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid().optional(),
  email: z.email().max(128).optional(),
  name: z.string().trim().min(3).max(64).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(Role).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

export const newUserSchema = z.object({
  email: z.email().max(128),
  name: z.string().trim().min(3).max(64),
  password: z.string().min(8).max(128),
  role: z.enum(Role),
});

export type NewUser = z.infer<typeof newUserSchema>;

export const userPublicSchema = z.object({
  id: z.uuid(),
  email: z.email().max(128),
  name: z.string().trim().min(3).max(64),
});

export type UserPublic = z.infer<typeof userPublicSchema>;
