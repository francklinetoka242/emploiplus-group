import "dotenv/config";
import { createHmac } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { renderTransactionalEmail } from './lib/transactional-email.js';

type UnknownObject = Record<string, unknown>;

function base64url(input: string | Buffer) {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") || "";
  if (
    contentType.includes("application/json") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[")
  ) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function normalizeErrorMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  if (typeof value === "object" && value !== null) {
    const objectValue = value as UnknownObject;
    if (typeof objectValue.msg === "string") return objectValue.msg;
    if (typeof objectValue.message === "string") return objectValue.message;
    if (typeof objectValue.error === "string") return objectValue.error;
    return JSON.stringify(objectValue);
  }
  return String(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let requestBody: any = req.body;
  if (typeof requestBody === "string") {
    try {
      requestBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("Unable to parse request body string", parseError, requestBody);
    }
  }

  const email = String(requestBody?.email || "")
    .trim()
    .toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET as string | undefined;
  const confirmationBaseUrl = process.env.SITE_URL || "https://www.emploiplus-group.com";

  if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL_SIGNING_SECRET) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const candidateResponse = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/candidates?select=user_id,email&email=eq.${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      },
    );

    const candidateBody = (await readResponseBody(candidateResponse)) as unknown;
    if (!candidateResponse.ok) {
      const errorText = normalizeErrorMessage(candidateBody);
      console.error("Candidate lookup failed", {
        status: candidateResponse.status,
        response: candidateBody,
      });
      return res.status(500).json({ error: errorText });
    }

    const candidates = Array.isArray(candidateBody) ? candidateBody : [];
    const candidate = candidates[0] as { user_id?: string; email?: string } | undefined;
    if (!candidate?.user_id) {
      return res.status(200).json({ success: true });
    }

    const userId = candidate.user_id;
    const tokenPayload = {
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };
    const payloadEncoded = base64url(Buffer.from(JSON.stringify(tokenPayload), "utf8"));
    const signature = base64url(
      createHmac("sha256", EMAIL_SIGNING_SECRET).update(payloadEncoded).digest(),
    );
    const token = `${payloadEncoded}.${signature}`;
    const resetLink = `${confirmationBaseUrl}/candidate/reset-password?token=${encodeURIComponent(token)}`;
    const logoUrl = `${confirmationBaseUrl}/Logo.png`;

    const sendEmailResponse = await fetch(`${confirmationBaseUrl}/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: email,
        subject: "Réinitialisation du mot de passe",
        action_link: resetLink,
        text: `Réinitialisez votre mot de passe en cliquant sur ce lien : ${resetLink}`,
        html: renderTransactionalEmail({
          title: "Réinitialisation du mot de passe",
          intro:
            "Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.",
          ctaLabel: "Réinitialiser mon mot de passe",
          ctaUrl: resetLink,
          logoUrl,
          fromName: "EmploiPlus Group",
          bodyHtml:
            '<p style="margin:0;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p>',
        }),
      }),
    });

    if (!sendEmailResponse.ok) {
      const sendEmailBody = await readResponseBody(sendEmailResponse);
      console.error("Password reset email send failed", {
        status: sendEmailResponse.status,
        body: sendEmailBody,
      });
      return res.status(500).json({ error: "Failed to send password reset email" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("PASSWORD RESET REQUEST ERROR", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
