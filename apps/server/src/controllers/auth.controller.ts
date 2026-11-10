import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { env } from "../config/env.js";

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
  const { user, session } = await authService.login(req.body)

  res.cookie("session", session.token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt
  })

  res.status(200).json({ data: user });
}

