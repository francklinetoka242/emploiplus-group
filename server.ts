import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import nodemailer from "nodemailer";
import { Webhook } from "standardwebhooks";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SEND_EMAIL_HOOK_SECRET, FROM_EMAIL, FROM_NAME, PORT } = process.env;

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required in environment variables`);
  }
  return value;
}

const smtpHost = assertEnv("SMTP_HOST", SMTP_HOST);
const smtpPortRaw = assertEnv("SMTP_PORT", SMTP_PORT);
const smtpPort = Number(smtpPortRaw);
if (Number.isNaN(smtpPort) || smtpPort <= 0) {
  throw new Error("SMTP_PORT must be a valid positive number");
}
const smtpUser = assertEnv("SMTP_USER", SMTP_USER);
const smtpPass = assertEnv("SMTP_PASS", SMTP_PASS);
const rawHookSecret = assertEnv("SEND_EMAIL_HOOK_SECRET", SEND_EMAIL_HOOK_SECRET);
const hookSecret = rawHookSecret.replace(/^v1,whsec_/, "");
if (!hookSecret) {
  throw new Error("SEND_EMAIL_HOOK_SECRET must contain a valid v1,whsec_ base64 secret");
}

const fromEmailCandidate = FROM_EMAIL?.trim();
const fromEmail = fromEmailCandidate && fromEmailCandidate.length > 0 ? fromEmailCandidate : smtpUser;
const smtpFromEmail = smtpUser;
const fromName = FROM_NAME?.trim() || "EmploiPlus Group";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

interface SendEmailHookPayload {
  recipient?: string;
  to?: string;
  email?: string;
  subject?: string;
  html?: string;
  body?: string;
  message?: string;
  text?: string;
  [key: string]: unknown;
}

function getPayloadValue(body: SendEmailHookPayload, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

const app = express();

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.post(
  "/send-email",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req: Request, res: Response) => {
    const rawBody = req.body;
    const payloadText = Buffer.isBuffer(rawBody)
      ? rawBody.toString("utf8")
      : typeof rawBody === "string"
      ? rawBody
      : JSON.stringify(rawBody);

    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value ?? ""]),
    );

    const webhook = new Webhook(hookSecret);
    try {
      webhook.verify(payloadText, headers);
    } catch (error) {
      console.error("Invalid Send Email Hook signature", error);
      return res.status(401).json({ error: "Invalid hook signature" });
    }

    let body: SendEmailHookPayload;
    try {
      body = JSON.parse(payloadText) as SendEmailHookPayload;
    } catch (error) {
      console.error("Unable to parse Send Email Hook payload as JSON", {
        payloadText,
        error,
      });
      return res.status(400).json({ error: "Unable to parse JSON payload" });
    }

    console.info("Send Email Hook payload received", { body });

    const recipient = getPayloadValue(body, ["recipient", "to", "email"]);
    const subject = getPayloadValue(body, ["subject"]);
    const html = getPayloadValue(body, ["html", "body", "message"]);
    const text = getPayloadValue(body, ["text"]);

    if (!recipient || !subject || !html) {
      console.error("Send Email Hook invalid payload", {
        recipient,
        subject,
        html,
        body,
      });
      return res.status(400).json({
        error: "Invalid payload",
        missing: {
          recipient: !recipient,
          subject: !subject,
          html: !html,
        },
        body,
      });
    }

    const sendMail = async (senderEmail: string) => {
      return transporter.sendMail({
        from: `"${fromName}" <${senderEmail}>`,
        to: recipient,
        subject,
        html,
        text: text ?? undefined,
      });
    };

    try {
      const info = await sendMail(fromEmail);
      console.info("Send Email Hook delivered email", {
        recipient,
        subject,
        messageId: info.messageId,
        from: fromEmail,
      });
      return res.status(200).json({ status: "sent", messageId: info.messageId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (fromEmail !== smtpFromEmail && /553|Sender address rejected|not owned by user/i.test(errorMessage)) {
        try {
          const info = await sendMail(smtpFromEmail);
          console.info("Send Email Hook delivered email with fallback sender", {
            recipient,
            subject,
            messageId: info.messageId,
            from: smtpFromEmail,
          });
          return res.status(200).json({ status: "sent", messageId: info.messageId, fallbackFrom: smtpFromEmail });
        } catch (fallbackError) {
          console.error("Failed to send Send Email Hook email via SMTP fallback sender", fallbackError, {
            recipient,
            subject,
          });
          return res.status(500).json({
            error: "Failed to send email",
            details: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          });
        }
      }

      console.error("Failed to send Send Email Hook email via SMTP", error, {
        recipient,
        subject,
      });
      return res.status(500).json({
        error: "Failed to send email",
        details: errorMessage,
      });
    }
  },
);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error", err);
  return res.status(500).json({
    error: "Internal server error",
    details: err instanceof Error ? err.message : String(err),
  });
});

const serverPort = PORT ? Number(PORT) : 3000;
if (Number.isNaN(serverPort) || serverPort <= 0) {
  throw new Error("PORT must be a valid positive number if provided");
}

app.listen(serverPort, () => {
  console.log(`Email hook server listening on port ${serverPort}`);
});
