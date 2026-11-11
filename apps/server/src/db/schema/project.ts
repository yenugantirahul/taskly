import { pgTable, pgEnum, uuid, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth.js';

// Kept in sync with PROJECT_TYPES in validators/project.schema.ts.
export const projectType = pgEnum('project_type', [
    'software',
    'marketing',
    'design',
    'operations',
    'personal',
]);

export const projects = pgTable(
    'project',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        ownerId: uuid('owner_id')
            .notNull()
            .references(() => users.id),
        name: text('name').notNull(),
        slug: text('slug').notNull(),
        // Existing rows predate project types; they become "software".
        type: projectType('type').default('software').notNull(),
        createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex('project_owner_id_slug_unique').on(table.ownerId, table.slug),
        index('project_owner_id_idx').on(table.ownerId),
    ]
);

// Drizzle Relations API definition
export const projectsRelations = relations(projects, ({ one }) => ({
    owner: one(users, {
        fields: [projects.ownerId],
        references: [users.id],
    }),
}));
