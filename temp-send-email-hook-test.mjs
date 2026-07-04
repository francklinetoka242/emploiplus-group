import dotenv from 'dotenv';
import https from 'https';

const env = dotenv.config({ path: './.env' }).parsed;
// SEND_EMAIL_HOOK_SECRET removed; send unsigned payload for local testing
const secret = '';

const payload = JSON.stringify({
  type: 'signup',
  recipient: 'test@example.com',
  subject: 'Confirmation de test',
  html: '<p>Test du hook</p>',
});

const msgId = 'msg-' + Date.now();
const timestamp = Math.floor(Date.now() / 1000).toString();
const options = {
  method: 'POST',
  hostname: 'emploiplus-group.com',
  path: '/send-email',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    // no webhook headers
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
