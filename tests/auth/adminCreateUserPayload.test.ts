import test from "node:test";
import assert from "node:assert/strict";

import { buildAdminCreateUserPayload } from "../../src/features/authentication/utils/adminCreateUserPayload.ts";

test("builds a Supabase admin payload with metadata and email confirmation enabled", () => {
  const payload = buildAdminCreateUserPayload("admin@example.com", "secret123", {
    full_name: "Ada Lovelace",
    specialty: "Product",
    source: "admin-team",
  });

  assert.equal(payload.email, "admin@example.com");
  assert.equal(payload.password, "secret123");
  assert.equal(payload.email_confirm, true);
  assert.deepEqual(payload.user_metadata, {
    full_name: "Ada Lovelace",
    specialty: "Product",
    source: "admin-team",
  });
});
