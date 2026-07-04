import 'dotenv/config';
import { createHmac } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

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
      const buttonBg = '#E8A900';
      const buttonText = '#00009E';
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        replyTo: fromEmail,
        subject: 'Confirmez votre adresse e-mail',
        text: `Bonjour ${firstName},\n\nMerci pour votre inscription sur EmploiPlus Group. Pour activer votre compte candidat, veuillez confirmer votre adresse e-mail en cliquant sur le lien ci-dessous :\n${confirmLink}\n\n✓ Ce lien est valable 24 heures.\n✓ Après expiration, vous pourrez demander un nouvel e-mail depuis la page de connexion.\n✓ Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.`,
        html: `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0;padding:0;background-color:#f4f7fb;font-family:Inter, Segoe UI, Arial, sans-serif;">
            <tr>
              <td align="center" style="padding:24px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 24px rgba(0,0,0,0.06);">
                  <tr>
                    <td style="background-color:#00009E;padding:28px 32px;text-align:center;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="padding-bottom:10px;">
                            <img src="${logoUrl}" alt="EmploiPlus Group" width="56" height="56" style="display:block;margin:0 auto;max-width:56px;height:auto;border-radius:12px;background-color:#ffffff;padding:4px;" />
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;font-family:Inter, Segoe UI, Arial, sans-serif;">
                            EmploiPlus Group
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size:14px;line-height:1.5;color:#e9ecff;padding-top:6px;font-family:Inter, Segoe UI, Arial, sans-serif;">
                            Confirmation d'inscription candidat
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 32px 20px 32px;background-color:#ffffff;">
                      <p style="margin:0 0 14px;font-size:18px;line-height:1.5;color:#0f172a;font-family:Inter, Segoe UI, Arial, sans-serif;">Bonjour ${firstName},</p>
                      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">
                        Merci pour votre inscription sur <strong style="color:#00009E;">EmploiPlus Group</strong>.
                      </p>
                      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">
                        Pour activer votre compte candidat, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 24px 0;">
                        <tr>
                          <td align="center" bgcolor="${buttonBg}" style="border-radius:10px;">
                            <a href="${confirmLink}" target="_blank" rel="noreferrer" style="display:inline-block;padding:14px 30px;font-size:15px;line-height:1.2;font-weight:700;color:${buttonText};text-decoration:none;font-family:Inter, Segoe UI, Arial, sans-serif;">Confirmer mon adresse email</a>
                          </td>
                        </tr>
                      </table>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px 0;border-top:1px solid #e5e7eb;padding-top:16px;">
                        <tr>
                          <td style="font-size:14px;line-height:1.7;color:#334155;font-family:Inter, Segoe UI, Arial, sans-serif;">
                            <div style="margin-bottom:8px;">✓ Lien valable 24 heures</div>
                            <div style="margin-bottom:8px;">✓ Après expiration, vous pourrez demander un nouvel e-mail depuis la page de connexion.</div>
                            <div>✓ Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color:#f8fafc;padding:24px 32px;border-top:3px solid #E8A900;">
                      <p style="margin:0 0 10px;font-size:15px;line-height:1.4;font-weight:700;color:#0f172a;font-family:Inter, Segoe UI, Arial, sans-serif;">Nous contacter</p>
                      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Téléphone : <a href="tel:+242067311033" style="color:#00009E;text-decoration:none;">+242 0673 11033</a></p>
                      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Email : <a href="mailto:contact@emploiplus-group.com" style="color:#00009E;text-decoration:none;">contact@emploiplus-group.com</a></p>
                      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Ville : Pointe-Noire, République du Congo</p>
                      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">Offres WhatsApp : <a href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631" style="color:#00009E;text-decoration:none;">whatsapp.com/channel/0029Vb5pc270VycKAb1tc631</a></p>
                      <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#475569;font-family:Inter, Segoe UI, Arial, sans-serif;">EmploiPlus Group WhatsApp : <a href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43" style="color:#00009E;text-decoration:none;">whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43</a></p>
                      <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:#64748b;font-family:Inter, Segoe UI, Arial, sans-serif;">© EmploiPlus Group</p>
                      <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;font-family:Inter, Segoe UI, Arial, sans-serif;">Recrutement • Opportunités • Accompagnement professionnel</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
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
