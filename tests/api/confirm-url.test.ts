import test from "node:test";
import assert from "node:assert/strict";
import { resolveConfirmationBaseUrl } from "../../src/lib/confirm-url.ts";

test("prefers the app site URL over the Supabase URL", () => {
  const baseUrl = resolveConfirmationBaseUrl({
    SITE_URL: "https://emploiplus-group.com",
    VITE_SUPABASE_URL: "https://zhldgrvmmdhtlsnsxuys.supabase.co",
  });

  assert.equal(baseUrl, "https://emploiplus-group.com");
});

test("uses the request host when available", () => {
  const baseUrl = resolveConfirmationBaseUrl(
    {
      VITE_SUPABASE_URL: "https://zhldgrvmmdhtlsnsxuys.supabase.co",
    },
    {
      headers: {
        host: "staging.emploiplus-group.com",
        "x-forwarded-proto": "https",
      },
    } as { headers?: Record<string, string | string[] | undefined> },
  );

  assert.equal(baseUrl, "https://staging.emploiplus-group.com");
});
