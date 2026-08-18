

import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const smtpHost = process.env.SMTP_HOST!;
const smtpPort = parseInt(process.env.SMTP_PORT!);
const smtpUser = process.env.SMTP_USER!;
const smtpPass = process.env.SMTP_PASS!;
const jwtSecret = process.env.EMAIL_SIGNING_SECRET!;
const deepLinkUrl = process.env.DEEP_LINK_URL || 'emploiplus://verify';
const siteUrl = process.env.SITE_URL || 'https://www.emploiplus-group.com';

const supabase = createClient(supabaseUrl, supabaseKey);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// Générer token HMAC
function createHMACToken(email: string, userId: string, secret: string): string {
  const payload = JSON.stringify({ email, userId, iat: Date.now() });
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

// Générer code 6 chiffres
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
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
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Failed to create user' });
    }

    const userId = authData.user.id;

    // 2. Générer code de vérification
    const code = generateVerificationCode();
    const token = createHMACToken(email, userId, jwtSecret);
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    // 3. Stocker le code en base
    const { error: codeError } = await supabase
      .from('email_verification_codes')
      .insert([
        {
          email,
          code,
          user_id: userId,
          expires_at: expiresAt.toISOString(),
          verified_at: null,
          attempts: 0,
          max_attempts: 5,
        },
      ]);

    if (codeError) {
      return res.status(500).json({ error: 'Failed to store verification code' });
    }

    // 4. Créer lien de confirmation avec token
    const deepLink = `${deepLinkUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;

    // 5. Envoyer l'email
    const mailContent = `
      <h2>Bienvenue sur Emploiplus!</h2>
      <p>Votre code de vérification : <strong>${code}</strong></p>
      <p>Ou cliquez ici pour confirmer : <a href="${deepLink}">Confirmer automatiquement</a></p>
      <p>Ce code expire dans 20 minutes.</p>
    `;

    await transporter.sendMail({
      from: `${process.env.FROM_NAME || 'Emploiplus'} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Code de vérification Emploiplus',
      html: mailContent,
    });

    res.status(200).json({
      success: true,
      userId,
      email,
      message: 'User registered. Check your email for verification code.',
    });
  } catch (error: any) {
    console.error('Mobile register error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

