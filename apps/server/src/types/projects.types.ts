import { projects } from "../db/schema/project.js";
import { environments } from "../db/schema/environment.js";

// What the API returns for a project. ownerId is left out: it's always the caller.
export type ProjectResult = Pick<
    typeof projects.$inferSelect,
    "id" | "name" | "slug" | "type" | "createdAt" | "updatedAt"
>;

// What the API returns for an environment. projectId is left out: it's in the URL.
export type EnvironmentResult = Pick<typeof environments.$inferSelect, "id" | "type" | "createdAt">;
