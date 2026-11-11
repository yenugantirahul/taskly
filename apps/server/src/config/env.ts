import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  HOST: z.string(),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url(),
  SMTP_URL: z.string().url(),
  EMAIL_FROM: z.string().min(1),
  // Optional: when unset (e.g. in tests), caching is turned off.
  REDIS_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:");

  for (const issue of parsed.error.issues) {
    console.error(`${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

export const env = Object.freeze(parsed.data);

export type Env = z.infer<typeof envSchema>;
