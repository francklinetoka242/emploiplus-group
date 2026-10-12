import type { VercelRequest } from "@vercel/node";
import { createHash, timingSafeEqual } from "node:crypto";
import { getBillingConfig } from "./config.js";
import { billingRpc } from "./supabase.js";
import { getDepositStatus, PawaPayError, type PawaPayDeposit } from "./pawapay.js";

type PaymentResult = {
  applied: boolean;
  status: string;
  planCode?: string;
  startsAt?: string;
  expiresAt?: string;
};

export async function applyProviderStatus(
  supabase: Parameters<typeof billingRpc>[0],
  depositId: string,
): Promise<PaymentResult | null> {
  const deposit = await getDepositStatus(depositId);
  if (!deposit) return null;
  return confirmVerifiedDeposit(supabase, deposit);
}

export async function confirmVerifiedDeposit(
  supabase: Parameters<typeof billingRpc>[0],
  deposit: PawaPayDeposit,
): Promise<PaymentResult> {
  const amount = deposit.amount;
  if (!amount || !/^\d+(?:\.\d+)?$/.test(amount) || !deposit.currency) {
    throw new PawaPayError("PawaPay deposit amount or currency is invalid", "RESPONSE");
  }
  const result = await billingRpc<PaymentResult>(supabase, "billing_confirm_deposit", {
    p_deposit_id: deposit.depositId,
    p_provider_status: deposit.status,
    p_amount: amount,
    p_currency: deposit.currency,
    p_provider_transaction_id: deposit.providerTransactionId ?? null,
  });
  if (
    result.status === "pending" &&
    !["ACCEPTED", "PROCESSING", "IN_RECONCILIATION"].includes(deposit.status)
  ) {
    return { ...result, status: "unknown" };
  }
  return result;
}

export async function reconcileDeposit(
  supabase: Parameters<typeof billingRpc>[0],
  depositId: string,
) {
  const result = await applyProviderStatus(supabase, depositId);
  return result ?? { applied: false, status: "not_found" };
}

export function sha256Hex(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function recordCallbackEvent(
  supabase: Parameters<typeof billingRpc>[0],
  depositId: string,
  providerStatus: string,
  rawBody: Buffer,
  authenticationVerified: boolean,
) {
  return billingRpc<boolean>(supabase, "billing_record_webhook_event", {
    p_deposit_id: depositId,
    p_provider_status: providerStatus,
    p_payload_sha256: sha256Hex(rawBody),
    p_authentication_verified: authenticationVerified,
  });
}

export async function completeCallbackEvent(
  supabase: Parameters<typeof billingRpc>[0],
  depositId: string,
  rawBody: Buffer,
) {
  return billingRpc<void>(supabase, "billing_finish_webhook_event", {
    p_deposit_id: depositId,
    p_payload_sha256: sha256Hex(rawBody),
  });
}

export function constantTimeSecretMatches(
  req: VercelRequest,
  expectedSecret: string | undefined,
): boolean {
  const header = req.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  const provided = value?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!provided || !expectedSecret) return false;
  const actualBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expectedSecret);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export function getReconciliationConfig() {
  const config = getBillingConfig();
  if (!config.reconcileSecret || !config.reconcileAfterSeconds) {
    throw new Error("Reconciliation configuration is missing");
  }
  return {
    secret: config.reconcileSecret,
    before: new Date(Date.now() - config.reconcileAfterSeconds * 1000).toISOString(),
  };
}
