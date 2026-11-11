import type { CookieOptions, Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { SESSION_COOKIE, SESSION_TOKEN_PATTERN } from "../services/session.service.js";
import { env } from "../config/env.js";

// Options shared by setting and clearing the cookie; they must match for the
// browser to treat both as the same cookie.
const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export function me(req: Request, res: Response) {
  res.status(200).json({ data: req.user });
}

export async function register(req: Request, res: Response) {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ data: user });
}

export async function verifyEmail(req: Request, res: Response) {
  await authService.verifyEmail(req.body.token);
  res.status(200).json({ message: "Email verified. You can now sign in." });
}

export async function login(req: Request, res: Response) {
  const { user, session } = await authService.login(req.body, {
    userAgent: req.get("user-agent"),
  });

  res.setHeader("Cache-Control", "no-store");
  res.cookie(SESSION_COOKIE, session.token, {
    ...sessionCookieOptions,
    // Without "remember me" it's a browser-session cookie; the server-side
    // session still expires on its own schedule either way.
    ...(req.body.remember ? { expires: session.expiresAt } : {}),
  });

  res.status(200).json({ data: user });
}

// Always succeeds, so a stale or missing cookie still ends up signed out.
export async function logout(req: Request, res: Response) {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string" && SESSION_TOKEN_PATTERN.test(token)) {
    await authService.logout(token);
  }

  res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
  res.status(204).end();
}
