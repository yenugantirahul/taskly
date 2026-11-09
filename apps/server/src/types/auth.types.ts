import { users } from "../db/schema/index.js";

export type RegisterResult = Pick<typeof users.$inferSelect, "id" | "email" | "name">;
