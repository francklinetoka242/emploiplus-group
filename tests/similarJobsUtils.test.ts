import test from "node:test";
import assert from "node:assert/strict";

import { isJobActive } from "../src/services/similarJobsUtils.ts";

test("expired jobs are excluded by default from active alternatives", () => {
  const expiredJob = {
    status: "expired",
    deadline: "2024-01-01T00:00:00.000Z",
    expires_at: "2024-01-01T00:00:00.000Z",
    publish_at: "2023-12-01T00:00:00.000Z",
  };

  assert.equal(isJobActive(expiredJob), false);
  assert.equal(isJobActive(expiredJob, true), true);
});

test("published jobs with a future deadline remain active while expired ones do not", () => {
  const now = Date.now();
  const future = new Date(now + 60_000).toISOString();
  const past = new Date(now - 60_000).toISOString();

  assert.equal(isJobActive({ status: "published", deadline: future, expires_at: null, publish_at: null }), true);
  assert.equal(isJobActive({ status: "published", deadline: past, expires_at: null, publish_at: null }), false);
});
