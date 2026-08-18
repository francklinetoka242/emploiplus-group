
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.EMAIL_SIGNING_SECRET!;

const supabase = createClient(supabaseUrl, supabaseKey);

function verifyHMACToken(token: string, secret: string): { email: string; userId: string } | null {
  try {
    const [payload, signature] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64url');
    if (hmac === signature) {
      return decoded;
    }
  } catch (e) {
    console.error('Token verification error:', e);
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, email, userId, newPassword } = req.body;

    if (!token || !email || !userId || !newPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // 1. Valider le token
    const decoded = verifyHMACToken(token, jwtSecret);
    if (!decoded || decoded.email !== email || decoded.userId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // 2. Mettre à jour le password
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    // 3. Marquer comme utilisé
    await supabase
      .from('email_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('email', email)
      .eq('user_id', userId);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    console.error('Mobile reset error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}