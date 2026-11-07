import { RequestHandler } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Invalid input",
        result.error.issues,
      );
    }
    req.body = result.data;
    next();
  };
