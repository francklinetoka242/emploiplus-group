import 'dotenv/config';
import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
  throw new Error('SMTP env missing');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const info = await transporter.sendMail({
  from: `"EmploiPlus Group" <${smtpUser}>`,
  replyTo: process.env.FROM_EMAIL?.trim() || smtpUser,
  to: 'sylveretoka@gmail.com',
  subject: 'Test SMTP EmploiPlus Group',
  html: '<p>Test d\'envoi SMTP depuis EmploiPlus Group vers sylveretoka@gmail.com.</p>',
  text: 'Test d\'envoi SMTP depuis EmploiPlus Group vers sylveretoka@gmail.com.',
});

console.log('SMTP SUCCESS', info.messageId, info.response);
