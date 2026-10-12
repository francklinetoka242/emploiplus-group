import assert from "node:assert/strict";
import test from "node:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import checkoutHandler from "../../api/payments/pawapay/checkouts/callback.ts";
import payoutHandler from "../../api/payments/pawapay/payouts/callback.ts";
import refundHandler from "../../api/payments/pawapay/refunds/callback.ts";

const originalFetch = globalThis.fetch;
const envNames = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PAWAPAY_API_TOKEN",
  "PAWAPAY_BASE_URL",
  "PAWAPAY_COUNTRY_CODE",
  "PAWAPAY_CALLBACK_URL",
  "PAWAPAY_CHECKOUT_CALLBACK_URL",
  "PAWAPAY_PAYOUT_CALLBACK_URL",
  "PAWAPAY_REFUND_CALLBACK_URL",
  "PAWAPAY_CALLBACK_SIGNATURES_REQUIRED",
];
const savedEnvironment = new Map(envNames.map((name) => [name, process.env[name]]));

const callbackUrls = {
  checkouts: "https://example.test/api/payments/pawapay/checkouts/callback",
  payouts: "https://example.test/api/payments/pawapay/payouts/callback",
  refunds: "https://example.test/api/payments/pawapay/refunds/callback",
};

test.before(() => {
  process.env.SUPABASE_URL = "https://sandbox-project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.PAWAPAY_API_TOKEN = "test-pawapay-token";
  process.env.PAWAPAY_BASE_URL = "https://api.sandbox.pawapay.io";
  process.env.PAWAPAY_COUNTRY_CODE = "COG";
  process.env.PAWAPAY_CALLBACK_URL = "https://example.test/api/payments/pawapay/callback";
  process.env.PAWAPAY_CHECKOUT_CALLBACK_URL = callbackUrls.checkouts;
  process.env.PAWAPAY_PAYOUT_CALLBACK_URL = callbackUrls.payouts;
  process.env.PAWAPAY_REFUND_CALLBACK_URL = callbackUrls.refunds;
  process.env.PAWAPAY_CALLBACK_SIGNATURES_REQUIRED = "false";
});

test.after(() => {
  globalThis.fetch = originalFetch;
  for (const [name, value] of savedEnvironment) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

type MockResponse = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
  setHeader(name: string, value: string): MockResponse;
};

function mockResponse(): MockResponse {
  const response: MockResponse = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
    setHeader(name, value) {
      response.headers[name.toLowerCase()] = value;
      return response;
    },
  };
  return response;
}

function mockRequest(
  category: keyof typeof callbackUrls,
  body: unknown,
  headers: Record<string, string> = { "content-type": "application/json" },
) {
  const rawBody = Buffer.from(JSON.stringify(body));
  return {
    method: "POST",
    url: new URL(callbackUrls[category]).pathname,
    headers,
    async *[Symbol.asyncIterator]() {
      yield rawBody;
    },
  } as unknown as VercelRequest;
}

function mockProviderAndRpc(
  category: keyof typeof callbackUrls,
  operationId: string,
  status: string,
  rpcResult: unknown = [{ accepted: true, is_new: true, source_deposit_id: null }],
) {
  const requests: Array<{ path: string; body?: string }> = [];
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    requests.push({ path: url.pathname, ...(init?.body ? { body: String(init.body) } : {}) });
    if (url.pathname === `/v2/${category}/${operationId}`) {
      return new Response(
        JSON.stringify({
          status: "FOUND",
          data: {
            [`${category.slice(0, -1)}Id`]: operationId,
            status,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_record_pawapay_callback_event")) {
      return new Response(JSON.stringify(rpcResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error(`Unexpected request to ${url.pathname}`);
  }) as typeof fetch;
  return requests;
}

test("checkout callback verifies the final checkout with PawaPay and records it without billing mutations", async () => {
  const id = "afb57b93-7849-49aa-babb-4c3ccbfe3d79";
  const requests = mockProviderAndRpc("checkouts", id, "COMPLETED");
  const response = mockResponse();
  await checkoutHandler(
    mockRequest("checkouts", { checkoutId: id, status: "COMPLETED" }),
    response as unknown as VercelResponse,
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { received: true });
  assert.deepEqual(
    requests.map((request) => request.path),
    [`/v2/checkouts/${id}`, "/rest/v1/rpc/billing_record_pawapay_callback_event"],
  );
  const rpcArgs = JSON.parse(requests[1].body ?? "{}") as Record<string, unknown>;
  assert.equal(rpcArgs.p_callback_type, "checkouts");
  assert.equal(rpcArgs.p_operation_id, id);
  assert.equal(rpcArgs.p_provider_status, "COMPLETED");
});

test("payout callback verifies the PawaPay record and does not initiate a payout", async () => {
  const id = "62b54ba9-a988-42a8-80a5-911f2d7f5443";
  const requests = mockProviderAndRpc("payouts", id, "FAILED");
  const response = mockResponse();
  await payoutHandler(
    mockRequest("payouts", { payoutId: id, status: "FAILED" }),
    response as unknown as VercelResponse,
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    requests.map((request) => request.path),
    [`/v2/payouts/${id}`, "/rest/v1/rpc/billing_record_pawapay_callback_event"],
  );
});

test("refund callback verifies status and records only against a pre-registered source deposit", async () => {
  const id = "f4401bd2-1568-4140-bf2d-eb77d2b2b639";
  const requests = mockProviderAndRpc("refunds", id, "COMPLETED", [
    {
      accepted: true,
      is_new: true,
      source_deposit_id: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
    },
  ]);
  const response = mockResponse();
  await refundHandler(
    mockRequest("refunds", { refundId: id, status: "COMPLETED" }),
    response as unknown as VercelResponse,
  );

  assert.equal(response.statusCode, 200);
  const rpcArgs = JSON.parse(requests[1].body ?? "{}") as Record<string, unknown>;
  assert.equal(rpcArgs.p_callback_type, "refunds");
  assert.equal(rpcArgs.p_operation_id, id);
  assert.equal(rpcArgs.p_provider_status, "COMPLETED");
});

test("duplicate final callbacks return success without applying a second change", async () => {
  const id = "afb57b93-7849-49aa-babb-4c3ccbfe3d79";
  mockProviderAndRpc("checkouts", id, "COMPLETED", [
    { accepted: true, is_new: false, source_deposit_id: null },
  ]);
  const response = mockResponse();
  await checkoutHandler(
    mockRequest("checkouts", { checkoutId: id, status: "COMPLETED" }),
    response as unknown as VercelResponse,
  );
  assert.equal(response.statusCode, 200);
});

test("unregistered refunds are not acknowledged as processed", async () => {
  const id = "f4401bd2-1568-4140-bf2d-eb77d2b2b639";
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname === `/v2/refunds/${id}`) {
      return new Response(
        JSON.stringify({ status: "FOUND", data: { refundId: id, status: "COMPLETED" } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.pathname.endsWith("/rpc/billing_record_pawapay_callback_event")) {
      return new Response(
        JSON.stringify({
          code: "P0002",
          message: "pawapay_refund_not_registered",
          details: null,
          hint: null,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
    throw new Error(`Unexpected request to ${url.pathname}`);
  }) as typeof fetch;

  const response = mockResponse();
  await refundHandler(
    mockRequest("refunds", { refundId: id, status: "COMPLETED" }),
    response as unknown as VercelResponse,
  );
  assert.equal(response.statusCode, 409);
});

test("callbacks with a different provider status are retried, not persisted as success", async () => {
  const id = "afb57b93-7849-49aa-babb-4c3ccbfe3d79";
  mockProviderAndRpc("checkouts", id, "FAILED");
  const response = mockResponse();
  await checkoutHandler(
    mockRequest("checkouts", { checkoutId: id, status: "COMPLETED" }),
    response as unknown as VercelResponse,
  );
  assert.equal(response.statusCode, 503);
});

test("malformed and wrong-category callbacks are rejected before provider access", async () => {
  let providerCalled = false;
  globalThis.fetch = (async () => {
    providerCalled = true;
    throw new Error("unexpected provider call");
  }) as typeof fetch;

  const wrongCategory = mockResponse();
  await payoutHandler(
    mockRequest("payouts", {
      checkoutId: "afb57b93-7849-49aa-babb-4c3ccbfe3d79",
      status: "COMPLETED",
    }),
    wrongCategory as unknown as VercelResponse,
  );
  assert.equal(wrongCategory.statusCode, 400);

  const malformed = {
    method: "POST",
    url: new URL(callbackUrls.checkouts).pathname,
    headers: { "content-type": "application/json" },
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("{");
    },
  } as unknown as VercelRequest;
  const invalidJson = mockResponse();
  await checkoutHandler(malformed, invalidJson as unknown as VercelResponse);
  assert.equal(invalidJson.statusCode, 400);
  assert.equal(providerCalled, false);
});

test("required callback signatures reject missing signature headers", async () => {
  process.env.PAWAPAY_CALLBACK_SIGNATURES_REQUIRED = "true";
  let providerCalled = false;
  globalThis.fetch = (async () => {
    providerCalled = true;
    throw new Error("unexpected provider call");
  }) as typeof fetch;

  const response = mockResponse();
  await payoutHandler(
    mockRequest("payouts", {
      payoutId: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
      status: "COMPLETED",
    }),
    response as unknown as VercelResponse,
  );
  assert.equal(response.statusCode, 401);
  assert.equal(providerCalled, false);
  process.env.PAWAPAY_CALLBACK_SIGNATURES_REQUIRED = "false";
});

test("provider lookup failures do not persist callback events", async () => {
  let rpcCalled = false;
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname === "/v2/payouts/62b54ba9-a988-42a8-80a5-911f2d7f5443") {
      return new Response(JSON.stringify({ status: "NOT_FOUND" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.pathname.endsWith("/rpc/billing_record_pawapay_callback_event")) rpcCalled = true;
    throw new Error(`Unexpected request to ${url.pathname}`);
  }) as typeof fetch;

  const response = mockResponse();
  await payoutHandler(
    mockRequest("payouts", {
      payoutId: "62b54ba9-a988-42a8-80a5-911f2d7f5443",
      status: "COMPLETED",
    }),
    response as unknown as VercelResponse,
  );
  assert.equal(response.statusCode, 503);
  assert.equal(rpcCalled, false);
});
