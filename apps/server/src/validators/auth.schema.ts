import { z } from "zod";

export const registerschema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
  remember: z.boolean().default(false),
});

export const resendVerificationSchema = loginSchema.pick({
  email: true,
  password: true,
});

export const verifyEmailSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Invalid token"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerschema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
