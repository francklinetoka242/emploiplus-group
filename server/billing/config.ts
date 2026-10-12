import "dotenv/config";

export class BillingConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingConfigError";
  }
}

export type BillingConfig = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  pawapayBaseUrl: string;
  pawapayApiToken: string;
  pawapayCountryCode: string;
  pawapayCallbackUrls: Partial<Record<PawaPayCallbackCategory, string>>;
  pawapayCallbackUrl?: string;
  signedCallbacksRequired?: boolean;
  reconcileSecret?: string;
  reconcileAfterSeconds?: number;
};

export type PawaPayCallbackCategory = "deposits" | "checkouts" | "payouts" | "refunds";

const CALLBACK_URL_ENV_NAMES: Record<PawaPayCallbackCategory, string> = {
  deposits: "PAWAPAY_CALLBACK_URL",
  checkouts: "PAWAPAY_CHECKOUT_CALLBACK_URL",
  payouts: "PAWAPAY_PAYOUT_CALLBACK_URL",
  refunds: "PAWAPAY_REFUND_CALLBACK_URL",
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new BillingConfigError(`Missing required server configuration: ${name}`);
  return value;
}

export function getBillingConfig(): BillingConfig {
  const supabaseUrl = required("SUPABASE_URL");
  const supabaseServiceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const pawapayApiToken = required("PAWAPAY_API_TOKEN");
  const pawapayBaseUrl = required("PAWAPAY_BASE_URL").replace(/\/+$/, "");
  const pawapayCountryCode = required("PAWAPAY_COUNTRY_CODE").toUpperCase();
  const signatureSetting = process.env.PAWAPAY_CALLBACK_SIGNATURES_REQUIRED?.trim().toLowerCase();
  const reconcileSecret = process.env.PAWAPAY_RECONCILE_SECRET?.trim();
  const reconcileAfterRaw = process.env.PAWAPAY_RECONCILE_AFTER_SECONDS?.trim();

  let baseUrl: URL;
  try {
    baseUrl = new URL(pawapayBaseUrl);
  } catch {
    throw new BillingConfigError("PawaPay base URL must be a valid absolute URL");
  }

  if (
    baseUrl.protocol !== "https:" ||
    baseUrl.hostname !== "api.sandbox.pawapay.io" ||
    baseUrl.pathname !== "/" ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new BillingConfigError("PawaPay API must use the official Sandbox host over HTTPS");
  }

  if (!/^[A-Z]{3}$/.test(pawapayCountryCode)) {
    throw new BillingConfigError("PAWAPAY_COUNTRY_CODE must be a three-letter country code");
  }

  const config: BillingConfig = {
    supabaseUrl: supabaseUrl.replace(/\/+$/, ""),
    supabaseServiceRoleKey,
    pawapayBaseUrl,
    pawapayApiToken,
    pawapayCountryCode,
    pawapayCallbackUrls: {},
  };
  for (const [category, envName] of Object.entries(CALLBACK_URL_ENV_NAMES) as [
    PawaPayCallbackCategory,
    string,
  ][]) {
    const callbackUrl = process.env[envName]?.trim();
    if (!callbackUrl) continue;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(callbackUrl);
    } catch {
      throw new BillingConfigError(`${envName} must be a valid absolute URL`);
    }
    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.search ||
      parsedUrl.hash
    ) {
      throw new BillingConfigError(
        `${envName} must be a public HTTPS URL without query parameters`,
      );
    }
    config.pawapayCallbackUrls[category] = callbackUrl;
  }
  config.pawapayCallbackUrl = config.pawapayCallbackUrls.deposits;
  if (signatureSetting === "true" || signatureSetting === "false") {
    config.signedCallbacksRequired = signatureSetting === "true";
  } else if (signatureSetting) {
    throw new BillingConfigError("PAWAPAY_CALLBACK_SIGNATURES_REQUIRED must be true or false");
  }
  if (reconcileSecret) config.reconcileSecret = reconcileSecret;
  if (reconcileAfterRaw) {
    const reconcileAfterSeconds = Number(reconcileAfterRaw);
    if (
      !Number.isInteger(reconcileAfterSeconds) ||
      reconcileAfterSeconds < 1 ||
      reconcileAfterSeconds > 86400
    ) {
      throw new BillingConfigError("PAWAPAY_RECONCILE_AFTER_SECONDS must be between 1 and 86400");
    }
    config.reconcileAfterSeconds = reconcileAfterSeconds;
  }

  return config;
}

export function getPawaPayCallbackUrl(category: PawaPayCallbackCategory): string {
  const callbackUrl = getBillingConfig().pawapayCallbackUrls[category];
  if (!callbackUrl) {
    throw new BillingConfigError(`${CALLBACK_URL_ENV_NAMES[category]} is not configured`);
  }
  return callbackUrl;
}
