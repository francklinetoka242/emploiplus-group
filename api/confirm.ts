import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateSupabaseUserConfirmation } from './confirm-utils';
import { resolveConfirmationBaseUrl } from './confirm-url.ts';
import { base64url, base64urlDecode } from '../utils/token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = String(req.query.token || '');
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET as string | undefined;
  if (!EMAIL_SIGNING_SECRET) {
    throw new Error('EMAIL_SIGNING_SECRET missing');
  }
  console.log('EMAIL_SIGNING_SECRET length', EMAIL_SIGNING_SECRET.length);
  const confirmationBaseUrl = resolveConfirmationBaseUrl(process.env, req);

  if (!token || !SUPABASE_URL || !SERVICE_KEY) {
    return res.status(400).send('Invalid confirmation request');
  }
  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) {
    return res.status(400).send('Invalid confirmation token');
  }

  console.log('TOKEN RECEIVED', token);
  console.log('[CONFIRM-DEBUG][confirm] payloadEncoded', payloadEncoded);
  console.log('RECEIVED SIGNATURE', signature);
  console.log('[CONFIRM-DEBUG][confirm] confirmationBaseUrl', confirmationBaseUrl);

  const expectedSignature = base64url(createHmac('sha256', EMAIL_SIGNING_SECRET).update(payloadEncoded).digest());
  console.log('EXPECTED SIGNATURE', expectedSignature);
  console.log('SIGNATURE MATCH', expectedSignature === signature);
  if (expectedSignature !== signature) {
    console.error('Token signature mismatch', { signature, expectedSignature });
    return res.status(400).send('Invalid or expired token');
  }

  let payload: any;
  try {
    const decoded = base64urlDecode(payloadEncoded);
    payload = JSON.parse(decoded);
    console.log('DECODED PAYLOAD', payload);
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
    console.log('[CONFIRM-DEBUG][confirm] supabaseUpdateRequest', {
      url: `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${payload.sub}`,
      method: 'PUT/PATCH',
      payload: { email_confirmed_at: new Date().toISOString() },
    });

    const confirmResp = await updateSupabaseUserConfirmation(
      fetch,
      SUPABASE_URL,
      payload.sub,
      SERVICE_KEY,
      new Date().toISOString(),
    );

    const body = await confirmResp.text();
    console.log('[CONFIRM-DEBUG][confirm] supabaseUpdateResponse', {
      status: confirmResp.status,
      body,
    });

    if (!confirmResp.ok) {
      console.error('Supabase confirm failed', confirmResp.status, body);
      return res
        .status(confirmResp.status)
        .send(`Confirmation failed: ${body || 'Unknown error'}`);
    }

    console.log('[CONFIRM-DEBUG][confirm] redirectUrl', `${confirmationBaseUrl}/candidate/login`);
    return res.redirect(`${confirmationBaseUrl}/candidate/login`);
  } catch (error) {
    console.error('[CONFIRM-DEBUG][confirm] exception', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).send('Server error');
  }
}
