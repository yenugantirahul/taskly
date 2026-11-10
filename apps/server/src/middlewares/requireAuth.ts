import type { RequestHandler } from "express";
import { getSessionUser } from "../services/session.service.js";
import { AppError } from "../utils/AppError.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const token: unknown = req.cookies?.session;
    // Session tokens are 32 random bytes encoded as base64url.
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
        throw new AppError(401, "UNAUTHORIZED", "Please sign in.");
    }

    const user = await getSessionUser(token);
    if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Please sign in.");
    }

    req.user = user;
    next();
};
