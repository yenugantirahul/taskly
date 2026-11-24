import assert from "node:assert/strict";
import test from "node:test";

import { MiniTrigger, MiniTriggerError } from "../dist/index.js";

const result = {
  authenticated: true,
  apiKey: { id: "key-id", name: "Local app", keyPrefix: "mt_dev_example" },
  project: { id: "project-id", name: "Example", slug: "example" },
  environment: { id: "environment-id", type: "development" },
};

test("authenticate sends the API key and returns its scope", async () => {
  let request;
  const client = new MiniTrigger({
    apiKey: "secret-key",
    baseUrl: "https://api.example.test/",
    fetch: async (url, init) => {
      request = { url, init };
      return Response.json({ data: result });
    },
  });

  assert.deepEqual(await client.authenticate(), result);
  assert.equal(request.url, "https://api.example.test/api/developer/verify");
  assert.equal(request.init.method, "GET");
  assert.equal(request.init.headers.Authorization, "Bearer secret-key");
});

test("verify is an alias and surfaces structured API errors", async () => {
  const client = new MiniTrigger({
    apiKey: "bad-key",
    fetch: async () =>
      Response.json(
        { error: { code: "INVALID_API_KEY", message: "The API key is invalid or revoked." } },
        { status: 401 },
      ),
  });

  await assert.rejects(
    client.verify(),
    (error) =>
      error instanceof MiniTriggerError &&
      error.status === 401 &&
      error.code === "INVALID_API_KEY",
  );
});
