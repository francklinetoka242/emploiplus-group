import type { VercelRequest, VercelResponse } from "@vercel/node";
import { replyWithError } from "../../http.js";
import { getAvailableProviders } from "../../pawapay.js";
import { authenticateCandidate } from "../../supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authenticated = await authenticateCandidate(req.headers.authorization);
    if (!authenticated) return res.status(401).json({ error: "Authentication required." });
    const providers = await getAvailableProviders();
    return res.status(200).json({ providers, currency: "XAF" });
  } catch (error) {
    return replyWithError(res, error);
  }
}
