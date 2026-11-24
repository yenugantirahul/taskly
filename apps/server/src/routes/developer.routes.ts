import { Router } from "express";

import { authenticateApiKey } from "../services/developer-auth.service.js";
import { AppError } from "../utils/AppError.js";

const API_KEY_PATTERN = /^mt_(?:dev|live)_[A-Za-z0-9_-]{43}$/;

export const developerRouter = Router();

developerRouter.get("/verify", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const authorization = req.get("authorization");
  const key = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!key || !API_KEY_PATTERN.test(key)) throw unauthorized();

  const authentication = await authenticateApiKey(key);
  if (!authentication) throw unauthorized();

  res.status(200).json({ data: authentication });
});

function unauthorized(): AppError {
  return new AppError(401, "INVALID_API_KEY", "The API key is invalid or revoked.");
}
