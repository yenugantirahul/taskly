import type { RequestHandler } from "express";
import { getSessionUser, SESSION_COOKIE, SESSION_TOKEN_PATTERN } from "../services/session.service.js";
import { AppError } from "../utils/AppError.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token !== "string" || !SESSION_TOKEN_PATTERN.test(token)) {
        throw new AppError(401, "UNAUTHORIZED", "Please sign in.");
    }

    const user = await getSessionUser(token);
    if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Please sign in.");
    }

    req.user = user;
    next();
};
