import type { VercelRequest, VercelResponse } from "@vercel/node";
import { replyWithError } from "../../../server/billing/http.js";
import { authenticateCandidate, billingRpc } from "../../../server/billing/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authenticated = await authenticateCandidate(req.headers.authorization);
    if (!authenticated) return res.status(401).json({ error: "Authentication required." });
    const subscription = await billingRpc(
      authenticated.supabase,
      "billing_get_candidate_subscription",
      {
        p_user_id: authenticated.user.id,
      },
    );
    return res.status(200).json(subscription);
  } catch (error) {
    return replyWithError(res, error);
  }
}
