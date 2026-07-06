Voici les fichiers corrigés/confirmés demandés — contenus exacts présents dans le dépôt.

---

Fichier: api/password-reset-request.ts

```
// api/password-reset-request.ts
import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderTransactionalEmail } from './lib/transactional-email';


type UnknownObject = Record<string, unknown>;

function parseRequestBody(input: unknown): Record<string, unknown> {
  if (typeof input === "object" && input !== null) {
    return input as Record<string, unknown>;
  }

  return {};
}

function base64url(input: string | Buffer) {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function normalizeErrorMessage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  if (typeof value === 'object' && value !== null) {
    const objectValue = value as UnknownObject;
    if (typeof objectValue.msg === 'string') return objectValue.msg;
    if (typeof objectValue.message === 'string') return objectValue.message;
    if (typeof objectValue.error === 'string') return objectValue.error;
    return JSON.stringify(objectValue);
  }
  return String(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let requestBody: unknown = req.body;
  if (typeof requestBody === 'string') {
    try {
      requestBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('Unable to parse request body string', parseError, requestBody);
    }
  }

  const emailValue = typeof requestBody === 'object' && requestBody !== null ? (requestBody as UnknownObject) : {};
  const email = typeof emailValue.email === 'string' ? emailValue.email.trim().toLowerCase() : '';
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET as string | undefined;
  const confirmationBaseUrl = process.env.SITE_URL || 'https://www.emploiplus-group.com';

  if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL_SIGNING_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const candidateResponse = await fetch(
      `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/candidates?select=user_id,email&email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    );

    const candidateBody = await readResponseBody(candidateResponse) as unknown;
    if (!candidateResponse.ok) {
      const errorText = normalizeErrorMessage(candidateBody);
      console.error('Candidate lookup failed', { status: candidateResponse.status, response: candidateBody });
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
    const payloadEncoded = base64url(Buffer.from(JSON.stringify(tokenPayload), 'utf8'));
    const signature = base64url(createHmac('sha256', EMAIL_SIGNING_SECRET).update(payloadEncoded).digest());
    const token = `${payloadEncoded}.${signature}`;
    const resetLink = `${confirmationBaseUrl}/candidate/reset-password?token=${encodeURIComponent(token)}`;
    const logoUrl = `${confirmationBaseUrl}/Logo.png`;

    const sendEmailResponse = await fetch(`${confirmationBaseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: email,
        subject: 'Réinitialisation du mot de passe',
        action_link: resetLink,
        text: `Réinitialisez votre mot de passe en cliquant sur ce lien : ${resetLink}`,
        html: renderTransactionalEmail({
          title: 'Réinitialisation du mot de passe',
          intro: 'Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.',
          ctaLabel: 'Réinitialiser mon mot de passe',
          ctaUrl: resetLink,
          logoUrl,
          fromName: 'EmploiPlus Group',
          bodyHtml: '<p style="margin:0;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p>',
        }),
      }),
    });

    if (!sendEmailResponse.ok) {
      const sendEmailBody = await readResponseBody(sendEmailResponse);
      console.error('Password reset email send failed', { status: sendEmailResponse.status, body: sendEmailBody });
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('PASSWORD RESET REQUEST ERROR', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

```

---

Fichier: api/resend-confirmation.ts

```
// api/resend-confirmation.ts
import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as nodemailer from 'nodemailer';
import { renderTransactionalEmail } from './lib/transactional-email';

type UnknownObject = Record<string, unknown>;

function base64url(input: string | Buffer) {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text || text.trim().length === 0) return undefined;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    try { return JSON.parse(text); } catch { return text; }
  }
  return text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let requestBody: unknown = req.body;
  if (typeof requestBody === 'string') {
    try { requestBody = JSON.parse(requestBody); } catch (e) { /* ignore */ }
  }

  const body = typeof requestBody === 'object' && requestBody !== null ? (requestBody as UnknownObject) : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET as string | undefined;
  const confirmationBaseUrl = process.env.SITE_URL || 'https://www.emploiplus-group.com';

  if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL_SIGNING_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    // Lookup candidate by email
    const candidateResp = await fetch(
      `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/candidates?select=user_id,email&email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    );

    const candidateBody = await readResponseBody(candidateResp) as unknown;
    if (!candidateResp.ok) {
      const err = typeof candidateBody === 'string' ? candidateBody : JSON.stringify(candidateBody);
      console.error('Candidate lookup failed', { status: candidateResp.status, response: candidateBody });
      return res.status(500).json({ error: err });
    }

    const candidates = Array.isArray(candidateBody) ? candidateBody : [];
    const candidate = candidates[0] as { user_id?: string } | undefined;
    if (!candidate?.user_id) {
      // Avoid leaking existence: behave as if success
      return res.status(200).json({ success: true });
    }

    const userId = candidate.user_id as string;

    // Check if user is already confirmed
    try {
      const userResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      });
      const userText = await userResp.text();
      if (userResp.ok) {
        try {
          const parsed = JSON.parse(userText) as Record<string, unknown>;
          if (parsed.email_confirmed_at || parsed.confirmed_at) {
            return res.status(200).json({ success: true, alreadyConfirmed: true });
          }
        } catch {
          // ignore parse error and continue
        }
      }
    } catch (e) {
      console.warn('User lookup failed, continuing with resend attempt', e);
    }

    // Generate signed token like in register.ts
    const tokenPayload = {
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };
    const payloadEncoded = base64url(Buffer.from(JSON.stringify(tokenPayload), 'utf8'));
    const signature = base64url(createHmac('sha256', EMAIL_SIGNING_SECRET).update(payloadEncoded).digest());
    const token = `${payloadEncoded}.${signature}`;
    const confirmLink = `${confirmationBaseUrl}/api/confirm?token=${encodeURIComponent(token)}`;

    // Send email via SMTP (reuse same approach as register.ts)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || smtpUser;
    const fromName = process.env.FROM_NAME || 'EmploiPlus Group';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      const logoUrl = `${confirmationBaseUrl}/Logo.png`;
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        replyTo: fromEmail,
        subject: 'Confirmez votre adresse e-mail',
        text: `Bonjour,\n\nVeuillez confirmer votre adresse e-mail en cliquant sur ce lien :\n${confirmLink}\n\nCe lien est valable 24 heures.`,
        html: renderTransactionalEmail({
          title: 'Confirmation de votre inscription',
          intro: `Merci pour votre inscription sur EmploiPlus Group. Pour activer votre compte candidat, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.`,
          ctaLabel: 'Confirmer mon adresse email',
          ctaUrl: confirmLink,
          logoUrl,
          fromName,
          bodyHtml: `<p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Bonjour,</p><p style="margin:0;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Ce lien est valable 24 heures. Après expiration, vous pourrez demander un renvoi depuis la page de connexion.</p>`,
        }),
      });
    } catch (mailError) {
      console.error('Resend confirmation email send failed', mailError);
      // Don't fail hard for email send issues; still return success or error depending on policy
      return res.status(500).json({ error: 'Failed to send confirmation email' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('RESEND CONFIRMATION ERROR', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

```

---

Fichier: src/integrations/supabase/candidate-auth.ts (extrait, méthode `resendConfirmationEmail`)

```
  /**
   * Resend confirmation email to user
   */
  static async resendConfirmationEmail(email: string) {
    try {
      const response = await fetch('/api/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw body?.error ? new Error(body.error) : new Error("Impossible de renvoyer l'email de confirmation.");
      }

      return { success: true };
    } catch (error) {
      console.error('Resend confirmation email error:', error);
      throw error;
    }
  }

```

---

Remarques courtes:
- J'ai vérifié que les appels existants à `/api/send-email` dans le dépôt envoient bien `Content-Type: application/json` et utilisent `JSON.stringify()` (`password-reset-request.ts`, `password-reset-confirm.ts`, `src/pages/candidate/CandidateJobApplyPage.tsx`).
- Le nouvel endpoint `api/resend-confirmation.ts` a été ajouté et `resendConfirmationEmail` a été modifié pour POSTer vers cet endpoint.

Si tu veux, je peux ajouter des commandes `curl` de test ou des logs supplémentaires pour tracer le contenu reçu par `/api/send-email` en production.
