import type { VercelRequest, VercelResponse } from "@vercel/node";
import checkoutCallback from "../../server/billing/routes/pawapay/checkouts/callback.js";
import depositCallback from "../../server/billing/routes/pawapay/callback.js";
import initiate from "../../server/billing/routes/pawapay/initiate.js";
import payoutsCallback from "../../server/billing/routes/pawapay/payouts/callback.js";
import providers from "../../server/billing/routes/pawapay/providers.js";
import reconcile from "../../server/billing/routes/pawapay/reconcile.js";
import refundsCallback from "../../server/billing/routes/pawapay/refunds/callback.js";
import status from "../../server/billing/routes/pawapay/status.js";
import subscription from "../../server/billing/routes/pawapay/subscription.js";

export const config = { api: { bodyParser: false } };

const routes = {
  "deposit-callback": depositCallback,
  initiate,
  providers,
  reconcile,
  status,
  subscription,
  "checkout-callback": checkoutCallback,
  "payout-callback": payoutsCallback,
  "refund-callback": refundsCallback,
} satisfies Record<string, (req: VercelRequest, res: VercelResponse) => unknown>;

const publicPaths = {
  "/api/payments/pawapay/callback": "deposit-callback",
  "/api/payments/pawapay/initiate": "initiate",
  "/api/payments/pawapay/providers": "providers",
  "/api/payments/pawapay/reconcile": "reconcile",
  "/api/payments/pawapay/status": "status",
  "/api/payments/pawapay/subscription": "subscription",
  "/api/payments/pawapay/checkouts/callback": "checkout-callback",
  "/api/payments/pawapay/payouts/callback": "payout-callback",
  "/api/payments/pawapay/refunds/callback": "refund-callback",
} satisfies Record<string, keyof typeof routes>;

function isPawaPayRoute(route: string): route is keyof typeof routes {
  return Object.hasOwn(routes, route);
}

async function parseJsonRequestBody(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  if (req.body !== undefined) return true;

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 1_048_576) {
      res.status(413).json({ error: "Request payload is too large." });
      return false;
    }
    chunks.push(buffer);
  }

  if (size === 0) return true;
  try {
    req.body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return true;
  } catch {
    res.status(400).json({ error: "Invalid JSON request body." });
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestPath = (req.url ?? "").split("?")[0];
  const publicPathRoute = publicPaths[requestPath as keyof typeof publicPaths];
  const selectedRoute = req.query.pawapayRoute;
  if (
    (publicPathRoute && selectedRoute !== undefined && selectedRoute !== publicPathRoute) ||
    (!publicPathRoute &&
      (requestPath !== "/api/payments/pawapay" ||
        typeof selectedRoute !== "string" ||
        !isPawaPayRoute(selectedRoute)))
  ) {
    return res.status(404).json({ error: "Unknown PawaPay route." });
  }
  const route = publicPathRoute ?? (selectedRoute as keyof typeof routes);
  if ((route === "initiate" || route === "status") && !(await parseJsonRequestBody(req, res))) {
    return res;
  }
  return routes[route](req, res);
}
