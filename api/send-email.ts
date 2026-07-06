import "dotenv/config";
import * as nodemailer from "nodemailer";
import type { VercelRequest, VercelResponse } from "@vercel/node";

interface SendEmailPayload {
  recipient?: string;
  to?: string;
  email?: string;
  replyTo?: string;
  reply_to?: string;
  replyto?: string;
  subject?: string;
  html?: string;
  text?: string;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required in environment variables`);
  }
  return value;
}

const smtpHost = assertEnv("SMTP_HOST", process.env.SMTP_HOST);
const smtpPortRaw = assertEnv("SMTP_PORT", process.env.SMTP_PORT);
const smtpPort = Number(smtpPortRaw);
if (Number.isNaN(smtpPort) || smtpPort <= 0) {
  throw new Error("SMTP_PORT must be a valid positive number");
}
const smtpUser = assertEnv("SMTP_USER", process.env.SMTP_USER);
const smtpPass = assertEnv("SMTP_PASS", process.env.SMTP_PASS);

const fromEmailCandidate = process.env.FROM_EMAIL?.trim();
const fromEmail = smtpUser;
const replyToEmail =
  fromEmailCandidate && fromEmailCandidate.length > 0 ? fromEmailCandidate : smtpUser;
const smtpFromEmail = smtpUser;
const fromName = process.env.FROM_NAME?.trim() || "EmploiPlus Group";
const siteUrl =
  process.env.SITE_URL || process.env.VITE_SUPABASE_URL || "https://emploiplus-group.com";
const logoUrl = process.env.LOGO_URL || `${siteUrl.replace(/\/$/, "")}/assets/favicon.ico`;
const brandColor = process.env.BRAND_COLOR || "#0ea5a4";
const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || fromEmail;
const whatsappUrl = process.env.WHATSAPP_URL || "";
const companyAddress = process.env.COMPANY_ADDRESS || "EmploiPlus Group";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

function getPayloadValue(body: SendEmailPayload, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  if (body.params && typeof body.params === "object") {
    for (const key of keys) {
      const nestedValue = body.params[key as keyof typeof body.params];
      if (typeof nestedValue === "string" && nestedValue.trim().length > 0) {
        return nestedValue.trim();
      }
    }
  }

  return undefined;
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

  const payloadText = await readRawBody(req);

  let body: SendEmailPayload;
  try {
    body = JSON.parse(payloadText) as SendEmailPayload;
  } catch (error) {
    return res.status(400).json({ error: "Unable to parse JSON payload" });
  }

  const recipient = getPayloadValue(body, ["recipient", "to", "email"]);
  const replyTo = getPayloadValue(body, ["replyTo", "reply_to", "replyto"]) || replyToEmail;
  const subject = getPayloadValue(body, ["subject"]) || "Message from " + fromName;
  const originalHtml = getPayloadValue(body, ["html", "body", "message"]);
  const text = getPayloadValue(body, ["text"]);

  // Try to extract an actionable link (confirmation / reset) from common payload keys
  const actionLink =
    getPayloadValue(body, ["action_link", "link", "url", "confirmation_url"]) ||
    (typeof body.params === "object" && body.params !== null
      ? getPayloadValue(body.params as SendEmailPayload, ["action_link"])
      : undefined) ||
    undefined;

  // Helper to build a branded HTML template
  function buildTemplate(opts: {
    title: string;
    intro: string;
    cta?: string;
    actionLink?: string;
    bodyHtml?: string;
  }) {
    const ctaHtml =
      opts.cta && opts.actionLink
        ? `<p style="text-align:center;margin:24px 0"><a href="${opts.actionLink}" target="_blank" rel="noreferrer" style="background:var(--secondary, ${brandColor});color:var(--primary, #ffffff);padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:700">${opts.cta}</a></p>`
        : "";

    const bodySection = opts.bodyHtml ? `<div style="margin:12px 0">${opts.bodyHtml}</div>` : "";

    return `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </head>
        <body style="--primary: #00009E; --secondary: #E8A900; font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f7fafc; margin:0; padding:24px">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e6e6">
                <tr style="background:${brandColor};color:#fff">
                  <td style="padding:16px 20px;display:flex;align-items:center;gap:12px">
                    <img src="${logoUrl}" alt="logo" width="40" style="display:block;border-radius:6px" />
                    <div style="font-size:18px;font-weight:600">${fromName}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px">
                    <h1 style="font-size:18px;margin:0 0 8px">${opts.title}</h1>
                    <p style="color:#475569;margin:0 0 12px">${opts.intro}</p>
                    ${bodySection}
                    ${ctaHtml}
                    <p style="color:#64748b;font-size:13px;margin-top:18px">Si vous n'avez pas demandé cette action, ignorez simplement cet e-mail.</p>
                    <p style="color:#64748b;font-size:13px;margin-top:8px">Si vous rencontrez un problème, contactez l'assistance :</p>
                    <p style="color:#475569;margin:6px 0 0;font-size:14px">Email : <a href="mailto:contact@emploiplus-group.com">contact@emploiplus-group.com</a> • WhatsApp : <a href="https://wa.me/242067311033">+242 0673 11033</a></p>
                    <hr style="border:none;border-top:1px solid #eef2f7;margin:18px 0" />
                    <h3 style="margin:0 0 8px;font-size:15px;color:var(--primary)">Contact</h3>
                    <p style="font-size:14px;color:#475569;margin:0">Téléphone & WhatsApp : <a href="tel:+242067311033">+242 0673 11033</a></p>
                    <p style="font-size:14px;color:#475569;margin:6px 0 0">Email : <a href="mailto:contact@emploiplus-group.com">contact@emploiplus-group.com</a></p>
                    <p style="font-size:14px;color:#475569;margin:6px 0 0">Localisation : Pointe-Noire, République du Congo</p>
                    <p style="font-size:14px;color:#475569;margin:6px 0 0">Chaîne offres gratuites WhatsApp : <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631">whatsapp.com/channel/0029Vb5pc270VycKAb1tc631</a></p>
                    <p style="font-size:14px;color:#475569;margin:6px 0 0">Chaîne Emploiplus Group WhatsApp : <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43">whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43</a></p>
                    <p style="font-size:12px;color:#9ca3af;margin-top:12px">${companyAddress}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // Build branded HTML depending on type
  let finalHtml = originalHtml || "";
  let finalText = text || "";

  const lowerSub = (subject || "").toLowerCase();

  if (
    actionLink ||
    /reset|mot de passe|réinitialis|password/i.test(lowerSub) ||
    /confirm|inscri|confirmation|activer/i.test(lowerSub)
  ) {
    // Decide template type
    if (/reset|mot de passe|réinitialis|password/i.test(lowerSub)) {
      const contactHtml = `
        ${originalHtml ? originalHtml : ""}
        <p style="margin-top:12px;color:#475569;">Si vous n'avez pas demandé la réinitialisation de votre mot de passe, ignorez cet e-mail.</p>
        <p style="margin-top:10px;color:#475569;">Pour toute aide : Email: <a href="mailto:contact@emploiplus-group.com">contact@emploiplus-group.com</a> • WhatsApp: <a href="https://wa.me/242067311033">+242 0673 11033</a></p>
      `;

      finalHtml = buildTemplate({
        title: "Réinitialisation du mot de passe",
        intro: "Vous avez demandé la réinitialisation de votre mot de passe.",
        cta: "Réinitialiser mon mot de passe",
        actionLink: actionLink,
        bodyHtml: contactHtml,
      });
      finalText = `Réinitialisez votre mot de passe: ${actionLink || ""}`;
    } else {
      finalHtml = buildTemplate({
        title: "Confirmation de votre inscription",
        intro:
          "Merci de vous être inscrit(e). Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail.",
        cta: "Confirmer mon e-mail",
        actionLink: actionLink,
        bodyHtml: originalHtml ? originalHtml : undefined,
      });
      finalText = `Confirmez votre e-mail: ${actionLink || ""}`;
    }
  } else if (!originalHtml) {
    // Generic wrapper when original html missing
    finalHtml = buildTemplate({
      title: subject,
      intro: text || "",
      bodyHtml: text || undefined,
    });
    finalText = text || subject;
  }

  if (!recipient || !subject || !finalHtml) {
    return res.status(400).json({
      error: "Invalid payload",
      missing: {
        recipient: !recipient,
        subject: !subject,
        html: !finalHtml,
      },
    });
  }

  const sendMail = async (senderEmail: string) => {
    return transporter.sendMail({
      from: `"${fromName}" <${senderEmail}>`,
      to: recipient,
      replyTo,
      subject,
      html: finalHtml,
      text: finalText ?? undefined,
    });
  };

  try {
    const info = await sendMail(fromEmail);
    return res
      .status(200)
      .json({ status: "sent", messageId: info.messageId, from: fromEmail, replyTo });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send email", error);
    return res.status(500).json({
      error: "Failed to send email",
      details: message,
    });
  }
}
