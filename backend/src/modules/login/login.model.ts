import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(128),
  password: z.string().min(4).max(128),
});

export type Login = z.infer<typeof loginSchema>;
