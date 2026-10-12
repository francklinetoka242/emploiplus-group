import { getBillingConfig } from "./config.js";
import type { PawaPayCallbackCategory } from "./config.js";

type UnknownRecord = Record<string, unknown>;

export type PawaPayDeposit = {
  depositId: string;
  status: string;
  amount?: string;
  currency?: string;
  providerTransactionId?: string;
};

export class PawaPayError extends Error {
  constructor(
    message: string,
    readonly code: "CONFIG" | "TIMEOUT" | "NETWORK" | "HTTP" | "RESPONSE" | "NOT_FOUND",
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = "PawaPayError";
  }
}

async function requestPawaPay(path: string, init: RequestInit = {}): Promise<unknown> {
  const config = getBillingConfig();
  let response: Response;
  try {
    response = await fetch(`${config.pawapayBaseUrl}/v2/${path.replace(/^\/+/, "")}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${config.pawapayApiToken}`,
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new PawaPayError("PawaPay request timed out", "TIMEOUT");
    }
    throw new PawaPayError("PawaPay request failed", "NETWORK");
  }

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new PawaPayError("PawaPay returned malformed JSON", "RESPONSE", response.status);
  }

  if (!response.ok) {
    throw new PawaPayError("PawaPay rejected the request", "HTTP", response.status);
  }
  return payload;
}

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function isProviderEnabled(configuration: unknown, providerCode: string, currency: string) {
  const root = asRecord(configuration);
  const countries = root && Array.isArray(root.countries) ? root.countries : [];
  return countries.some((countryValue) => {
    const country = asRecord(countryValue);
    if (country?.country !== getBillingConfig().pawapayCountryCode) return false;
    const providers = Array.isArray(country.providers) ? country.providers : [];
    return providers.some((providerValue) => {
      const provider = asRecord(providerValue);
      if (provider?.provider !== providerCode) return false;
      const currencies = Array.isArray(provider.currencies) ? provider.currencies : [];
      return currencies.some((currencyValue) => {
        const entry = asRecord(currencyValue);
        if (entry?.currency !== currency) return false;
        const operationTypes = Array.isArray(entry.operationTypes) ? entry.operationTypes : [];
        return operationTypes.includes("DEPOSIT");
      });
    });
  });
}

export async function getAvailableProviders(): Promise<string[]> {
  const config = getBillingConfig();
  const activeConfiguration = asRecord(
    await requestPawaPay(
      `active-conf?country=${encodeURIComponent(config.pawapayCountryCode)}&operationType=DEPOSIT`,
    ),
  );
  if (!activeConfiguration || !Array.isArray(activeConfiguration.countries)) {
    throw new PawaPayError("PawaPay returned invalid active provider configuration", "RESPONSE");
  }
  const countries = activeConfiguration.countries;
  const country = countries
    .map(asRecord)
    .find((entry) => entry?.country === config.pawapayCountryCode);
  if (!country || !Array.isArray(country.providers)) {
    throw new PawaPayError("Configured country is unavailable for PawaPay deposits", "RESPONSE");
  }
  const providers = country.providers;

  return providers
    .map(asRecord)
    .filter((provider): provider is UnknownRecord => typeof provider?.provider === "string")
    .filter((provider) => isProviderEnabled(activeConfiguration, String(provider.provider), "XAF"))
    .map((provider) => String(provider.provider))
    .sort();
}

export async function validatePayer(phoneNumber: string, providerCode: string) {
  const config = getBillingConfig();
  if (!/^[A-Z0-9_]{2,40}$/.test(providerCode)) {
    throw new PawaPayError("Invalid payment provider", "RESPONSE");
  }

  const [activeConfiguration, prediction] = await Promise.all([
    requestPawaPay(
      `active-conf?country=${encodeURIComponent(config.pawapayCountryCode)}&operationType=DEPOSIT`,
    ),
    requestPawaPay("predict-provider", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),
  ]);

  if (!isProviderEnabled(activeConfiguration, providerCode, "XAF")) {
    throw new PawaPayError(
      "Provider is not enabled for XAF deposits in configured market",
      "RESPONSE",
    );
  }

  const result = asRecord(prediction);
  if (
    !result ||
    result.country !== config.pawapayCountryCode ||
    result.provider !== providerCode ||
    typeof result.phoneNumber !== "string" ||
    !result.phoneNumber
  ) {
    throw new PawaPayError(
      "Phone number and provider do not match the active PawaPay configuration",
      "RESPONSE",
    );
  }

  return { phoneNumber: result.phoneNumber, providerCode };
}

export async function initiateDeposit(input: {
  depositId: string;
  amountXaf: number;
  phoneNumber: string;
  providerCode: string;
}): Promise<{ status: string; depositId: string }> {
  const payload = asRecord(
    await requestPawaPay("deposits", {
      method: "POST",
      body: JSON.stringify({
        depositId: input.depositId,
        amount: String(input.amountXaf),
        currency: "XAF",
        payer: {
          type: "MMO",
          accountDetails: {
            phoneNumber: input.phoneNumber,
            provider: input.providerCode,
          },
        },
      }),
    }),
  );

  if (
    !payload ||
    !["ACCEPTED", "REJECTED", "DUPLICATE_IGNORED"].includes(String(payload.status)) ||
    (payload.status !== "REJECTED" && payload.depositId !== input.depositId)
  ) {
    throw new PawaPayError("PawaPay returned an invalid deposit initiation response", "RESPONSE");
  }
  return { status: String(payload.status), depositId: input.depositId };
}

export async function getDepositStatus(depositId: string): Promise<PawaPayDeposit | null> {
  const payload = asRecord(await requestPawaPay(`deposits/${encodeURIComponent(depositId)}`));
  if (!payload)
    throw new PawaPayError("PawaPay returned an invalid deposit status response", "RESPONSE");
  if (payload.status === "NOT_FOUND") return null;
  if (payload.status !== "FOUND") {
    throw new PawaPayError("PawaPay returned an unknown deposit lookup status", "RESPONSE");
  }

  const deposit = asRecord(payload.data);
  if (
    !deposit ||
    deposit.depositId !== depositId ||
    typeof deposit.status !== "string" ||
    typeof deposit.amount !== "string" ||
    typeof deposit.currency !== "string"
  ) {
    throw new PawaPayError("PawaPay returned malformed deposit details", "RESPONSE");
  }

  return {
    depositId,
    status: deposit.status,
    amount: deposit.amount,
    currency: deposit.currency,
    ...(typeof deposit.providerTransactionId === "string"
      ? { providerTransactionId: deposit.providerTransactionId }
      : {}),
  };
}

const CALLBACK_RESOURCE_PATHS: Record<
  Exclude<PawaPayCallbackCategory, "deposits">,
  { path: string; idField: string }
> = {
  checkouts: { path: "checkouts", idField: "checkoutId" },
  payouts: { path: "payouts", idField: "payoutId" },
  refunds: { path: "refunds", idField: "refundId" },
};

export async function getPawaPayCallbackStatus(
  category: Exclude<PawaPayCallbackCategory, "deposits">,
  operationId: string,
): Promise<string | null> {
  const resource = CALLBACK_RESOURCE_PATHS[category];
  const response = asRecord(
    await requestPawaPay(`${resource.path}/${encodeURIComponent(operationId)}`),
  );
  if (!response) {
    throw new PawaPayError("PawaPay returned an invalid callback status response", "RESPONSE");
  }
  if (response.status === "NOT_FOUND") return null;
  if (response.status !== "FOUND") {
    throw new PawaPayError("PawaPay returned an unknown callback lookup status", "RESPONSE");
  }

  const operation = asRecord(response.data);
  if (
    !operation ||
    operation[resource.idField] !== operationId ||
    typeof operation.status !== "string"
  ) {
    throw new PawaPayError("PawaPay returned malformed callback status details", "RESPONSE");
  }
  return operation.status;
}
