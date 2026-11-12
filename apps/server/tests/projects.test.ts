import assert from "node:assert/strict";
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

// The pool is shared by every test in this file, so close it once at the end.
test.after(async () => {
  const { closeDbConnection } = await import("../src/db/index.js");
  await closeDbConnection();
});

const ownerId ="a6e0b95a-04c5-4c49-8ecf-b999c8e66d5e";
const projectId = "0b6f3c1e-8a52-4f0e-9d7a-3c2b1a0f9e8d";
const now = new Date().toISOString();

type Call = { text: string; params: unknown[] };

function queryText(config: unknown): string {
  return typeof config === "string" ? config : (config as { text: string }).text;
}

// Mocks only the database boundary. Reads outside the transaction go through
// pool.query; the transaction runs on a client from pool.connect().
async function setup(
  t: test.TestContext,
  onTxQuery: (text: string, params: unknown[], attempt: number) => unknown[][] | Error,
) {
  const { pool } = await import("../src/db/index.js");
  const { createProject } = await import("../src/services/projects.service.js");

  // findTakenSlugs: no slugs taken yet.
  t.mock.method(pool, "query", async () => ({ rows: [] }));

  const txCalls: Call[] = [];
  let attempt = 0;
  let released = 0;
  t.mock.method(pool, "connect", async () => {
    attempt++;
    return {
      query: async (config: unknown, params: unknown[] = []) => {
        const text = queryText(config);
        txCalls.push({ text, params });
        const result = onTxQuery(text, params, attempt);
        if (result instanceof Error) throw result;
        return { rows: result, rowCount: result.length };
      },
      release: () => {
        released++;
      },
    };
  });

  return { createProject, txCalls, released: () => released };
}

function projectRow(slug: string) {
  return [projectId, "My Website", slug, "software", now, now];
}

function uniqueViolation(): Error {
  return Object.assign(new Error("duplicate key"), { code: "23505" });
}

test("createProject creates development and production environments in the same transaction", async (t) => {
  const { createProject, txCalls, released } = await setup(t, (text) =>
    /insert into "project"/.test(text) ? [projectRow("my-website")] : [],
  );

  const project = await createProject(ownerId, { name: "My Website", type: "software" });
  assert.equal(project.id, projectId);
  assert.equal(project.slug, "my-website");

  const texts = txCalls.map((c) => c.text.toLowerCase());
  assert.equal(texts[0], "begin");
  assert.match(texts[1], /insert into "project"/);
  assert.match(texts[2], /insert into "environment"/);
  assert.equal(texts[3], "commit");
  assert.equal(texts.length, 4);

  // Two rows: (projectId, development) and (projectId, production). No staging.
  const envParams = txCalls[2].params;
  assert.ok(envParams.includes("development"));
  assert.ok(envParams.includes("production"));
  assert.ok(!envParams.includes("staging"));
  assert.equal(envParams.filter((p) => p === projectId).length, 2);
  assert.equal(released(), 1);
});

test("createProject rolls back the project when the environments can't be created", async (t) => {
  const { createProject, txCalls, released } = await setup(t, (text) => {
    if (/insert into "project"/.test(text)) return [projectRow("my-website")];
    if (/insert into "environment"/.test(text)) return new Error("environment insert failed");
    return [];
  });

  // Drizzle wraps driver errors; the original is the cause.
  await assert.rejects(
    createProject(ownerId, { name: "My Website", type: "software" }),
    (err: any) => err?.cause?.message === "environment insert failed",
  );

  const texts = txCalls.map((c) => c.text.toLowerCase());
  assert.ok(texts.includes("rollback"));
  assert.ok(!texts.includes("commit"));
  assert.equal(released(), 1);
});

test("createProject retries in a fresh transaction after a slug conflict", async (t) => {
  const { createProject, txCalls, released } = await setup(t, (text, _params, attempt) => {
    if (/insert into "project"/.test(text)) {
      return attempt === 1 ? uniqueViolation() : [projectRow("my-website")];
    }
    return [];
  });

  const project = await createProject(ownerId, { name: "My Website", type: "software" });
  assert.equal(project.id, projectId);

  const texts = txCalls.map((c) => c.text.toLowerCase());
  assert.deepEqual(
    texts.map((s) => (s.startsWith("insert into") ? s.split(" ")[2] : s)),
    ["begin", '"project"', "rollback", "begin", '"project"', '"environment"', "commit"],
  );
  assert.equal(released(), 2);
});

test("listProjectEnvironments returns the project's environments, scoped to the owner", async (t) => {
  const { pool } = await import("../src/db/index.js");
  const { listProjectEnvironments } = await import("../src/services/projects.service.js");

  const query = t.mock.method(pool, "query", async (config: unknown, params: unknown[]) => {
    const text = queryText(config);
    assert.match(text, /from "project" left join "environment"/);
    assert.match(text, /"project"\."owner_id" = \$1/);
    assert.deepEqual(params, [ownerId, projectId]);
    return {
      rows: [
        ["e1000000-0000-4000-8000-000000000001", "development", now],
        ["e1000000-0000-4000-8000-000000000002", "production", now],
      ],
    };
  });

  const envs = await listProjectEnvironments(ownerId, projectId);
  assert.deepEqual(envs.map((e) => e.type), ["development", "production"]);
  assert.equal(query.mock.callCount(), 1);
});

test("listProjectEnvironments answers 404 for a project the caller doesn't own", async (t) => {
  const { pool } = await import("../src/db/index.js");
  const { listProjectEnvironments } = await import("../src/services/projects.service.js");
  t.mock.method(pool, "query", async () => ({ rows: [] }));

  await assert.rejects(listProjectEnvironments(ownerId, projectId), (err: any) => err?.code === "PROJECT_NOT_FOUND");
});

test("listProjectEnvironments returns an empty list for a project with no environments", async (t) => {
  const { pool } = await import("../src/db/index.js");
  const { listProjectEnvironments } = await import("../src/services/projects.service.js");
  // The left join yields one all-null environment row.
  t.mock.method(pool, "query", async () => ({ rows: [[null, null, null]] }));

  assert.deepEqual(await listProjectEnvironments(ownerId, projectId), []);
});
