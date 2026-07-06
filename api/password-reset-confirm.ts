import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyPasswordResetToken } from "./lib/password-reset-utils.js";

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required in environment variables`);
  }
  return value;
}

async function readRawBody(req: VercelRequest): Promise<string> {
  const buffers: Uint8Array[] = [];
  for await (const chunk of req) {
    buffers.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(buffers).toString("utf8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const bodyText = await readRawBody(req);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    return res.status(400).json({ error: "Unable to parse JSON payload" });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const newPassword = typeof body.password === "string" ? body.password : "";
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET as string | undefined;
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const confirmationBaseUrl = process.env.SITE_URL || "http://localhost:5173";

  if (!EMAIL_SIGNING_SECRET || !SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Missing token or password" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  try {
    const payload = verifyPasswordResetToken(token, EMAIL_SIGNING_SECRET);
    const updateResponse = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/admin/users/${payload.sub}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ password: newPassword }),
      },
    );

    const updateBody = await updateResponse.text();
    if (!updateResponse.ok) {
      console.error("Password update failed", { status: updateResponse.status, body: updateBody });
      return res.status(500).json({ error: "Failed to update password" });
    }

    try {
      const sendEmailResponse = await fetch(
        `${confirmationBaseUrl.replace(/\/$/, "")}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: payload.email,
            subject: "Votre mot de passe a été modifié",
            text: "Votre mot de passe a été modifié avec succès. Si vous n'êtes pas à l'origine de ce changement, contactez le support.",
          }),
        },
      );

      if (!sendEmailResponse.ok) {
        const sendEmailText = await sendEmailResponse.text();
        console.warn(
          "Password change confirmation email failed",
          sendEmailResponse.status,
          sendEmailText,
        );
      }
    } catch (emailError) {
      console.warn("Password change confirmation email exception", emailError);
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error("Password reset confirm failed", error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid token or password",
    });
  }
}
