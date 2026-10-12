import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  BillingConfigError,
  getPawaPayCallbackUrl,
  type PawaPayCallbackCategory,
} from "./config.js";
import { isRecord, isUuid, replyWithError } from "./http.js";
import { getPawaPayCallbackStatus, PawaPayError } from "./pawapay.js";
import { billingRpc, BillingDatabaseError, getBillingSupabase } from "./supabase.js";
import { verifyPawaPayCallbackSignature } from "./signatures.js";

type CallbackCategory = Exclude<PawaPayCallbackCategory, "deposits">;
type CallbackBody = { id: string; status: string };

const CALLBACK_IDS: Record<CallbackCategory, string> = {
  checkouts: "checkoutId",
  payouts: "payoutId",
  refunds: "refundId",
};

const FINAL_STATUSES: Record<CallbackCategory, readonly string[]> = {
  checkouts: ["COMPLETED", "FAILED", "EXPIRED", "CANCELLED"],
  payouts: ["COMPLETED", "FAILED"],
  refunds: ["COMPLETED", "FAILED"],
};

class CallbackBodyTooLargeError extends Error {}

async function readRawBody(req: VercelRequest, maxBytes = 65536): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) throw new CallbackBodyTooLargeError();
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function parseCallbackBody(category: CallbackCategory, rawBody: Buffer): CallbackBody | null {
  let value: unknown;
  try {
    value = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return null;
  }
  if (!isRecord(value)) return null;
  const id = value[CALLBACK_IDS[category]];
  if (!isUuid(id) || typeof value.status !== "string") return null;
  if (!FINAL_STATUSES[category].includes(value.status)) return null;
  return { id, status: value.status };
}

function callbackErrorStatus(error: unknown): number {
  if (error instanceof BillingConfigError) return 503;
  if (error instanceof PawaPayError) {
    if (error.code === "HTTP" || error.code === "NETWORK" || error.code === "TIMEOUT") return 502;
    if (error.code === "CONFIG") return 503;
    return 401;
  }
  if (error instanceof BillingDatabaseError) {
    if (error.code === "PGRST202" || error.code === "42883") return 503;
    if (error.code === "P0002") return 409;
  }
  return 500;
}

export async function handlePawaPayCallback(
  category: CallbackCategory,
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    if (error instanceof CallbackBodyTooLargeError) {
      return res.status(413).json({ error: "Callback payload is too large." });
    }
    return replyWithError(res, error);
  }

  const callback = parseCallbackBody(category, rawBody);
  if (!callback) {
    return res.status(400).json({ error: "Invalid or unsupported PawaPay callback payload." });
  }

  try {
    const callbackUrl = getPawaPayCallbackUrl(category);
    const signatureVerified = await verifyPawaPayCallbackSignature(req, rawBody, callbackUrl, true);
    const providerStatus = await getPawaPayCallbackStatus(category, callback.id);
    if (!providerStatus || providerStatus !== callback.status) {
      return res.status(503).json({ error: "PawaPay callback status could not be confirmed." });
    }

    const result = await billingRpc<
      Array<{ accepted: boolean; is_new: boolean; source_deposit_id: string | null }>
    >(getBillingSupabase(), "billing_record_pawapay_callback_event", {
      p_callback_type: category,
      p_operation_id: callback.id,
      p_provider_status: providerStatus,
      p_payload_sha256: createHash("sha256").update(rawBody).digest("hex"),
      p_authentication_verified: signatureVerified,
    });
    const stored = result[0];
    if (!stored?.accepted) {
      return res.status(409).json({ error: "Conflicting PawaPay callback status." });
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    const status = callbackErrorStatus(error);
    console.error("[billing] PawaPay callback could not be verified or recorded", {
      category,
      name: error instanceof Error ? error.name : "unknown",
      status,
    });
    if (error instanceof BillingConfigError || error instanceof PawaPayError) {
      return res.status(status).json({ error: "Callback could not be verified or reconciled." });
    }
    if (error instanceof BillingDatabaseError && error.code === "P0002") {
      return res.status(409).json({ error: "Refund callback has no registered source payment." });
    }
    return replyWithError(res, error);
  }
}
