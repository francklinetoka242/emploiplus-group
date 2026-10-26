import assert from "node:assert/strict";
import test from "node:test";
import {
  compareJobOffersByValidityThenDate,
  isJobOfferExpired,
} from "../../src/features/jobs/utils/jobOfferOrdering.ts";

test("puts valid offers before expired offers, then orders by publication date", () => {
  const validOlderOffer = {
    deadline: "2099-01-01",
    expires_at: null,
    publish_at: "2024-01-01",
    created_at: null,
  };
  const expiredNewerOffer = {
    deadline: "2000-01-01",
    expires_at: null,
    publish_at: "2026-01-01",
    created_at: null,
  };

  assert.ok(compareJobOffersByValidityThenDate(validOlderOffer, expiredNewerOffer) < 0);
  assert.ok(compareJobOffersByValidityThenDate(expiredNewerOffer, validOlderOffer) > 0);
});

test("uses expires_at when deadline is missing", () => {
  assert.equal(isJobOfferExpired({ deadline: null, expires_at: "2000-01-01" }), true);
  assert.equal(isJobOfferExpired({ deadline: null, expires_at: null }), false);
});
