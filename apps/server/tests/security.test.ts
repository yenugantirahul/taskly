import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

Object.assign(process.env, {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "5000",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/taskly_test",
  APP_URL: "http://localhost:3000",
  SMTP_URL: "smtp://127.0.0.1:1",
  EMAIL_FROM: "test@example.com",
});

test("origin check and logout", { timeout: 15_000 }, async (t) => {
  const { createApp } = await import("../src/app.js");
  const { pool, closeDbConnection } = await import("../src/db/index.js");
  t.after(closeDbConnection);

  // None of these requests should reach the database.
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
  const base = `http://127.0.0.1:${address.port}/api`;

  await t.test("rejects state-changing requests from another origin", async () => {
    for (const [method, path] of [["POST", "/projects"], ["DELETE", `/projects/${crypto.randomUUID()}`], ["POST", "/auth/login"]]) {
      const response = await fetch(base + path, {
        method,
        headers: { Origin: "https://evil.example", "Content-Type": "application/json", Cookie: `session=${"a".repeat(43)}` },
        body: method === "POST" ? JSON.stringify({ name: "x", type: "software" }) : undefined,
      });
      assert.equal(response.status, 403, `${method} ${path}`);
      assert.equal((await response.json()).error.code, "FORBIDDEN_ORIGIN");
    }
  });

  await t.test("lets the app's own origin through", async () => {
    const response = await fetch(`${base}/projects`, {
      method: "POST",
      headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x", type: "software" }),
    });
    // Reaches requireAuth, which rejects the missing cookie.
    assert.equal(response.status, 401);
  });

  await t.test("logout without a valid cookie still clears it", async () => {
    const response = await fetch(`${base}/auth/logout`, {
      method: "POST",
      headers: { Origin: "http://localhost:3000", Cookie: "session=not-a-token" },
    });
    assert.equal(response.status, 204);
    assert.match(response.headers.get("set-cookie") ?? "", /^session=;.*Expires=Thu, 01 Jan 1970/);
  });

  assert.equal(query.mock.callCount(), 0);
});
