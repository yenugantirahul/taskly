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

test("GET /api/auth/me authenticates session cookies", { timeout: 15_000 }, async (t) => {
  const { createApp } = await import("../src/app.js");
  const { pool, closeDbConnection } = await import("../src/db/index.js");
  const { hashToken } = await import("../src/utils/Auth.js");
  t.after(closeDbConnection);

  const user = { id: "a6e0b95a-04c5-4c49-8ecf-b999c8e66d5e", name: "Ada", email: "ada@example.com" };
  const future = new Date(Date.now() + 60_000).toISOString();
  const past = new Date(Date.now() - 60_000).toISOString();
  // Mock only the database boundary; run real cookie parsing, hashing,
  // session validation, middleware, controller, and error handling.
  const records = new Map([
    [hashToken("a".repeat(43)), [user.id, user.name, user.email, future, null, true]],
    [hashToken("b".repeat(43)), [user.id, user.name, user.email, past, null, true]],
    [hashToken("c".repeat(43)), [user.id, user.name, user.email, future, past, true]],
    [hashToken("d".repeat(43)), [user.id, user.name, user.email, future, null, false]],
  ]);
  const query = t.mock.method(pool, "query", async (config: { text: string; rowMode: string }, params: unknown[]) => {
    assert.equal(config.rowMode, "array");
    assert.match(config.text, /inner join "users"/);
    assert.match(config.text, /"sessions"\."token_hash" = \$1/);
    assert.equal(typeof params[0], "string");
    assert.match(params[0] as string, /^[a-f0-9]{64}$/);
    const row = records.get(params[0] as string);
    return { rows: row ? [row] : [] };
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
  const url = `http://127.0.0.1:${address.port}/api/auth/me`;

  for (const [name, token, status] of [
    ["missing cookie", undefined, 401],
    ["malformed cookie", "invalid", 401],
    ["valid session", "a".repeat(43), 200],
    ["expired session", "b".repeat(43), 401],
    ["revoked session", "c".repeat(43), 401],
    ["inactive user", "d".repeat(43), 401],
    ["unknown session", "e".repeat(43), 401],
  ] as const) {
    await t.test(name, async () => {
      const callsBefore = query.mock.callCount();
      const response = await fetch(url, {
        headers: token ? { Cookie: `session=${token}` } : {},
        signal: AbortSignal.timeout(3_000),
      });
      assert.equal(response.status, status);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const body = await response.json();
      if (status === 200) {
        assert.deepEqual(body, { data: user });
      } else {
        assert.equal(body.error.code, "UNAUTHORIZED");
        assert.equal(body.data, undefined);
      }
      if (!token || token === "invalid") {
        assert.equal(query.mock.callCount(), callsBefore);
      }
    });
  }
});
