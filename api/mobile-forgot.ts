
import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const smtpHost = process.env.SMTP_HOST!;
const smtpPort = parseInt(process.env.SMTP_PORT!);
const smtpUser = process.env.SMTP_USER!;
const smtpPass = process.env.SMTP_PASS!;
const jwtSecret = process.env.EMAIL_SIGNING_SECRET!;
const deepLinkUrl = process.env.DEEP_LINK_URL || 'emploiplus://reset';

const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

function createHMACToken(email: string, userId: string, secret: string): string {
  const payload = JSON.stringify({ email, userId, iat: Date.now() });
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // 1. Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    const user = userData?.users.find((u: any) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Générer code et token
    const code = generateVerificationCode();
    const token = createHMACToken(email, user.id, jwtSecret);
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    // 3. Sauvegarder le code
    await supabase
      .from('email_verification_codes')
      .upsert([
        {
          email,
          user_id: user.id,
          code,
          expires_at: expiresAt.toISOString(),
          verified_at: null,
          attempts: 0,
          max_attempts: 5,
        },
      ], { onConflict: 'email' });

    // 4. Envoyer l'email avec lien de reset
    const deepLink = `${deepLinkUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&userId=${encodeURIComponent(user.id)}`;
    const mailContent = `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Code : <strong>${code}</strong></p>
      <p>Ou <a href="${deepLink}">cliquez ici</a> pour réinitialiser directement.</p>
      <p>Valide 20 minutes.</p>
    `;

    await transporter.sendMail({
      from: `${process.env.FROM_NAME || 'Emploiplus'} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation mot de passe',
      html: mailContent,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Mobile forgot error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}