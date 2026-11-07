import { z } from "zod";

export const registerschema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
})

export type LoginSchema = z.infer<typeof loginSchema>;




export type RegisterInput = z.infer<typeof registerschema>;
