import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import test from "node:test";

Object.assign(process.env, {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "5000",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/taskly_test",
  APP_URL: "http://localhost:3000",
  RESEND_API_KEY: "re_test_only",
  EMAIL_FROM: "test@example.com",
});

test("developer API-key verification", async (t) => {
  const { createApp } = await import("../src/app.js");
  const { pool, closeDbConnection } = await import("../src/db/index.js");
  t.after(closeDbConnection);

  const key = `mt_dev_${"a".repeat(43)}`;
  const query = t.mock.method(pool, "query", async () => ({
    rows: [[
      "key-id",
      "Local app",
      "mt_dev_aaaaaaaa",
      "project-id",
      "Example project",
      "example-project",
      "environment-id",
      "development",
    ]],
  }));

  const server = (await createApp()).listen(0, "127.0.0.1");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/developer/verify`;

  await t.test("rejects a missing or malformed key without a database query", async () => {
    for (const authorization of [undefined, "Bearer not-a-key", "Basic abc"]) {
      const response = await fetch(url, {
        headers: authorization ? { Authorization: authorization } : {},
      });
      assert.equal(response.status, 401);
      assert.equal((await response.json()).error.code, "INVALID_API_KEY");
    }
    assert.equal(query.mock.callCount(), 0);
  });

  await t.test("returns the project and environment for an active key", async () => {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), {
      data: {
        authenticated: true,
        apiKey: { id: "key-id", name: "Local app", keyPrefix: "mt_dev_aaaaaaaa" },
        project: { id: "project-id", name: "Example project", slug: "example-project" },
        environment: { id: "environment-id", type: "development" },
      },
    });

    const call = query.mock.calls[0];
    assert.ok(call);
    const callArguments = call.arguments as unknown as readonly unknown[];
    const parameters = callArguments[1];
    assert.ok(Array.isArray(parameters));
    assert.ok(parameters.includes(createHash("sha256").update(key).digest("hex")));
    assert.ok(!parameters.includes(key));
  });
});
