import assert from "node:assert/strict";
import test from "node:test";
import { explainGeminiError, fetchGeminiWithRetry, sanitize } from "../../api/extract-job-offer.ts";

test("sanitize rejects unsupported contract types", () => {
  assert.equal(sanitize({ contract_type: "temporary" }).contract_type, null);
});

test("sanitize rejects impossible calendar dates", () => {
  assert.equal(sanitize({ deadline: "2026-02-31" }).deadline, null);
});

test("sanitize rejects invalid email addresses", () => {
  assert.equal(sanitize({ application_email: "not-an-email" }).application_email, null);
});

test("sanitize truncates tags to eight non-empty strings", () => {
  const result = sanitize({ tags: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] });
  assert.deepEqual(result.tags, ["1", "2", "3", "4", "5", "6", "7", "8"]);
});

test("explains an invalid Gemini API key without exposing provider details", () => {
  const message = explainGeminiError(400, {
    error: {
      message: "API key not valid. Please pass a valid API key.",
      details: [{ reason: "API_KEY_INVALID" }],
    },
  });
  assert.match(message, /GEMINI_API_KEY/);
  assert.doesNotMatch(message, /Please pass/);
});

test("explains when the configured Gemini model is not found", () => {
  assert.match(explainGeminiError(404, {}), /GEMINI_MODEL/);
});

test("retries temporary Gemini failures and returns the successful response", async () => {
  let requests = 0;
  const response = await fetchGeminiWithRetry(
    "https://example.test",
    {},
    async () => {
      requests += 1;
      return new Response(null, { status: requests < 3 ? 503 : 200 });
    },
    async () => {},
  );

  assert.equal(requests, 3);
  assert.equal(response.status, 200);
});

test("does not retry non-transient Gemini errors", async () => {
  let requests = 0;
  const response = await fetchGeminiWithRetry(
    "https://example.test",
    {},
    async () => {
      requests += 1;
      return new Response(null, { status: 400 });
    },
    async () => {},
  );

  assert.equal(requests, 1);
  assert.equal(response.status, 400);
});
