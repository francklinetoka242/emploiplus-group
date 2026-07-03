import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateSupabaseUserConfirmation } from './confirm-utils';
import { resolveConfirmationBaseUrl } from './confirm-url.ts';

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
  const rawSigningSecret = process.env.EMAIL_SIGNING_SECRET || process.env.SEND_EMAIL_HOOK_SECRET;
  const confirmationBaseUrl = resolveConfirmationBaseUrl(process.env, req);
  const signingSecrets = [
    rawSigningSecret,
    rawSigningSecret?.replace(/^v1,whsec_/, ''),
  ]
    .filter(Boolean)
    .map((value) => value as string);

  if (!token || !SUPABASE_URL || !SERVICE_KEY || signingSecrets.length === 0) {
    return res.status(400).send('Invalid confirmation request');
  }

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) {
    return res.status(400).send('Invalid confirmation token');
  }

  console.log('[CONFIRM-DEBUG][confirm] receivedToken', token);
  console.log('[CONFIRM-DEBUG][confirm] payloadEncoded', payloadEncoded);
  console.log('[CONFIRM-DEBUG][confirm] receivedSignature', signature);
  console.log('[CONFIRM-DEBUG][confirm] confirmationBaseUrl', confirmationBaseUrl);

  const signatureMatches = signingSecrets.some((secret) => {
    const expectedSignature = base64url(createHmac('sha256', secret).update(payloadEncoded).digest());
    console.log('[CONFIRM-DEBUG][confirm] signatureCheck', {
      secretPreview: secret.slice(0, 8),
      expectedSignature,
      receivedSignature: signature,
      match: expectedSignature === signature,
    });
    if (expectedSignature === signature) {
      return true;
    }
    console.debug('Token signature mismatch for secret variant', {
      expectedSignature,
      signature,
      secretPreview: secret.slice(0, 8),
    });
    return false;
  });

  if (!signatureMatches) {
    console.error('Token signature mismatch', {
      signature,
      secretVariants: signingSecrets.map((secret) => secret.slice(0, 8)),
    });
    return res.status(400).send('Invalid or expired token');
  }

  let payload: any;
  try {
    const normalized = payloadEncoded.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(normalized, 'base64');
    payload = JSON.parse(buffer.toString('utf8'));
    console.log('[CONFIRM-DEBUG][confirm] decodedPayload', payload);
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
