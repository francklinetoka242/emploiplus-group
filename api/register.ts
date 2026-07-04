import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as nodemailer from 'nodemailer';
import { renderTransactionalEmail } from './lib/transactional-email.ts';

type UnknownObject = Record<string, unknown>;

function base64url(input: string | Buffer) {
  const buffer =
    typeof input === 'string'
      ? Buffer.from(input, 'utf8')
      : input;

  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function readResponseBody(response: Response): Promise<unknown> {
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
    const errorObj = objectValue.error as UnknownObject | undefined;
    if (errorObj && typeof errorObj['msg'] === 'string') return errorObj['msg'] as string;
    if (errorObj && typeof errorObj['message'] === 'string') return errorObj['message'] as string;
    return JSON.stringify(objectValue);
  }
  return String(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let requestBody: any = req.body;
  if (typeof requestBody === 'string') {
    try {
      requestBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('Unable to parse request body string', parseError, requestBody);
    }
  }

  const { email, password, firstName, lastName } = requestBody as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };

  console.log('register body', {
    email,
    firstName,
    lastName,
    passwordPresent: !!password,
  });

  if (!email || !password || !firstName || !lastName) {
    console.error('Register request missing fields', {
      headers: req.headers,
      body: requestBody,
      emailPresent: Boolean(email),
      passwordPresent: Boolean(password),
      firstNamePresent: Boolean(firstName),
      lastNamePresent: Boolean(lastName),
    });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET as string | undefined;
  if (!EMAIL_SIGNING_SECRET) {
    throw new Error('EMAIL_SIGNING_SECRET missing');
  }
  console.log('EMAIL_SIGNING_SECRET length', EMAIL_SIGNING_SECRET.length);
  const confirmationBaseUrl = process.env.SITE_URL || 'https://www.emploiplus-group.com';

  console.log({
    hasSupabaseUrl: !!SUPABASE_URL,
    hasServiceKey: !!SERVICE_KEY,
    hasEmailSigningSecret: !!EMAIL_SIGNING_SECRET,
    hasSmtpHost: !!process.env.SMTP_HOST,
    hasSmtpPort: !!process.env.SMTP_PORT,
    hasSmtpUser: !!process.env.SMTP_USER,
    hasSmtpPass: !!process.env.SMTP_PASS,
    hasFromEmail: !!process.env.FROM_EMAIL,
    hasFromName: !!process.env.FROM_NAME,
  });

  if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL_SIGNING_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const createUserResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: { first_name: firstName, last_name: lastName },
      }),
    });

    console.log(
      'createUserResp',
      createUserResp.status,
    );

    const createUserBody = await readResponseBody(createUserResp as Response) as unknown;
    console.log(
      'createUserBody',
      createUserBody,
    );
    if (!createUserResp.ok) {
      const errorText = normalizeErrorMessage(createUserBody);
      console.error('Supabase admin create user failed', {
        status: createUserResp.status,
        response: createUserBody,
      });
      return res.status(createUserResp.status).json({ error: errorText });
    }

    const userId = (createUserBody as any)?.id;
    console.log(
      'userId',
      userId,
    );
    if (!userId) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    try {
      await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/candidates`, {
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
            email,
            status: 'active',
          },
        ]),
      });
    } catch (profileError) {
      console.warn('Candidate profile insert failed', profileError);
    }

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
    console.log('TOKEN GENERATED', token);
    console.log('EMAIL_SIGNING_SECRET length', EMAIL_SIGNING_SECRET.length);
    console.log('[CONFIRM-DEBUG][register] confirmLink', confirmLink);
    console.log('[CONFIRM-DEBUG][register] tokenPayload', tokenPayload);
    console.log('[CONFIRM-DEBUG][register] confirmationBaseUrl', confirmationBaseUrl);

    try {
      const logoUrl = `${confirmationBaseUrl}/Logo.png`;
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        replyTo: fromEmail,
        subject: 'Confirmez votre adresse e-mail',
        text: `Bonjour ${firstName},\n\nMerci pour votre inscription sur EmploiPlus Group. Pour activer votre compte candidat, veuillez confirmer votre adresse e-mail en cliquant sur le lien ci-dessous :\n${confirmLink}\n\n✓ Ce lien est valable 24 heures.\n✓ Après expiration, vous pourrez demander un nouvel e-mail depuis la page de connexion.\n✓ Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.`,
        html: renderTransactionalEmail({
          title: 'Confirmation de votre inscription',
          intro: `Merci pour votre inscription sur EmploiPlus Group. Pour activer votre compte candidat, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.`,
          ctaLabel: 'Confirmer mon adresse email',
          ctaUrl: confirmLink,
          logoUrl,
          fromName,
          bodyHtml: `<p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Bonjour ${firstName},</p><p style="margin:0;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Ce lien est valable 24 heures. Après expiration, vous pourrez demander un nouvel e-mail depuis la page de connexion.</p>`,
        }),
      });
    } catch (mailError) {
      console.error('Confirmation email send failed', mailError);
    }

    return res.status(201).json({ success: true, message: 'User created. Confirmation email sent.' });
  } catch (error) {
    console.error('REGISTER FATAL ERROR');
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
