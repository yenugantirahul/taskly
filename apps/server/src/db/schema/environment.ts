import { pgEnum, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./project.js";

// Staging will be added here later (ALTER TYPE ... ADD VALUE).
export const environmentType = pgEnum("environment_type", ["development", "production"]);

// Created automatically with every new project.
export const DEFAULT_ENVIRONMENTS = ["development", "production"] as const satisfies readonly (typeof environmentType.enumValues)[number][];

export const environments = pgTable(
    "environment",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        type: environmentType("type").notNull(),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    },
    (table) => [
        // One environment of each type per project. Also serves lookups by project_id.
        uniqueIndex("environment_project_id_type_unique").on(table.projectId, table.type),
    ]
);

export const environmentsRelations = relations(environments, ({ one }) => ({
    project: one(projects, {
        fields: [environments.projectId],
        references: [projects.id],
    }),
}));
