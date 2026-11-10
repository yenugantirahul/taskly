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

// Validates URL params like /projects/:id. A bad param means the resource
// can't exist, so it answers 404 rather than leaking validation details.
export const validateParams =
  (schema: ZodType<Record<string, string>>): RequestHandler =>
    (req, _res, next) => {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        throw new AppError(404, "NOT_FOUND", "Not found");
      }
      req.params = result.data;
      next();
    };
