import assert from "node:assert/strict";
import test from "node:test";

import { SLUG_MAX_LENGTH, nextAvailableSlug, slugify } from "../src/utils/slug.js";

test("slugify turns a name into a URL-safe slug", () => {
  assert.equal(slugify("My Website Redesign"), "my-website-redesign");
  assert.equal(slugify("  Q4 -- Launch!! "), "q4-launch");
  assert.equal(slugify("Café Ünïcode"), "cafe-unicode");
});

test("slugify falls back when the name has no usable characters", () => {
  assert.equal(slugify("!!!"), "project");
  assert.equal(slugify("日本"), "project");
});

test("slugify leaves room for a numeric suffix", () => {
  const slug = slugify("a".repeat(200));
  assert.ok(slug.length + "-99999".length <= SLUG_MAX_LENGTH);
  assert.match(nextAvailableSlug(slug, [slug]), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

test("nextAvailableSlug picks the base or the next free suffix", () => {
  assert.equal(nextAvailableSlug("website", []), "website");
  assert.equal(nextAvailableSlug("website", ["website"]), "website-2");
  assert.equal(nextAvailableSlug("website", ["website", "website-2", "website-7"]), "website-8");
  // A different project that merely shares the prefix isn't a numbered copy.
  assert.equal(nextAvailableSlug("website", ["website", "website-redesign"]), "website-2");
});
