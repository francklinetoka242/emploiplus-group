import test from "node:test";
import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import type { VercelRequest } from "@vercel/node";
import { verifyPawaPayCallbackSignature } from "../../server/billing/signatures.ts";

const originalFetch = globalThis.fetch;
const envNames = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PAWAPAY_API_TOKEN",
  "PAWAPAY_BASE_URL",
  "PAWAPAY_COUNTRY_CODE",
  "PAWAPAY_CALLBACK_URL",
  "PAWAPAY_PAYOUT_CALLBACK_URL",
  "PAWAPAY_CALLBACK_SIGNATURES_REQUIRED",
];
const savedEnvironment = new Map(envNames.map((name) => [name, process.env[name]]));

test.after(() => {
  globalThis.fetch = originalFetch;
  for (const [name, value] of savedEnvironment) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("verifies PawaPay RFC 9421 callback digest and signature", async () => {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  process.env.SUPABASE_URL = "https://sandbox-project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.PAWAPAY_API_TOKEN = "test-pawapay-token";
  process.env.PAWAPAY_BASE_URL = "https://api.sandbox.pawapay.io";
  process.env.PAWAPAY_COUNTRY_CODE = "COG";
  process.env.PAWAPAY_CALLBACK_URL = "https://example.test/api/payments/pawapay/callback";
  process.env.PAWAPAY_CALLBACK_SIGNATURES_REQUIRED = "true";

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify([{ id: "test-key", key: publicKey.export({ type: "spki", format: "pem" }) }]),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )) as typeof fetch;

  const body = Buffer.from(JSON.stringify({ depositId: "deposit", status: "COMPLETED" }));
  const digest = `sha-512=:${createHash("sha512").update(body).digest("base64")}:`;
  const signatureDate = new Date().toISOString();
  const created = Math.floor(Date.now() / 1000);
  const expires = created + 60;
  const components = [
    "@method",
    "@authority",
    "@path",
    "signature-date",
    "content-digest",
    "content-type",
  ];
  const parameters = `;alg="ecdsa-p256-sha256";keyid="test-key";created=${created};expires=${expires}`;
  const signatureInput = `sig-pp=(${components.map((value) => `"${value}"`).join(" ")})${parameters}`;
  const signatureBase = [
    '"@method": POST',
    '"@authority": example.test',
    '"@path": /api/payments/pawapay/callback',
    `"signature-date": ${signatureDate}`,
    `"content-digest": ${digest}`,
    '"content-type": application/json',
    `"@signature-params": (${components.map((value) => `"${value}"`).join(" ")})${parameters}`,
  ].join("\n");
  const signature = sign("sha256", Buffer.from(signatureBase), privateKey).toString("base64");

  const req = {
    method: "POST",
    url: "/api/payments/pawapay/callback",
    headers: {
      "content-type": "application/json",
      "content-digest": digest,
      "signature-date": signatureDate,
      "signature-input": signatureInput,
      signature: `sig-pp=:${signature}:`,
    },
  } as unknown as VercelRequest;

  assert.equal(await verifyPawaPayCallbackSignature(req, body), true);
  await assert.rejects(
    verifyPawaPayCallbackSignature(req, Buffer.from("tampered")),
    /digest verification failed/,
  );

  const payoutUrl = "https://example.test/api/payments/pawapay/payouts/callback";
  process.env.PAWAPAY_PAYOUT_CALLBACK_URL = payoutUrl;
  const payoutSignatureBase = signatureBase.replace(
    '"@path": /api/payments/pawapay/callback',
    '"@path": /api/payments/pawapay/payouts/callback',
  );
  const payoutSignature = sign("sha256", Buffer.from(payoutSignatureBase), privateKey).toString(
    "base64",
  );
  const payoutReq = {
    ...req,
    url: "/api/payments/pawapay/payouts/callback",
    headers: { ...req.headers, signature: `sig-pp=:${payoutSignature}:` },
  } as unknown as VercelRequest;

  assert.equal(await verifyPawaPayCallbackSignature(payoutReq, body, payoutUrl), true);
  await assert.rejects(verifyPawaPayCallbackSignature(payoutReq, body), /path does not match/);
});
