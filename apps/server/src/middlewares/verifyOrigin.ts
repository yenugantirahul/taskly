import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const allowedOrigin = new URL(env.APP_URL).origin;

// CSRF defense in depth on top of the SameSite=Lax session cookie. Browsers
// attach an Origin header to every cross-origin request and to same-origin
// POST/PATCH/DELETE, so a state-changing request from another site (including
// a sibling subdomain, which SameSite treats as "same site") is rejected here.
// Requests without an Origin come from non-browser clients, which can't ride
// on a victim's cookies, so they're allowed through.
export const verifyOrigin: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  if (origin !== undefined && origin !== allowedOrigin) {
    throw new AppError(403, "FORBIDDEN_ORIGIN", "Request origin not allowed");
  }
  next();
};
