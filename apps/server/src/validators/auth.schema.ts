import { z } from "zod";

export const registerschema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
  remember: z.boolean().default(false),
});

export const verifyEmailSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Invalid token"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerschema>;
