import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

type UnknownObject = Record<string, unknown>;

function normalizeErrorMessage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  if (typeof value === 'object' && value !== null) {
    const objectValue = value as UnknownObject;
    if (typeof objectValue.msg === 'string') return objectValue.msg;
    if (typeof objectValue.message === 'string') return objectValue.message;
    if (typeof objectValue.error === 'string') return objectValue.error;
    if (typeof objectValue.error?.['msg'] === 'string') return objectValue.error['msg'] as string;
    if (typeof objectValue.error?.['message'] === 'string') return objectValue.error['message'] as string;
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
  const SITE_URL = process.env.SITE_URL || process.env.VITE_SUPABASE_URL || 'https://emploiplus-group.com';
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET || process.env.SEND_EMAIL_HOOK_SECRET;

  if (!SUPABASE_URL || !SERVICE_KEY) {
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

    const createUserBody = await createUserResp.json();
    if (!createUserResp.ok) {
      const errorText = normalizeErrorMessage(createUserBody);
      console.error('Supabase admin create user failed', {
        status: createUserResp.status,
        response: createUserBody,
      });
      return res.status(createUserResp.status).json({ error: errorText });
    }

    const userId = createUserBody?.id;
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
    const base64url = (buffer: Buffer) => buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadEncoded = base64url(Buffer.from(JSON.stringify(tokenPayload), 'utf8'));
    const signature = base64url(createHmac('sha256', EMAIL_SIGNING_SECRET || '').update(payloadEncoded).digest());
    const token = `${payloadEncoded}.${signature}`;
    const confirmLink = `${SITE_URL.replace(/\/$/, '')}/candidate/confirm?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Confirmez votre adresse e-mail',
      html: `<p>Bonjour ${firstName},</p><p>Cliquez sur le bouton ci‑dessous pour confirmer votre adresse e‑mail :</p><p><a href="${confirmLink}" target="_blank" rel="noreferrer">Confirmer mon e‑mail</a></p>`,
    });

    return res.status(201).json({ success: true, message: 'User created. Confirmation email sent.' });
  } catch (error) {
    console.error('Register error', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
