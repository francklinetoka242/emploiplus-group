export type PlanCode = "free" | "premium" | "premium_plus";

export type BillingSubscription = {
  entitlement: {
    planCode: PlanCode;
    planVersion: number;
    startsAt: string | null;
    expiresAt: string | null;
  };
  scheduledChange: {
    targetPlanCode: PlanCode;
    effectiveAt: string;
    status: "pending" | "awaiting_payment" | "paid_scheduled";
    reasonCode: string;
  } | null;
  pendingOrder: {
    orderId: string;
    planCode: Exclude<PlanCode, "free">;
    amountXaf: number;
    currency: "XAF";
    status: "pending";
    depositId: string | null;
    attemptStatus: string | null;
  } | null;
};

export type PaymentStatus = {
  orderId: string;
  status: string;
  applied?: boolean;
  planCode?: PlanCode;
  startsAt?: string;
  expiresAt?: string;
  pending?: boolean;
};

async function billingRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Le service de paiement est momentanément indisponible.";
    throw new Error(message);
  }
  return payload as T;
}

export function getBillingSubscription(accessToken: string) {
  return billingRequest<BillingSubscription>("/api/payments/pawapay/subscription", accessToken);
}

export function getPawaPayProviders(accessToken: string) {
  return billingRequest<{ providers: string[]; currency: "XAF" }>(
    "/api/payments/pawapay/providers",
    accessToken,
  );
}

export function initiateCandidatePayment(
  accessToken: string,
  input: { planCode: Exclude<PlanCode, "free">; providerCode: string; phoneNumber: string },
) {
  return billingRequest<PaymentStatus & { depositId?: string }>(
    "/api/payments/pawapay/initiate",
    accessToken,
    {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(input),
    },
  );
}

export function refreshCandidatePayment(accessToken: string, orderId: string) {
  return billingRequest<PaymentStatus>("/api/payments/pawapay/status", accessToken, {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}
