import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePawaPayCallback } from "../../../../server/billing/callbacks.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handlePawaPayCallback("payouts", req, res);
}
