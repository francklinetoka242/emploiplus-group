import type { VercelRequest, VercelResponse } from "@vercel/node";
import { billingRpc, authenticateCandidate } from "../../../server/billing/supabase.js";
import { applyProviderStatus } from "../../../server/billing/reconcile.js";
import { PawaPayError } from "../../../server/billing/pawapay.js";
import { isUuid, parseJsonBody, replyWithError } from "../../../server/billing/http.js";

type OrderLookup = {
  orderId: string;
  status: string;
  depositId: string | null;
  attemptStatus: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let requestedOrderId: string | undefined;
  try {
    const authenticated = await authenticateCandidate(req.headers.authorization);
    if (!authenticated) return res.status(401).json({ error: "Authentication required." });
    const body = parseJsonBody(req);
    if (!body || !isUuid(body.orderId)) {
      return res.status(400).json({ error: "A valid orderId is required." });
    }
    requestedOrderId = body.orderId;

    const order = await billingRpc<OrderLookup>(authenticated.supabase, "billing_get_order", {
      p_user_id: authenticated.user.id,
      p_order_id: body.orderId,
    });
    if (!order.depositId) {
      return res.status(200).json({ orderId: order.orderId, status: order.status });
    }

    const result = await applyProviderStatus(authenticated.supabase, order.depositId);
    if (!result) {
      await billingRpc<void>(authenticated.supabase, "billing_update_payment_attempt", {
        p_deposit_id: order.depositId,
        p_status: "unknown",
        p_provider_transaction_id: null,
      });
      return res.status(202).json({
        orderId: order.orderId,
        status: "unknown",
        pending: true,
      });
    }
    return res.status(200).json({ orderId: order.orderId, ...result });
  } catch (error) {
    if (error instanceof PawaPayError && (error.code === "TIMEOUT" || error.code === "NETWORK")) {
      return res.status(202).json({
        ...(requestedOrderId ? { orderId: requestedOrderId } : {}),
        status: "unknown",
        pending: true,
      });
    }
    return replyWithError(res, error);
  }
}
