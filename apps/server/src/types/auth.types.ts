import { users } from "../db/schema/index.js";

export type RegisterResult = Pick<typeof users.$inferSelect, "id" | "email" | "name">;

export type CurrentUser = RegisterResult;

declare global {
  namespace Express {
    interface Request {
      user?: CurrentUser;
    }
  }
}
