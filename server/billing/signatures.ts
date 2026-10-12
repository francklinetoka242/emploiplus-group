import { createHash, timingSafeEqual, verify, constants } from "node:crypto";
import type { VercelRequest } from "@vercel/node";
import { BillingConfigError, getBillingConfig } from "./config.js";
import { PawaPayError } from "./pawapay.js";

type SignatureKey = { id: string; key: string };
type SignatureComponent =
  "@method" | "@authority" | "@path" | "signature-date" | "content-digest" | "content-type";

let cachedKeys: { expiresAt: number; keys: SignatureKey[] } | undefined;

function header(req: VercelRequest, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

async function getPawaPayKeys(): Promise<SignatureKey[]> {
  if (cachedKeys && cachedKeys.expiresAt > Date.now()) return cachedKeys.keys;

  const config = getBillingConfig();
  if (config.signedCallbacksRequired === undefined || !config.pawapayCallbackUrl) {
    throw new BillingConfigError("Callback verification configuration is incomplete");
  }
  const response = await fetch(`${config.pawapayBaseUrl}/v2/public-key/http`, {
    headers: { Authorization: `Bearer ${config.pawapayApiToken}`, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new PawaPayError("Unable to retrieve PawaPay callback keys", "HTTP", response.status);

  const body: unknown = await response.json();
  if (!Array.isArray(body))
    throw new PawaPayError("Invalid PawaPay public key response", "RESPONSE");
  const keys = body.filter(
    (value): value is SignatureKey =>
      typeof value === "object" &&
      value !== null &&
      typeof (value as SignatureKey).id === "string" &&
      typeof (value as SignatureKey).key === "string",
  );
  if (!keys.length)
    throw new PawaPayError("No PawaPay callback verification keys are available", "RESPONSE");
  cachedKeys = { expiresAt: Date.now() + 5 * 60_000, keys };
  return keys;
}

function decodeSignatureInput(value: string) {
  const match = value.match(/^([A-Za-z0-9_-]+)=\(([^)]*)\)(.*)$/);
  if (!match) throw new PawaPayError("Malformed callback signature input", "RESPONSE");
  const components = [...match[2].matchAll(/"([^"]+)"/g)].map(
    (entry) => entry[1],
  ) as SignatureComponent[];
  const allowed: SignatureComponent[] = [
    "@method",
    "@authority",
    "@path",
    "signature-date",
    "content-digest",
    "content-type",
  ];
  if (
    components.length !== allowed.length ||
    components.some((component) => !allowed.includes(component)) ||
    allowed.some((component) => !components.includes(component))
  ) {
    throw new PawaPayError("Unsupported PawaPay callback signature components", "RESPONSE");
  }

  const params = match[3];
  const algorithm = params.match(/(?:^|;)\s*alg="([^"]+)"/)?.[1];
  const keyId = params.match(/(?:^|;)\s*keyid="([^"]+)"/)?.[1];
  const created = params.match(/(?:^|;)\s*created=(\d+)/)?.[1];
  const expires = params.match(/(?:^|;)\s*expires=(\d+)/)?.[1];
  if (!algorithm || !keyId || !created || !expires) {
    throw new PawaPayError("Callback signature parameters are incomplete", "RESPONSE");
  }
  const createdAt = Number(created) * 1000;
  const expiresAt = Number(expires) * 1000;
  if (
    !Number.isFinite(createdAt) ||
    !Number.isFinite(expiresAt) ||
    Date.now() < createdAt - 60_000 ||
    Date.now() > expiresAt
  ) {
    throw new PawaPayError("Callback signature is outside its validity period", "RESPONSE");
  }

  return {
    label: match[1],
    components,
    params,
    algorithm,
    keyId,
  };
}

function signatureBytes(headerValue: string, label: string): Buffer {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = headerValue.match(new RegExp(`(?:^|,)\\s*${escaped}=:([A-Za-z0-9+/]+=*):`));
  if (!match) throw new PawaPayError("Callback signature value is missing", "RESPONSE");
  return Buffer.from(match[1], "base64");
}

function verifyBodyDigest(rawBody: Buffer, digestHeader: string) {
  const match = digestHeader.match(/^(sha-256|sha-512)=:([A-Za-z0-9+/]+=*):$/i);
  if (!match) throw new PawaPayError("Unsupported callback content digest", "RESPONSE");
  const algorithm = match[1].toLowerCase().replace("-", "");
  const expected = Buffer.from(match[2], "base64");
  const actual = createHash(algorithm).update(rawBody).digest();
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new PawaPayError("Callback content digest verification failed", "RESPONSE");
  }
}

export async function verifyPawaPayCallbackSignature(
  req: VercelRequest,
  rawBody: Buffer,
  expectedCallbackUrl?: string,
  allowRewrittenPath = false,
): Promise<boolean> {
  const config = getBillingConfig();
  const callbackUrl = expectedCallbackUrl ?? config.pawapayCallbackUrl;
  if (config.signedCallbacksRequired === undefined || !callbackUrl) {
    throw new BillingConfigError("Callback verification configuration is incomplete");
  }
  const signatureInput = header(req, "signature-input");
  const signatureHeader = header(req, "signature");
  const digest = header(req, "content-digest");
  if (!signatureInput || !signatureHeader || !digest) {
    if (signatureInput || signatureHeader || digest) {
      throw new PawaPayError("Callback signature headers are incomplete", "RESPONSE");
    }
    if (config.signedCallbacksRequired) {
      throw new PawaPayError(
        "Signed PawaPay callbacks are required but signature headers are missing",
        "RESPONSE",
      );
    }
    return false;
  }

  verifyBodyDigest(rawBody, digest);
  const input = decodeSignatureInput(signatureInput);
  const configUrl = new URL(callbackUrl);
  const requestPath = (req.url ?? "").split("?")[0];
  if (
    requestPath !== configUrl.pathname &&
    !(allowRewrittenPath && requestPath === "/api/payments/pawapay")
  ) {
    throw new PawaPayError("Callback path does not match the configured URL", "RESPONSE");
  }

  const signatureDate = header(req, "signature-date");
  const contentType = header(req, "content-type");
  if (!signatureDate || !contentType) {
    throw new PawaPayError("Required signed callback headers are missing", "RESPONSE");
  }
  const componentValues: Record<SignatureComponent, string> = {
    "@method": (req.method ?? "").toUpperCase(),
    "@authority": configUrl.host,
    "@path": configUrl.pathname,
    "signature-date": signatureDate,
    "content-digest": digest,
    "content-type": contentType,
  };
  const serializedComponents = `(${input.components.map((component) => `"${component}"`).join(" ")})`;
  const signatureBase = [
    ...input.components.map((component) => `"${component}": ${componentValues[component]}`),
    `"@signature-params": ${serializedComponents}${input.params}`,
  ].join("\n");

  const key = (await getPawaPayKeys()).find((candidate) => candidate.id === input.keyId);
  if (!key) throw new PawaPayError("Callback signature key id is not recognized", "RESPONSE");

  const algorithmOptions =
    input.algorithm === "rsa-pss-sha512"
      ? { key: key.key, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 64 }
      : { key: key.key, dsaEncoding: "der" as const };
  const digestAlgorithm =
    input.algorithm === "ecdsa-p256-sha256" || input.algorithm === "rsa-v1_5-sha256"
      ? "sha256"
      : input.algorithm === "ecdsa-p384-sha384"
        ? "sha384"
        : input.algorithm === "rsa-pss-sha512"
          ? "sha512"
          : null;
  if (!digestAlgorithm)
    throw new PawaPayError("Unsupported callback signature algorithm", "RESPONSE");

  const valid = verify(
    digestAlgorithm,
    Buffer.from(signatureBase, "utf8"),
    algorithmOptions,
    signatureBytes(signatureHeader, input.label),
  );
  if (!valid) throw new PawaPayError("Callback signature verification failed", "RESPONSE");
  return true;
}
