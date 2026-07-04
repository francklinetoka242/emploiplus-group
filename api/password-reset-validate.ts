import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPasswordResetToken } from '../src/lib/password-reset-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = String(req.query.token || '');
  const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET as string | undefined;

  if (!EMAIL_SIGNING_SECRET) {
    throw new Error('EMAIL_SIGNING_SECRET missing');
  }

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    const payload = verifyPasswordResetToken(token, EMAIL_SIGNING_SECRET);
    return res.status(200).json({ success: true, email: payload.email });
  } catch (error: any) {
    console.error('Password reset token validation failed', error);
    return res.status(400).json({ error: error.message || 'Invalid token' });
  }
}
