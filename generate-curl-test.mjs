import dotenv from 'dotenv';
import { Webhook } from 'standardwebhooks';

const env = dotenv.config({ path: './.env' }).parsed;
const raw = env?.SEND_EMAIL_HOOK_SECRET;
if (!raw) {
  console.error('no secret');
  process.exit(1);
}

const secret = raw.replace(/^v1,whsec_/, '');
const payload = JSON.stringify({
  type: 'signup',
  recipient: 'test.candidate@example.com',
  subject: 'Confirmation de votre inscription',
  html: '<p>Merci de confirmer votre email</p>',
});

const webhook = new Webhook(secret);
const msgId = 'msg_' + Date.now();
const timestamp = Math.floor(Date.now() / 1000).toString();
const signature = webhook.sign(msgId, new Date(Number(timestamp) * 1000), payload);

console.log('Commande curl:');
console.log('');
console.log(`curl.exe -X POST https://emploiplus-group.com/send-email \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "webhook-id: ${msgId}" \\`);
console.log(`  -H "webhook-timestamp: ${timestamp}" \\`);
console.log(`  -H "webhook-signature: ${signature}" \\`);
console.log(`  -d '${payload}' \\`);
console.log(`  -i`);
console.log('');
console.log('Résultat attendu: HTTP 200 avec status "sent"');
