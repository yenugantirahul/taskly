import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { checkDbConnection, closeDbConnection } from "./db/index.js";
import { closeRedis, connectRedis } from "./cache/redis.js";
const SHUTDOWN_TIMEOUT_MS = 10_000;

export async function createServer(): Promise<http.Server> {
  const app = await createApp();
  const server = http.createServer(app);

  // Mitigate slow-client attacks; keep-alive must outlive a load balancer's idle timeout
  server.requestTimeout = 30_000;
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  registerShutdown(server);

  return server;
}

export async function startServer(): Promise<void> {
  const server = await createServer();

  const host = env.HOST;
  const port = env.PORT;
  await checkDbConnection();
  console.log("Connected to database");
  await connectRedis();

  server
    .listen(port, host)
    .once("listening", () => {
      console.log(`Server started at ${port}`);
    })
    .once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
      } else {
        console.error(err);
      }
      process.exit(1);
    });
}

function registerShutdown(server: http.Server): void {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down gracefully`);

    // Stop accepting new connections; resolves once in-flight requests finish
    server.close(async (err) => {
      const results = await Promise.allSettled([closeDbConnection(), closeRedis()]);
      const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
      for (const f of failed) console.error("Failed to close connection", f.reason);
      process.exit(err || failed.length ? 1 : 0);
    });
    server.closeIdleConnections();

    // Don't hang forever on stuck requests
    setTimeout(() => {
      console.error("Shutdown timed out, forcing exit");
      server.closeAllConnections();
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}
