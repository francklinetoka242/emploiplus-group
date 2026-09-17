import "dotenv/config";
import { createHmac } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { renderTransactionalEmail } from "../../server/transactional-email.js";

function base64url(input: string | Buffer) {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text || text.trim().length === 0) return undefined;
  try { return JSON.parse(text); } catch { return text; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body = req.body as Record<string, unknown>;
  if (typeof req.body === "string") {
    try { body = JSON.parse(req.body) as Record<string, unknown>; } catch { return res.status(400).json({ error: "Unable to parse JSON payload" }); }
  }
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Missing email" });
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const signingSecret = process.env.EMAIL_SIGNING_SECRET;
  const baseUrl = process.env.SITE_URL || "https://www.emploiplus-group.com";
  if (!supabaseUrl || !serviceKey || !signingSecret) return res.status(500).json({ error: "Server misconfiguration" });
  try {
    const candidateResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/candidates?select=user_id,email&email=eq.${encodeURIComponent(email)}`, {
      headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const candidates = await readResponseBody(candidateResponse);
    if (!candidateResponse.ok) return res.status(500).json({ error: "Candidate lookup failed" });
    const candidate = (Array.isArray(candidates) ? candidates[0] : undefined) as { user_id?: string } | undefined;
    if (!candidate?.user_id) return res.status(200).json({ success: true });
    const payload = { sub: candidate.user_id, email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 };
    const encoded = base64url(Buffer.from(JSON.stringify(payload), "utf8"));
    const token = `${encoded}.${base64url(createHmac("sha256", signingSecret).update(encoded).digest())}`;
    const resetLink = `${baseUrl}/candidate/reset-password?token=${encodeURIComponent(token)}`;
    const sendEmailResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: email,
        subject: "Réinitialisation du mot de passe",
        action_link: resetLink,
        text: `Réinitialisez votre mot de passe en cliquant sur ce lien : ${resetLink}`,
        html: renderTransactionalEmail({ title: "Réinitialisation du mot de passe", intro: "Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.", ctaLabel: "Réinitialiser mon mot de passe", ctaUrl: resetLink, logoUrl: `${baseUrl}/Logo.png`, fromName: "EmploiPlus Group", bodyHtml: '<p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p>' }),
      }),
    });
    if (!sendEmailResponse.ok) return res.status(500).json({ error: "Failed to send password reset email" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("PASSWORD RESET REQUEST ERROR", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}