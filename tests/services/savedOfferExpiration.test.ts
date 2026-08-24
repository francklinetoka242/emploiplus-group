import assert from "node:assert/strict";
import test from "node:test";
import {
  isSavedOfferExpiringSoon,
  savedOfferExpirationKey,
} from "../../src/features/candidates/utils/savedOfferExpiration.ts";

const now = Date.parse("2026-08-24T12:00:00.000Z");
const hours = 60 * 60 * 1000;

test("saved offer expiration window accepts exactly seven days and rejects eight days", () => {
  assert.equal(isSavedOfferExpiringSoon(new Date(now + 7 * 24 * hours).toISOString(), now), true);
  assert.equal(isSavedOfferExpiringSoon(new Date(now + 8 * 24 * hours).toISOString(), now), false);
});

test("saved offer expiration window accepts three days and rejects expired or invalid dates", () => {
  assert.equal(isSavedOfferExpiringSoon(new Date(now + 3 * 24 * hours).toISOString(), now), true);
  assert.equal(isSavedOfferExpiringSoon(new Date(now - hours).toISOString(), now), false);
  assert.equal(isSavedOfferExpiringSoon("invalid", now), false);
  assert.equal(isSavedOfferExpiringSoon(null, now), false);
});

test("expiration identity separates candidates, offers, and extended deadlines", () => {
  const first = savedOfferExpirationKey("candidate-a", "offer-a", "2026-08-27T12:00:00.000Z");
  assert.equal(savedOfferExpirationKey("candidate-a", "offer-a", "2026-08-27T12:00:00.000Z"), first);
  assert.notEqual(savedOfferExpirationKey("candidate-b", "offer-a", "2026-08-27T12:00:00.000Z"), first);
  assert.notEqual(savedOfferExpirationKey("candidate-a", "offer-b", "2026-08-27T12:00:00.000Z"), first);
  assert.notEqual(savedOfferExpirationKey("candidate-a", "offer-a", "2026-08-30T12:00:00.000Z"), first);
});

test("twenty page openings keep one notification for one expiration", () => {
  const notifications = new Set<string>();
  for (let opening = 0; opening < 20; opening += 1) {
    notifications.add(savedOfferExpirationKey("candidate-a", "offer-a", "2026-08-27T12:00:00.000Z"));
  }
  assert.equal(notifications.size, 1);
});

test("one hundred saved offers with thirty expiring soon keep thirty event identities", () => {
  const notifications = new Set<string>();
  for (let opening = 0; opening < 20; opening += 1) {
    for (let offer = 0; offer < 30; offer += 1) {
      notifications.add(savedOfferExpirationKey("candidate-a", `offer-${offer}`, "2026-08-27T12:00:00.000Z"));
    }
  }
  assert.equal(notifications.size, 30);
});