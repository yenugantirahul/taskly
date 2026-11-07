import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerschema } from "../validators/auth.schema.js";
import * as authController from "../controllers/auth.controller.js";

export const authRouter = Router();
authRouter.post("/register", validate(registerschema), authController.register);
// authRouter.post("/login", validate(loginSchema))