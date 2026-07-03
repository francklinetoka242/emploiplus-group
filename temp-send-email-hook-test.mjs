import dotenv from 'dotenv';
import { Webhook } from 'standardwebhooks';
import https from 'https';

const env = dotenv.config({ path: './.env' }).parsed;
const secret = env?.SEND_EMAIL_HOOK_SECRET;
if (!secret) {
  console.error('SEND_EMAIL_HOOK_SECRET not found');
  process.exit(1);
}

const payload = JSON.stringify({
  type: 'signup',
  recipient: 'test@example.com',
  subject: 'Confirmation de test',
  html: '<p>Test du hook</p>',
});

const webhook = new Webhook(secret);
const msgId = 'msg-' + Date.now();
const timestamp = Math.floor(Date.now() / 1000).toString();
const signature = webhook.sign(msgId, new Date(Number(timestamp) * 1000), payload);

const options = {
  method: 'POST',
  hostname: 'emploiplus-group.com',
  path: '/send-email',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'webhook-id': msgId,
    'webhook-timestamp': timestamp,
    'webhook-signature': signature,
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log('body', data);
  });
});

req.on('error', (err) => {
  console.error('request error', err.message);
});
req.write(payload);
req.end();
