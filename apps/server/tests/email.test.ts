import assert from "node:assert/strict";
import test from "node:test";

Object.assign(process.env, {
  NODE_ENV: "test", HOST: "127.0.0.1", PORT: "5000",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/taskly_test",
  APP_URL: "https://taskly.example", RESEND_API_KEY: "re_test_only",
  EMAIL_FROM: "Taskly <onboarding@resend.dev>",
});
delete process.env.SMTP_URL;

test("verification email uses HTTPS and encodes the verification token", async (t) => {
  const { sendVerificationEmail } = await import("../src/services/email.service.js");
  const request = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options?.method, "POST");
    assert.equal(options?.headers.Authorization, "Bearer re_test_only");
    const body = JSON.parse(options?.body as string);
    assert.deepEqual(body.to, ["owner@example.com"]);
    assert.equal(body.from, "Taskly <onboarding@resend.dev>");
    assert.match(body.text, /https:\/\/taskly.example\/verify-email\?token=a%26b/);
    return new Response(JSON.stringify({ id: "test" }), { status: 200 });
  });
  await sendVerificationEmail("owner@example.com", "a&b");
  assert.equal(request.mock.callCount(), 1);
});

test("verification email rejects provider failures without exposing the response", async (t) => {
  const { sendVerificationEmail } = await import("../src/services/email.service.js");
  t.mock.method(globalThis, "fetch", async () => new Response("private provider details", { status: 403 }));
  await assert.rejects(sendVerificationEmail("owner@example.com", "test"), {
    message: "Email delivery failed (HTTP 403)",
  });
});
