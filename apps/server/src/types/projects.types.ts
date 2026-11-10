import { projects } from "../db/schema/project.js";

export type CreateProjectResult = Pick<typeof projects.$inferSelect, "id" | "name" | "slug">