import test from "node:test";
import assert from "node:assert/strict";

import { resolveAuthRoles } from "../../src/features/authentication/utils/resolveAuthRoles";

test("merge roles from claims and database rows", () => {
  assert.deepEqual(resolveAuthRoles(["admin"], ["super_admin", "editor"]), ["admin", "super_admin", "editor"]);
});

test("ignore unsupported roles and keep a stable order", () => {
  assert.deepEqual(resolveAuthRoles(["owner", "admin"], ["editor", "admin"]), ["admin", "editor"]);
});
