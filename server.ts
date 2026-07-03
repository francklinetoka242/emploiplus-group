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

// Register endpoint: create Supabase user via Service Role Key and send confirmation email
app.post(
  "/register",
  express.json({ limit: "1mb" }),
  async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    };

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SITE_URL = process.env.SITE_URL || process.env.VITE_SUPABASE_URL || "https://emploiplus-group.com";
    const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET || process.env.SEND_EMAIL_HOOK_SECRET;

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('Supabase credentials missing');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    if (!EMAIL_SIGNING_SECRET) {
      console.warn('EMAIL_SIGNING_SECRET not set; confirmation tokens will be insecure');
    }

    try {
      // 1) Create user using Supabase Admin REST API
      const createUserResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          password: password,
          user_metadata: { first_name: firstName, last_name: lastName },
        }),
      });

      const createUserBody = await createUserResp.json();
      if (!createUserResp.ok) {
        console.error('Supabase admin create user failed', createUserResp.status, createUserBody);
        return res.status(400).json({ error: createUserBody?.message || createUserBody });
      }

      const userId = createUserBody?.id;
      if (!userId) {
        console.error('No user id returned from Supabase admin create');
        return res.status(500).json({ error: 'Failed to create user' });
      }

      // 2) Insert candidate profile via PostgREST (service role)
      try {
        const insertProfileResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/candidates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify([
            {
              user_id: userId,
              first_name: firstName,
              last_name: lastName,
              email: email,
              status: 'active',
            },
          ]),
        });

        const insertBody = await insertProfileResp.json();
        if (!insertProfileResp.ok) {
          console.error('Insert profile failed', insertProfileResp.status, insertBody);
        }
      } catch (e) {
        console.warn('Candidate profile insert failed', e);
      }

      // 3) Generate a signed confirmation token (HMAC) and send email with Nodemailer
      const tokenPayload = {
        sub: userId,
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      };

      const base64url = (buf: Buffer) => buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payloadJson = JSON.stringify(tokenPayload);
      const payloadB = Buffer.from(payloadJson, 'utf8');
      const payloadEncoded = base64url(payloadB);
      const crypto = require('crypto');
      const secret = EMAIL_SIGNING_SECRET || '';
      const sig = crypto.createHmac('sha256', secret).update(payloadEncoded).digest();
      const sigEncoded = base64url(sig);
      const token = `${payloadEncoded}.${sigEncoded}`;

      const confirmLink = `${SITE_URL.replace(/\/$/, '')}/candidate/confirm?token=${encodeURIComponent(token)}`;

      const mailSubject = 'Confirmez votre adresse e-mail';
      const mailText = `Bonjour ${firstName},\n\nMerci pour votre inscription. Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail :\n${confirmLink}\n\nCe lien est valable 24 heures. Si vous ne recevez pas cet e-mail, retournez sur la page de connexion pour demander un renvoi.\n\nSi vous n'avez pas demandé cette inscription, ignorez cet e-mail.`;
      const mailHtml = `<p>Bonjour ${firstName},</p><p>Cliquez sur le bouton ci‑dessous pour confirmer votre adresse e‑mail :</p><p><a href=\"${confirmLink}\" target="_blank" rel="noreferrer" style="display:inline-block;padding:12px 18px;background:#0ea5a4;color:#fff;border-radius:8px;text-decoration:none">Confirmer mon e‑mail</a></p><p>Ce lien est valable 24 heures. Si vous ne recevez pas cet e-mail, retournez sur la page de connexion pour demander un renvoi.</p><p>Si vous n'avez pas demandé cette inscription, ignorez cet e-mail.</p>`;

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: email,
          replyTo: fromEmail,
          subject: mailSubject,
          text: mailText,
          html: mailHtml,
        });
      } catch (mailError) {
        console.error('Confirmation email send failed', mailError);
      }

      return res.status(201).json({ success: true, message: 'User created. Confirmation email sent.' });
    } catch (error) {
      console.error('Register error', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  },
);

// Confirm endpoint: verify token and update user as confirmed via Service Role Key
app.get('/confirm', async (req: Request, res: Response) => {
  const token = String(req.query.token || '');
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET || process.env.SEND_EMAIL_HOOK_SECRET;

  if (!token || !SUPABASE_URL || !SERVICE_KEY) {
    return res.status(400).send('Invalid request');
  }

  try {
    const [payloadEncoded, sigEncoded] = token.split('.');
    const crypto = require('crypto');
    const base64url = (s: string | Buffer) => (typeof s === 'string' ? s : s.toString('base64')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const expectedSig = base64url(crypto.createHmac('sha256', EMAIL_SIGNING_SECRET || '').update(String(payloadEncoded)).digest());
    if (expectedSig !== sigEncoded) {
      return res.status(400).send('Invalid or expired token');
    }

    const payloadJson = Buffer.from(payloadEncoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson) as any;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return res.status(400).send('Token expired');
    }

    const userId = payload.sub;
    if (!userId) return res.status(400).send('Invalid token payload');

    // Mark user as confirmed via Supabase Admin API
    const now = new Date().toISOString();
    const confirmResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ email_confirmed_at: now }),
    });

    if (!confirmResp.ok) {
      const body = await confirmResp.text();
      console.error('Failed to confirm user', confirmResp.status, body);
      return res.status(500).send('Failed to confirm');
    }

    // Redirect to frontend login with success notification
    const SITE_URL = process.env.SITE_URL || process.env.VITE_SUPABASE_URL || 'https://emploiplus-group.com';
    return res.redirect(`${SITE_URL.replace(/\/$/, '')}/candidate/login`);
  } catch (e) {
    console.error('Confirm error', e);
    return res.status(500).send('Server error');
  }
});

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
