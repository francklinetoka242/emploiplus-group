import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyPasswordResetToken } from "../../server/password-reset-utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Method not allowed" }); }
    const token = String(req.query.token || "");
    const signingSecret = process.env.EMAIL_SIGNING_SECRET;
    if (!signingSecret) return res.status(500).json({ error: "Server misconfiguration" });
    if (!token) return res.status(400).json({ error: "Missing token" });
    const payload = verifyPasswordResetToken(token, signingSecret);
    return res.status(200).json({ success: true, email: payload.email });
  } catch (error) {
    console.error("Password reset token validation failed", error);
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid token" });
  }
}