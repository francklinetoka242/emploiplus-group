import "dotenv/config";
import nodemailer from "nodemailer";

const [,, recipientArg] = process.argv;
const recipient = recipientArg || process.env.TEST_RECIPIENT;
if (!recipient) {
  console.error('Usage: node scripts/test-smtp.js recipient@example.com (or set TEST_RECIPIENT env var)');
  process.exit(1);
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.FROM_NAME || 'EmploiPlus Group';

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.error('Missing SMTP environment variables. Ensure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set.');
  process.exit(2);
}

async function main() {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: recipient,
      subject: 'Test SMTP - EmploiPlus Group',
      text: 'Ceci est un message de test pour vérifier la configuration SMTP.',
      html: '<p>Ceci est un <strong>message de test</strong> pour vérifier la configuration SMTP.</p>'
    });
    console.log('Message sent:', info.messageId || info);
    process.exit(0);
  } catch (err) {
    console.error('Failed to send test email:', err);
    process.exit(3);
  }
}

main();
