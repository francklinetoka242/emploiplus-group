import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { base64url } from '../utils/token';

type UnknownObject = Record<string, unknown>;

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
      const logoUrl = `${confirmationBaseUrl}/assets/favicon.ico`;
      const buttonColor = '#0d6efd';
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        replyTo: fromEmail,
        subject: 'Confirmez votre adresse e-mail',
        text: `Bonjour ${firstName},\n\nMerci pour votre inscription. Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail :\n${confirmLink}\n\nCe lien est valable 24 heures. Si vous ne recevez pas cet e-mail, retournez sur la page de connexion pour demander un renvoi.\n\nContact: ${fromEmail}\nTel/WhatsApp: +242 0673 11033\nLocalisation: Pointe-Noire, République du Congo\nOffres WhatsApp : https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631\nEntreprise WhatsApp : https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43`,
        html: `
          <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#1f2937; line-height:1.5;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
              <tr style="background:#0d6efd;color:#ffffff;">
                <td style="padding:20px 24px; text-align:left; display:flex; align-items:center; gap:14px;">
                  <img src="${logoUrl}" alt="EmploiPlus Group" width="40" height="40" style="display:block;border-radius:8px;" />
                  <div>
                    <h1 style="margin:0;font-size:20px;">EmploiPlus Group</h1>
                    <p style="margin:4px 0 0;font-size:14px;opacity:.9;">Confirmation d'inscription candidat</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;background:#ffffff;">
                  <p style="margin:0 0 16px;font-size:16px;color:#111827;">Bonjour ${firstName},</p>
                  <p style="margin:0 0 16px;font-size:15px;color:#374151;">Merci pour votre inscription sur EmploiPlus Group. Pour activer votre compte candidat, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :</p>
                  <p style="text-align:center;margin:24px 0;"><a href="${confirmLink}" target="_blank" rel="noreferrer" style="display:inline-block;padding:14px 24px;background:${buttonColor};color:#ffffff;font-weight:600;border-radius:10px;text-decoration:none;">Confirmer mon e‑mail</a></p>
                  <p style="margin:0 0 16px;font-size:15px;color:#374151;">Ce lien est valable 24 heures. Après ce délai, vous pourrez demander un renvoi de l’email depuis la page de connexion.</p>
                  <p style="margin:0 0 16px;font-size:15px;color:#374151;">Si vous n'avez pas demandé cette inscription, veuillez ignorer ce message.</p>
                </td>
              </tr>
              <tr style="background:#f8fafc;">
                <td style="padding:20px 24px;">
                  <h2 style="margin:0 0 12px;font-size:16px;color:#0f172a;">Contact</h2>
                  <p style="margin:0 0 6px;font-size:14px;color:#475569;">Téléphone & WhatsApp : <a href="tel:+242067311033" style="color:#0d6efd;text-decoration:none;">+242 0673 11033</a></p>
                  <p style="margin:0 0 6px;font-size:14px;color:#475569;">Email : <a href="mailto:contact@emploiplus-group.com" style="color:#0d6efd;text-decoration:none;">contact@emploiplus-group.com</a></p>
                  <p style="margin:0 0 6px;font-size:14px;color:#475569;">Localisation : Pointe-Noire, République du Congo</p>
                  <p style="margin:0 0 6px;font-size:14px;color:#475569;">Chaîne offres gratuites WhatsApp : <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" style="color:#0d6efd;text-decoration:none;">whatsapp.com/channel/0029Vb5pc270VycKAb1tc631</a></p>
                  <p style="margin:0;font-size:14px;color:#475569;">Chaîne Emploiplus Group WhatsApp : <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" style="color:#0d6efd;text-decoration:none;">whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43</a></p>
                </td>
              </tr>
            </table>
          </div>
        `,
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
