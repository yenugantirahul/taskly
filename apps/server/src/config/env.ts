import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  HOST: z.string(),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url(),
  SMTP_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1),
  MIGRATE_ON_START: z.enum(["true", "false"]).default("false")
    .transform((value) => value === "true"),
  // Optional: when unset (e.g. in tests), caching is turned off.
  REDIS_URL: z.string().url().optional(),
}).superRefine((value, ctx) => {
  if (!value.SMTP_URL && !value.RESEND_API_KEY) {
    ctx.addIssue({
      code: "custom",
      path: ["RESEND_API_KEY"],
      message: "Set RESEND_API_KEY or SMTP_URL for email delivery",
    });
  }
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
