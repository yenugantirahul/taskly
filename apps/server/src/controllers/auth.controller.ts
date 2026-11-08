import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ data: user });
}

export async function verifyEmail(req: Request, res: Response) {
  await authService.verifyEmail(req.body.token);
  res.status(200).json({ message: "Email verified. You can now sign in." });
}


