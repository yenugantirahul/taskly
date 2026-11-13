import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

Object.assign(process.env, {
  NODE_ENV: "test", HOST: "127.0.0.1", PORT: "5000",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/taskly_test",
  APP_URL: "http://localhost:3000", SMTP_URL: "smtp://127.0.0.1:1",
  EMAIL_FROM: "test@example.com",
});

test("health probes distinguish process liveness from database readiness", async (t) => {
  const { createApp } = await import("../src/app.js");
  const { pool } = await import("../src/db/index.js");
  t.after(() => pool.end());
  let unavailable = false;
  const query = t.mock.method(pool, "query", async () => {
    if (unavailable) throw new Error("database details must stay private");
    return { rows: [{ connected: 1 }] };
  });
  const server = (await createApp()).listen(0, "127.0.0.1");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;

  const ping = await fetch(`${base}/server/ping`);
  assert.equal(ping.status, 200);
  assert.equal(await ping.text(), "pong");
  assert.equal(query.mock.callCount(), 0);

  const ready = await fetch(`${base}/server/ready`);
  assert.equal(ready.status, 200);
  assert.equal(ready.headers.get("cache-control"), "no-store");
  assert.deepEqual(await ready.json(), { status: "ready" });

  unavailable = true;
  const failed = await fetch(`${base}/server/ready`);
  assert.equal(failed.status, 503);
  assert.deepEqual(await failed.json(), { status: "unavailable" });
  assert.equal(await (await fetch(`${base}/server/ping`)).text(), "pong");
});
