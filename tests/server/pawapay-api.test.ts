import assert from "node:assert/strict";
import test from "node:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import callbackHandler from "../../api/payments/pawapay/callback.ts";
import initiateHandler from "../../api/payments/pawapay/initiate.ts";
import statusHandler from "../../api/payments/pawapay/status.ts";

const originalFetch = globalThis.fetch;
const envNames = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PAWAPAY_API_TOKEN",
  "PAWAPAY_BASE_URL",
  "PAWAPAY_COUNTRY_CODE",
  "PAWAPAY_CALLBACK_URL",
  "PAWAPAY_CALLBACK_SIGNATURES_REQUIRED",
];
const savedEnvironment = new Map(envNames.map((name) => [name, process.env[name]]));

test.before(() => {
  process.env.SUPABASE_URL = "https://sandbox-project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.PAWAPAY_API_TOKEN = "test-pawapay-token";
  process.env.PAWAPAY_BASE_URL = "https://api.sandbox.pawapay.io";
  process.env.PAWAPAY_COUNTRY_CODE = "COG";
  process.env.PAWAPAY_CALLBACK_URL = "https://example.test/api/payments/pawapay/callback";
  process.env.PAWAPAY_CALLBACK_SIGNATURES_REQUIRED = "false";
});

test.after(() => {
  globalThis.fetch = originalFetch;
  for (const [name, value] of savedEnvironment) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

type MockVercelResponse = {
  statusCode: number;
  body: unknown;
  status(code: number): MockVercelResponse;
  json(body: unknown): MockVercelResponse;
  setHeader(name: string, value: string): MockVercelResponse;
};

function mockResponse(): MockVercelResponse {
  const response: MockVercelResponse = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
    setHeader() {
      return response;
    },
  };
  return response;
}

function mockRequest(
  method: string,
  authorization?: string,
  body?: unknown,
  idempotencyKey?: string,
) {
  return {
    method,
    url: "/api/payments/pawapay",
    headers: {
      ...(authorization ? { authorization } : {}),
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    body,
  } as unknown as VercelRequest;
}

test("payment initiation rejects missing or invalid authentication before billing operations", async () => {
  let rpcCalled = false;
  globalThis.fetch = (async (input) => {
    if (String(input).includes("/auth/v1/user")) {
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    rpcCalled = true;
    throw new Error("unexpected request");
  }) as typeof fetch;

  const missingAuth = mockResponse();
  await initiateHandler(mockRequest("POST"), missingAuth as unknown as VercelResponse);
  assert.equal(missingAuth.statusCode, 401);

  const invalidAuth = mockResponse();
  await initiateHandler(
    mockRequest("POST", "Bearer invalid"),
    invalidAuth as unknown as VercelResponse,
  );
  assert.equal(invalidAuth.statusCode, 401);
  assert.equal(rpcCalled, false);
});

test("client-supplied amount is ignored; deposit uses the server-priced order amount", async () => {
  let submittedAmount = "";
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/auth/v1/user")) {
      return new Response(
        JSON.stringify({ id: "user-1", app_metadata: {}, user_metadata: {}, aud: "authenticated" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.includes("active-conf")) {
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
    if (url.pathname.endsWith("/predict-provider")) {
      return new Response(
        JSON.stringify({
          country: "COG",
          provider: "TEST_PROVIDER",
          phoneNumber: "242060000000",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_create_order")) {
      return new Response(
        JSON.stringify({
          orderId: "1de3769d-f0f3-4b64-87da-40b6136b40b8",
          planCode: "premium",
          amountXaf: 550,
          currency: "XAF",
          orderType: "initial",
          status: "pending",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_create_payment_attempt")) {
      const args = JSON.parse(String(init?.body)) as { p_deposit_id: string };
      return new Response(
        JSON.stringify({
          depositId: args.p_deposit_id,
          amountXaf: 550,
          currency: "XAF",
          status: "created",
          providerCode: "TEST_PROVIDER",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_update_payment_attempt")) {
      return new Response("null", { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname.endsWith("/v2/deposits")) {
      const payload = JSON.parse(String(init?.body)) as { amount: string };
      submittedAmount = payload.amount;
      return new Response(
        JSON.stringify({
          depositId: JSON.parse(String(init?.body)).depositId,
          status: "ACCEPTED",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    throw new Error(`Unexpected request to ${url.pathname}`);
  }) as typeof fetch;

  const response = mockResponse();
  await initiateHandler(
    mockRequest(
      "POST",
      "Bearer valid-test-token",
      {
        planCode: "premium",
        providerCode: "TEST_PROVIDER",
        phoneNumber: "242060000000",
        amountXaf: 1,
        currency: "USD",
      },
      "candidate-premium-order-1",
    ),
    response as unknown as VercelResponse,
  );

  assert.equal(response.statusCode, 202);
  assert.equal(submittedAmount, "550");
  assert.equal((response.body as { status: string }).status, "pending");
});

test("an initiation rejection is recorded separately from a failed deposit", async () => {
  let attemptStatus = "";
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/auth/v1/user")) {
      return new Response(
        JSON.stringify({ id: "user-1", app_metadata: {}, user_metadata: {}, aud: "authenticated" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.includes("active-conf")) {
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
    if (url.pathname.endsWith("/predict-provider")) {
      return new Response(
        JSON.stringify({
          country: "COG",
          provider: "TEST_PROVIDER",
          phoneNumber: "242060000000",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_create_order")) {
      return new Response(
        JSON.stringify({
          orderId: "1de3769d-f0f3-4b64-87da-40b6136b40b8",
          planCode: "premium",
          amountXaf: 550,
          currency: "XAF",
          orderType: "initial",
          status: "pending",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_create_payment_attempt")) {
      const args = JSON.parse(String(init?.body)) as { p_deposit_id: string };
      return new Response(
        JSON.stringify({
          depositId: args.p_deposit_id,
          amountXaf: 550,
          currency: "XAF",
          status: "created",
          providerCode: "TEST_PROVIDER",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_update_payment_attempt")) {
      attemptStatus = (JSON.parse(String(init?.body)) as { p_status: string }).p_status;
      return new Response("null", { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname.endsWith("/v2/deposits")) {
      return new Response(JSON.stringify({ depositId: null, status: "REJECTED" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error(`Unexpected request to ${url.pathname}`);
  }) as typeof fetch;

  const response = mockResponse();
  await initiateHandler(
    mockRequest(
      "POST",
      "Bearer valid-test-token",
      {
        planCode: "premium",
        providerCode: "TEST_PROVIDER",
        phoneNumber: "242060000000",
      },
      "candidate-premium-order-rejected",
    ),
    response as unknown as VercelResponse,
  );

  assert.equal(response.statusCode, 422);
  assert.equal(attemptStatus, "rejected");
  assert.equal((response.body as { status: string }).status, "rejected");
});

test("status endpoint refuses an order not owned by the authenticated candidate", async () => {
  let providerCalled = false;
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/auth/v1/user")) {
      return new Response(
        JSON.stringify({
          id: "candidate-a",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_get_order")) {
      return new Response(JSON.stringify({ code: "P0002", message: "order_not_found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    providerCalled = true;
    throw new Error("provider must not be called for an inaccessible order");
  }) as typeof fetch;

  const response = mockResponse();
  await statusHandler(
    mockRequest("POST", "Bearer valid-test-token", {
      orderId: "1de3769d-f0f3-4b64-87da-40b6136b40b8",
    }),
    response as unknown as VercelResponse,
  );

  assert.equal(response.statusCode, 404);
  assert.equal(providerCalled, false);
});

test("status endpoint preserves an ambiguous result when PawaPay times out", async () => {
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/auth/v1/user")) {
      return new Response(
        JSON.stringify({
          id: "candidate-a",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_get_order")) {
      return new Response(
        JSON.stringify({
          orderId: "1de3769d-f0f3-4b64-87da-40b6136b40b8",
          status: "pending",
          depositId: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
          attemptStatus: "unknown",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.includes("/v2/deposits/")) {
      const timeout = new Error("timeout");
      timeout.name = "TimeoutError";
      throw timeout;
    }
    throw new Error(`Unexpected request to ${url.pathname}`);
  }) as typeof fetch;

  const response = mockResponse();
  await statusHandler(
    mockRequest("POST", "Bearer valid-test-token", {
      orderId: "1de3769d-f0f3-4b64-87da-40b6136b40b8",
    }),
    response as unknown as VercelResponse,
  );

  assert.equal(response.statusCode, 202);
  assert.deepEqual(response.body, {
    orderId: "1de3769d-f0f3-4b64-87da-40b6136b40b8",
    status: "unknown",
    pending: true,
  });
});

test("a callback claiming completion is recorded but cannot confirm rights before provider verification", async () => {
  let callbackRecorded = false;
  let confirmationAttempted = false;
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/rpc/billing_record_webhook_event")) {
      callbackRecorded = true;
      return new Response("true", { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname.endsWith("/deposits/62b54ba9-a988-42a8-80a5-911f2d7f5443")) {
      return new Response(JSON.stringify({ status: "NOT_FOUND" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.pathname.endsWith("/rpc/billing_confirm_deposit")) confirmationAttempted = true;
    throw new Error(`Unexpected request to ${url.pathname}`);
  }) as typeof fetch;

  const body = Buffer.from(
    JSON.stringify({
      depositId: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
      status: "COMPLETED",
    }),
  );
  const request = {
    method: "POST",
    url: "/api/payments/pawapay/callback",
    headers: { "content-type": "application/json" },
    async *[Symbol.asyncIterator]() {
      yield body;
    },
  } as unknown as VercelRequest;
  const response = mockResponse();

  await callbackHandler(request, response as unknown as VercelResponse);

  assert.equal(callbackRecorded, true);
  assert.equal(confirmationAttempted, false);
  assert.equal(response.statusCode, 503);
});
