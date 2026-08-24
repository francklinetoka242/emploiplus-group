import assert from "node:assert/strict";
import test from "node:test";
import { isPublishedAndEligibleOffer, isPublishedAndVisibleOffer } from "../../src/features/jobs/api/jobsApi";

const now = "2026-08-24T12:00:00.000Z";
const active = { status: "published" as const, publish_at: null, deadline: "2026-08-30T00:00:00.000Z", expires_at: "2026-08-30T00:00:00.000Z" };
const expired = { ...active, deadline: "2026-08-23T00:00:00.000Z", expires_at: "2026-08-23T00:00:00.000Z" };

test("published active and expired offers remain visible", () => {
  assert.equal(isPublishedAndVisibleOffer(active, now), true);
  assert.equal(isPublishedAndVisibleOffer(expired, now), true);
});

test("only active offers are eligible for matching and applications", () => {
  assert.equal(isPublishedAndEligibleOffer(active, now), true);
  assert.equal(isPublishedAndEligibleOffer(expired, now), false);
});

test("future and unpublished offers remain hidden", () => {
  assert.equal(isPublishedAndVisibleOffer({ ...active, publish_at: "2026-08-25T00:00:00.000Z" }, now), false);
  assert.equal(isPublishedAndVisibleOffer({ ...active, status: "draft" as const }, now), false);
});
