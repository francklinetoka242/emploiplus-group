import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, randomUUID } from "node:crypto";
import { BillingConfigError, getBillingConfig } from "../../../server/billing/config.js";
import { getIdempotencyKey, parseJsonBody, replyWithError } from "../../../server/billing/http.js";
import { initiateDeposit, PawaPayError, validatePayer } from "../../../server/billing/pawapay.js";
import { authenticateCandidate, billingRpc } from "../../../server/billing/supabase.js";
import { applyProviderStatus } from "../../../server/billing/reconcile.js";

type OrderResult = {
  orderId: string;
  planCode: "premium" | "premium_plus";
  amountXaf: number;
  currency: "XAF";
  orderType: "initial" | "renewal" | "scheduled_change";
  status: string;
};

type AttemptResult = {
  depositId: string;
  amountXaf: number;
  currency: "XAF";
  status: string;
  providerCode: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authenticated = await authenticateCandidate(req.headers.authorization);
    if (!authenticated) return res.status(401).json({ error: "Authentication required." });

    const body = parseJsonBody(req);
    const idempotencyKey = getIdempotencyKey(req);
    if (
      !body ||
      !idempotencyKey ||
      (body.planCode !== "premium" && body.planCode !== "premium_plus") ||
      typeof body.providerCode !== "string" ||
      typeof body.phoneNumber !== "string" ||
      body.phoneNumber.length < 5 ||
      body.phoneNumber.length > 32
    ) {
      return res.status(400).json({ error: "Invalid payment request." });
    }

    const payer = await validatePayer(body.phoneNumber, body.providerCode);
    const order = await billingRpc<OrderResult>(authenticated.supabase, "billing_create_order", {
      p_user_id: authenticated.user.id,
      p_plan_code: body.planCode,
      p_idempotency_key: idempotencyKey,
    });
    if (order.status === "paid") {
      return res.status(200).json({ orderId: order.orderId, status: "paid" });
    }
    if (order.status !== "pending") {
      return res.status(409).json({ orderId: order.orderId, status: order.status });
    }
    if (
      !Number.isSafeInteger(order.amountXaf) ||
      order.amountXaf <= 0 ||
      order.currency !== "XAF" ||
      order.planCode !== body.planCode
    ) {
      throw new Error("Billing order response failed server validation");
    }

    const depositId = randomUUID();
    const attempt = await billingRpc<AttemptResult>(
      authenticated.supabase,
      "billing_create_payment_attempt",
      {
        p_user_id: authenticated.user.id,
        p_order_id: order.orderId,
        p_deposit_id: depositId,
        p_provider_code: payer.providerCode,
        p_request_fingerprint: createHash("sha256")
          .update(
            `${payer.providerCode}\n${payer.phoneNumber}\n${order.amountXaf}\n${order.currency}`,
          )
          .digest("hex"),
      },
    );

    if (attempt.providerCode !== payer.providerCode) {
      return res.status(409).json({
        orderId: order.orderId,
        status: "pending",
        error: "An existing deposit is already associated with another provider.",
      });
    }

    let initiation: { status: string; depositId: string };
    try {
      initiation = await initiateDeposit({
        depositId: attempt.depositId,
        amountXaf: attempt.amountXaf,
        phoneNumber: payer.phoneNumber,
        providerCode: attempt.providerCode,
      });
    } catch (error) {
      const rejectedByProvider =
        error instanceof PawaPayError &&
        error.code === "HTTP" &&
        typeof error.statusCode === "number" &&
        error.statusCode >= 400 &&
        error.statusCode < 500;
      await billingRpc<void>(authenticated.supabase, "billing_update_payment_attempt", {
        p_deposit_id: attempt.depositId,
        p_status: rejectedByProvider ? "failed" : "unknown",
        p_provider_transaction_id: null,
      });
      if (rejectedByProvider) {
        return res.status(502).json({ error: "PawaPay rejected the deposit request." });
      }
      try {
        const reconciled = await applyProviderStatus(authenticated.supabase, attempt.depositId);
        if (reconciled) {
          return res
            .status(reconciled.status === "paid" || reconciled.status === "failed" ? 200 : 202)
            .json({
              orderId: order.orderId,
              depositId: attempt.depositId,
              status: reconciled.status,
              accessPending: !reconciled.applied,
            });
        }
      } catch (reconcileError) {
        console.error("[billing] immediate status check after an ambiguous initiation failed", {
          name: reconcileError instanceof Error ? reconcileError.name : "unknown",
        });
      }
      await billingRpc<void>(authenticated.supabase, "billing_update_payment_attempt", {
        p_deposit_id: attempt.depositId,
        p_status: "unknown",
        p_provider_transaction_id: null,
      });
      throw error;
    }

    if (initiation.status === "REJECTED") {
      await billingRpc<void>(authenticated.supabase, "billing_update_payment_attempt", {
        p_deposit_id: attempt.depositId,
        p_status: "rejected",
        p_provider_transaction_id: null,
      });
      return res.status(422).json({
        orderId: order.orderId,
        status: "rejected",
        error: "PawaPay rejected the deposit request.",
      });
    }

    await billingRpc<void>(authenticated.supabase, "billing_update_payment_attempt", {
      p_deposit_id: attempt.depositId,
      p_status: "pending",
      p_provider_transaction_id: null,
    });

    if (initiation.status === "DUPLICATE_IGNORED") {
      const reconciled = await applyProviderStatus(authenticated.supabase, attempt.depositId);
      if (reconciled) {
        return res
          .status(reconciled.status === "paid" || reconciled.status === "failed" ? 200 : 202)
          .json({
            orderId: order.orderId,
            depositId: attempt.depositId,
            status: reconciled.status,
            accessPending: !reconciled.applied,
          });
      }
      await billingRpc<void>(authenticated.supabase, "billing_update_payment_attempt", {
        p_deposit_id: attempt.depositId,
        p_status: "unknown",
        p_provider_transaction_id: null,
      });
      return res.status(202).json({
        orderId: order.orderId,
        depositId: attempt.depositId,
        status: "pending",
        message: "Existing deposit found; verify its status before retrying.",
      });
    }

    return res.status(202).json({
      orderId: order.orderId,
      depositId: attempt.depositId,
      status: "pending",
    });
  } catch (error) {
    if (error instanceof PawaPayError && error.code === "RESPONSE") {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof BillingConfigError) {
      return replyWithError(res, error);
    }
    return replyWithError(res, error);
  }
}
