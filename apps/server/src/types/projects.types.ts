import { projects } from "../db/schema/project.js";

// What the API returns for a project. ownerId is left out: it's always the caller.
export type ProjectResult = Pick<
    typeof projects.$inferSelect,
    "id" | "name" | "slug" | "type" | "createdAt" | "updatedAt"
>;
