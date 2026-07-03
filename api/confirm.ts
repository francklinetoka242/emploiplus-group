import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function base64url(input: string | Buffer) {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = String(req.query.token || '');
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET || process.env.SEND_EMAIL_HOOK_SECRET;
  const SITE_URL = process.env.SITE_URL || process.env.VITE_SUPABASE_URL || 'https://emploiplus-group.com';

  if (!token || !SUPABASE_URL || !SERVICE_KEY || !EMAIL_SIGNING_SECRET) {
    return res.status(400).send('Invalid confirmation request');
  }

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) {
    return res.status(400).send('Invalid confirmation token');
  }

  const expectedSignature = base64url(createHmac('sha256', EMAIL_SIGNING_SECRET).update(payloadEncoded).digest());
  if (expectedSignature !== signature) {
    return res.status(400).send('Invalid or expired token');
  }

  let payload: any;
  try {
    const normalized = payloadEncoded.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(normalized, 'base64');
    payload = JSON.parse(buffer.toString('utf8'));
  } catch (error) {
    console.error('Failed to parse confirmation token', error);
    return res.status(400).send('Invalid token payload');
  }

  if (!payload || !payload.sub || !payload.exp) {
    return res.status(400).send('Invalid token payload');
  }

  if (Math.floor(Date.now() / 1000) > payload.exp) {
    return res.status(400).send('Token expired');
  }

  try {
    const confirmResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${payload.sub}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ email_confirmed_at: new Date().toISOString() }),
    });

    if (!confirmResp.ok) {
      const body = await confirmResp.text();
      console.error('Supabase confirm failed', confirmResp.status, body);
      return res.status(500).send('Confirmation failed');
    }

    return res.redirect(`${SITE_URL.replace(/\/$/, '')}/candidate/login`);
  } catch (error) {
    console.error('Confirmation error', error);
    return res.status(500).send('Server error');
  }
}
