import test from "node:test";
import assert from "node:assert/strict";
import {
  getAvailableProviders,
  getDepositStatus,
  initiateDeposit,
  PawaPayError,
  validatePayer,
} from "../../server/billing/pawapay.ts";
import { getBillingConfig } from "../../server/billing/config.ts";

const originalFetch = globalThis.fetch;
const envNames = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PAWAPAY_API_TOKEN",
  "PAWAPAY_BASE_URL",
  "PAWAPAY_COUNTRY_CODE",
];
const savedEnvironment = new Map(envNames.map((name) => [name, process.env[name]]));

test.before(() => {
  process.env.SUPABASE_URL = "https://sandbox-project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.PAWAPAY_API_TOKEN = "test-pawapay-token";
  process.env.PAWAPAY_BASE_URL = "https://api.sandbox.pawapay.io";
  process.env.PAWAPAY_COUNTRY_CODE = "COG";
});

test.after(() => {
  globalThis.fetch = originalFetch;
  for (const [name, value] of savedEnvironment) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("deposit initiation uses the same UUID and fixed XAF amount and accepts duplicate response", async () => {
  const depositId = "62b54ba9-a988-42a8-80a5-911f2d7f5443";
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  globalThis.fetch = (async (input, init) => {
    requestedUrl = String(input);
    requestedInit = init;
    return new Response(JSON.stringify({ depositId, status: "DUPLICATE_IGNORED" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  const result = await initiateDeposit({
    depositId,
    amountXaf: 550,
    phoneNumber: "242060000000",
    providerCode: "TEST_PROVIDER",
  });

  assert.equal(requestedUrl, "https://api.sandbox.pawapay.io/v2/deposits");
  assert.equal(result.status, "DUPLICATE_IGNORED");
  assert.deepEqual(JSON.parse(String(requestedInit?.body)), {
    depositId,
    amount: "550",
    currency: "XAF",
    payer: {
      type: "MMO",
      accountDetails: {
        phoneNumber: "242060000000",
        provider: "TEST_PROVIDER",
      },
    },
  });
});

test("deposit status uses the documented GET resource and validates its reference", async () => {
  const depositId = "62b54ba9-a988-42a8-80a5-911f2d7f5443";
  let requestedUrl = "";
  globalThis.fetch = (async (input) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        status: "FOUND",
        data: {
          depositId,
          status: "COMPLETED",
          amount: "550.00",
          currency: "XAF",
          providerTransactionId: "provider-reference",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  const result = await getDepositStatus(depositId);
  assert.equal(requestedUrl, `https://api.sandbox.pawapay.io/v2/deposits/${depositId}`);
  assert.equal(result?.status, "COMPLETED");
  assert.equal(result?.amount, "550.00");
  assert.equal(result?.currency, "XAF");
});

test("deposit status reports NOT_FOUND without treating it as payment success", async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ status: "NOT_FOUND" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
  assert.equal(await getDepositStatus("62b54ba9-a988-42a8-80a5-911f2d7f5443"), null);
});

test("deposit initiation accepts an explicit REJECTED response without a deposit id", async () => {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        depositId: null,
        status: "REJECTED",
        failureReason: { failureCode: "INVALID_AMOUNT" },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;

  const result = await initiateDeposit({
    depositId: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
    amountXaf: 550,
    phoneNumber: "242060000000",
    providerCode: "TEST_PROVIDER",
  });
  assert.equal(result.status, "REJECTED");
});

test("deposit initiation reports ACCEPTED without treating it as a completed payment", async () => {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        depositId: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
        status: "ACCEPTED",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;
  const result = await initiateDeposit({
    depositId: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
    amountXaf: 1050,
    phoneNumber: "242060000000",
    providerCode: "TEST_PROVIDER",
  });
  assert.equal(result.status, "ACCEPTED");
});

test("available providers are filtered to the configured country's XAF deposits", async () => {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        countries: [
          {
            country: "COG",
            providers: [
              {
                provider: "XAF_PROVIDER",
                currencies: [{ currency: "XAF", operationTypes: ["DEPOSIT"] }],
              },
              {
                provider: "USD_PROVIDER",
                currencies: [{ currency: "USD", operationTypes: ["DEPOSIT"] }],
              },
            ],
          },
          {
            country: "OTHER",
            providers: [
              {
                provider: "OTHER_COUNTRY_PROVIDER",
                currencies: [{ currency: "XAF", operationTypes: ["DEPOSIT"] }],
              },
            ],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;
  assert.deepEqual(await getAvailableProviders(), ["XAF_PROVIDER"]);
});

test("network timeout is reported as an uncertain PawaPay request", async () => {
  globalThis.fetch = (async () => {
    const error = new Error("timeout");
    error.name = "TimeoutError";
    throw error;
  }) as typeof fetch;
  await assert.rejects(
    getDepositStatus("62b54ba9-a988-42a8-80a5-911f2d7f5443"),
    (error: unknown) => error instanceof PawaPayError && error.code === "TIMEOUT",
  );
});

test("payer validation uses the configured country and account-specific XAF provider list", async () => {
  const urls: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = String(input);
    urls.push(url);
    if (url.includes("active-conf")) {
      return new Response(
        JSON.stringify({
          countries: [
            {
              country: "COG",
              providers: [
                {
                  provider: "TEST_PROVIDER",
                  currencies: [{ currency: "XAF", operationTypes: ["DEPOSIT"] }],
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({
        country: "COG",
        provider: "TEST_PROVIDER",
        phoneNumber: "242060000000",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  const payer = await validatePayer("242060000000", "TEST_PROVIDER");
  assert.equal(payer.phoneNumber, "242060000000");
  assert.ok(urls.some((url) => url.includes("country=COG")));
  assert.equal(getBillingConfig().pawapayCountryCode, "COG");
});

test("PawaPay configuration refuses a production base URL", () => {
  process.env.PAWAPAY_BASE_URL = "https://api.pawapay.io";
  assert.throws(() => getBillingConfig(), /official Sandbox host/);
  process.env.PAWAPAY_BASE_URL = "https://api.sandbox.pawapay.io";
});
