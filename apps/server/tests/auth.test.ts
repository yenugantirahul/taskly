import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

// The app validates these settings when imported. Use dummy values so this
// test never needs your .env file or real database/email credentials.
Object.assign(process.env, {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "5000",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/taskly_test",
  APP_URL: "http://localhost:3000",
  RESEND_API_KEY: "re_test_only",
  EMAIL_FROM: "test@example.com",
});

test.after(async () => {
  const { closeDbConnection } = await import("../src/db/index.js");
  await closeDbConnection();
});

test("POST /api/auth/login rejects an invalid email", { timeout: 10_000 }, async (t) => {
  // Arrange: create the real app and start a temporary local HTTP server.
  // Import after setting the environment because the app reads it on import.
  const { createApp } = await import("../src/app.js");

  const app = await createApp();
  const server = app.listen(0, "127.0.0.1"); // 0 lets the OS pick a free port.
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, "listening");

  const address = server.address();
  assert.ok(address && typeof address !== "string");

  // Act: send a request just like the frontend would.
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email", password: "password123" }),
    signal: AbortSignal.timeout(3_000),
  });
  const body = await response.json();

  // Assert: check the public behavior we expect from the endpoint.
  assert.equal(response.status, 400);
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.ok(body.error.details.some((issue: { path: string[] }) =>
    issue.path.includes("email"),
  ));
  assert.equal(response.headers.get("set-cookie"), null);
});

test("POST /api/auth/resend-verification validates credentials before querying", { timeout: 10_000 }, async (t) => {
  const { createApp } = await import("../src/app.js");
  const { pool } = await import("../src/db/index.js");

  const query = t.mock.method(pool, "query", async () => {
    throw new Error("unexpected database query");
  });

  const app = await createApp();
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, "listening");

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email", password: "password123" }),
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "VALIDATION_ERROR");
  assert.equal(query.mock.callCount(), 0);
});
