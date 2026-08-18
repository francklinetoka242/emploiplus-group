import "dotenv/config";
import * as nodemailer from "nodemailer";
import type { VercelRequest, VercelResponse } from "@vercel/node";

interface EmailAttachmentPayload {
  filename?: string;
  path?: string;
  content?: string;
  contentType?: string;
  encoding?: string;
}

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
  attachments?: EmailAttachmentPayload[];
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
  const templateMode =
    getPayloadValue(body, ["template", "emailTemplate"]) ||
    (typeof (body as Record<string, unknown>).layout === "string"
      ? String((body as Record<string, unknown>).layout)
      : undefined);

  let finalHtml = originalHtml || "";
  let finalText = text || "";

  // Keep the candidature email flow simple: the front-end already builds the actual
  // candidate content (subject, recruiter message and selected documents). We do not
  // re-wrap it in a branded transactional template anymore.
  if (templateMode === "simple-application") {
    finalHtml = originalHtml || "";
    finalText = text || "";
  }

  if (!finalHtml && finalText) {
    finalHtml = `<div style="font-family:Arial, Helvetica, sans-serif;color:#111827;line-height:1.6;">${finalText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />")}</div>`;
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

  const resolveRemoteAttachments = async (
    attachments: EmailAttachmentPayload[] | undefined,
  ): Promise<EmailAttachmentPayload[]> => {
    if (!Array.isArray(attachments) || attachments.length === 0) {
      return [];
    }

    const resolved: EmailAttachmentPayload[] = [];

    for (const attachment of attachments) {
      if (!attachment) {
        continue;
      }

      if (attachment.content) {
        resolved.push(attachment);
        continue;
      }

      if (!attachment.path || !/^https?:\/\//i.test(attachment.path)) {
        resolved.push(attachment);
        continue;
      }

      try {
        const response = await fetch(attachment.path, {
          headers: {
            Accept: "application/pdf,application/octet-stream,*/*",
          },
        });

        if (!response.ok) {
          throw new Error(`Attachment download failed with status ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        resolved.push({
          ...attachment,
          path: undefined,
          content: Buffer.from(arrayBuffer).toString("base64"),
          encoding: attachment.encoding || "base64",
          contentType: attachment.contentType || "application/pdf",
        });
      } catch (error) {
        console.warn("Remote attachment could not be resolved, keeping original path entry for retry.", {
          path: attachment.path,
          error,
        });
        resolved.push(attachment);
      }
    }

    return resolved;
  };

  const sendMail = async (senderEmail: string) => {
    const attachments = await resolveRemoteAttachments(
      Array.isArray(body.attachments)
        ? body.attachments.filter((attachment): attachment is EmailAttachmentPayload => Boolean(attachment))
        : [],
    );

    return transporter.sendMail({
      from: `"${fromName}" <${senderEmail}>`,
      to: recipient,
      replyTo,
      subject,
      html: finalHtml,
      text: finalText ?? undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
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
