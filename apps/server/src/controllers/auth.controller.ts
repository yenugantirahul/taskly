import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ data: user });
}
