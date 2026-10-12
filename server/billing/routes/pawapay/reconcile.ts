import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BillingConfigError, getBillingConfig } from "../../config.js";
import { replyWithError } from "../../http.js";
import {
  getReconciliationConfig,
  reconcileDeposit,
  constantTimeSecretMatches,
} from "../../reconcile.js";
import { getBillingSupabase, billingRpc } from "../../supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = getBillingConfig();
    if (!config.reconcileSecret || !config.reconcileAfterSeconds) {
      throw new BillingConfigError("Reconciliation configuration is missing");
    }
    if (
      !constantTimeSecretMatches(req, config.reconcileSecret) &&
      !constantTimeSecretMatches(req, process.env.CRON_SECRET)
    ) {
      return res.status(401).json({ error: "Invalid reconciliation authorization." });
    }

    const { before } = getReconciliationConfig();
    const supabase = getBillingSupabase();
    const rows = await billingRpc<Array<{ deposit_id: string }>>(
      supabase,
      "billing_list_reconcilable_attempts",
      { p_before: before, p_limit: 25 },
    );
    const results: Array<{ depositId: string; status: string }> = [];

    for (const { deposit_id: depositId } of rows) {
      try {
        const result = await reconcileDeposit(supabase, depositId);
        if (result.status === "not_found") {
          await billingRpc<void>(supabase, "billing_update_payment_attempt", {
            p_deposit_id: depositId,
            p_status: "unknown",
            p_provider_transaction_id: null,
          });
        }
        results.push({ depositId, status: result.status });
      } catch (error) {
        console.error("[billing] reconciliation item failed", {
          name: error instanceof Error ? error.name : "unknown",
        });
        results.push({ depositId, status: "reconciliation_error" });
      }
    }

    const entitlementsUpdated = await billingRpc<number>(
      supabase,
      "billing_apply_due_entitlements",
      { p_limit: 100 },
    );

    return res.status(200).json({
      checked: results.length,
      entitlementsUpdated,
      results: results.map(({ depositId, status }) => ({ depositId, status })),
    });
  } catch (error) {
    return replyWithError(res, error);
  }
}
