import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyPasswordResetToken } from "../../server/password-reset-utils.js";

async function readRawBody(req: VercelRequest): Promise<string> {
  const buffers: Uint8Array[] = [];
  for await (const chunk of req) buffers.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(buffers).toString("utf8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  let body: Record<string, unknown>;
  try { body = JSON.parse(typeof req.body === "string" ? req.body : await readRawBody(req)) as Record<string, unknown>; } catch { return res.status(400).json({ error: "Unable to parse JSON payload" }); }
  const token = typeof body.token === "string" ? body.token : "";
  const newPassword = typeof body.password === "string" ? body.password : "";
  const signingSecret = process.env.EMAIL_SIGNING_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = process.env.SITE_URL || "http://localhost:5173";
  if (!signingSecret || !supabaseUrl || !serviceKey) return res.status(500).json({ error: "Server misconfiguration" });
  if (!token || !newPassword) return res.status(400).json({ error: "Missing token or password" });
  if (newPassword.length < 8) return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
  try {
    const payload = verifyPasswordResetToken(token, signingSecret);
    const updateResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/admin/users/${payload.sub}`, { method: "PUT", headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, body: JSON.stringify({ password: newPassword }) });
    if (!updateResponse.ok) return res.status(500).json({ error: "Failed to update password" });
    try { await fetch(`${baseUrl.replace(/\/$/, "")}/api/send-email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient: payload.email, subject: "Votre mot de passe a été modifié", text: "Votre mot de passe a été modifié avec succès. Si vous n'êtes pas à l'origine de ce changement, contactez le support." }) }); } catch (emailError) { console.warn("Password change confirmation email exception", emailError); }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Password reset confirm failed", error);
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid token or password" });
  }
}