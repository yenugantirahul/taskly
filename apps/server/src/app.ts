import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes.js";
import { projectsRouter } from "./routes/projects.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
export async function createApp(): Promise<Express> {
  const app = express();

  // Don't advertise the framework in response headers
  app.disable("x-powered-by");

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // Liveness probe — answers as long as the process is up
  app.get("/server/ping", (_req, res) => {
    res.type("text/plain").send("pong");
  });

  app.use("/api/auth", authRouter);
  app.use("/api/projects", projectsRouter);

  app.use(errorHandler);

  return app;
}
