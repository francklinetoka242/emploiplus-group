import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getBillingConfig } from "../../config.js";
import { PawaPayError } from "../../pawapay.js";
import { isRecord, replyWithError, isUuid } from "../../http.js";
import {
  applyProviderStatus,
  completeCallbackEvent,
  recordCallbackEvent,
} from "../../reconcile.js";
import { verifyPawaPayCallbackSignature } from "../../signatures.js";
import { getBillingSupabase } from "../../supabase.js";

export const config = { api: { bodyParser: false } };

async function readBody(req: VercelRequest, maxBytes = 65536): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) throw new Error("callback_body_too_large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let rawBody: Buffer;
  try {
    rawBody = await readBody(req);
  } catch {
    return res.status(413).json({ error: "Callback payload is too large." });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid callback JSON." });
  }
  if (
    !isRecord(payload) ||
    !isUuid(payload.depositId) ||
    typeof payload.status !== "string" ||
    !/^[A-Z_]{3,40}$/.test(payload.status)
  ) {
    return res.status(400).json({ error: "Invalid callback payload." });
  }

  try {
    const config = getBillingConfig();
    if (config.signedCallbacksRequired === undefined || !config.pawapayCallbackUrl) {
      return res.status(503).json({ error: "PawaPay callback verification is not configured." });
    }
    const signatureVerified = await verifyPawaPayCallbackSignature(req, rawBody, undefined, true);
    const supabase = getBillingSupabase();
    await recordCallbackEvent(
      supabase,
      payload.depositId,
      payload.status,
      rawBody,
      signatureVerified,
    );

    const verifiedResult = await applyProviderStatus(supabase, payload.depositId);
    if (!verifiedResult) {
      return res.status(503).json({ error: "PawaPay has not published this deposit status yet." });
    }
    await completeCallbackEvent(supabase, payload.depositId, rawBody);
    return res.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof Error && error.message === "callback_body_too_large") {
      return res.status(413).json({ error: "Callback payload is too large." });
    }
    if (error instanceof PawaPayError) {
      const status =
        error.code === "HTTP" || error.code === "NETWORK" || error.code === "TIMEOUT"
          ? 502
          : error.code === "CONFIG"
            ? 503
            : 401;
      console.error("[billing] callback verification or reconciliation failed", {
        name: error.name,
        status,
      });
      return res.status(status).json({ error: "Callback could not be verified or reconciled." });
    }
    return replyWithError(res, error);
  }
}
