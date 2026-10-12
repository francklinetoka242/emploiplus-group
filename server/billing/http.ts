import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BillingConfigError } from "./config.js";
import { BillingDatabaseError } from "./supabase.js";
import { PawaPayError } from "./pawapay.js";

export type JsonRecord = Record<string, unknown>;

export function parseJsonBody(req: VercelRequest): JsonRecord | null {
  const body: unknown = req.body;
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body);
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return isRecord(body) ? body : null;
}

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getIdempotencyKey(req: VercelRequest): string | null {
  const value = req.headers["idempotency-key"];
  const key = (Array.isArray(value) ? value[0] : value)?.trim();
  return key && key.length >= 8 && key.length <= 200 ? key : null;
}

export function replyWithError(res: VercelResponse, error: unknown) {
  if (error instanceof BillingConfigError) {
    console.error("[billing] missing or invalid server configuration", { error: error.message });
    return res.status(503).json({ error: "Payment service is not configured." });
  }
  if (error instanceof PawaPayError) {
    console.error("[billing] PawaPay request failed", {
      code: error.code,
      statusCode: error.statusCode,
    });
    const status =
      error.code === "TIMEOUT" || error.code === "NETWORK"
        ? 202
        : error.code === "NOT_FOUND"
          ? 404
          : error.code === "RESPONSE"
            ? 502
            : error.code === "CONFIG"
              ? 503
              : 502;
    return res.status(status).json({
      error:
        status === 202
          ? "Payment status is uncertain; reconcile the existing deposit."
          : "Unable to complete the payment operation.",
      pending: status === 202,
    });
  }
  if (error instanceof BillingDatabaseError) {
    const status =
      error.code === "PGRST202" || error.code === "42883"
        ? 503
        : error.code === "55P03"
          ? 409
          : error.code === "22023"
            ? 400
            : error.code === "P0002"
              ? 404
              : 500;
    return res.status(status).json({
      error:
        status === 503
          ? "Billing database functions are not available."
          : status === 409
            ? "A conflicting payment operation is already in progress."
            : status === 400
              ? "The payment request is invalid."
              : status === 404
                ? "The requested billing resource was not found."
                : "Unable to process the payment operation.",
    });
  }
  console.error("[billing] unexpected request failure", {
    name: error instanceof Error ? error.name : "unknown",
  });
  return res.status(500).json({ error: "Unable to process the payment operation." });
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
