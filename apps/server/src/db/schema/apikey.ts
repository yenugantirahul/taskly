import { index, pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { projects } from "./project.js";
import { environments } from "./environment.js";
import { users } from "./auth.js";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    environmentId: uuid("environment_id")
      .notNull()
      .references(() => environments.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    // Only the hash is persisted. The complete key is returned once when it
    // is created and can never be recovered by a later GET request.
    keyHash: text("key_hash").notNull().unique(),

    keyPrefix: text("key_prefix").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    index("api_keys_user_project_environment_idx").on(
      table.userId,
      table.projectId,
      table.environmentId,
    ),
  ],
);
