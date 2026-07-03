const { Webhook } = require('standardwebhooks');
const https = require('https');
const { URL } = require('url');

const secret = 'v1,whsec_SW5OA+4w/o8SzPLASbszm5bG8LLkz1DN+f3VMvS0cm7yMN+zsXn1zzFfSwZCieytvM6KFpiTRcWhQPbg';
const payload = {
  type: 'signup',
  recipient: 'test@example.com',
  subject: 'Confirmation de test',
  html: '<p>Test du hook</p>'
};
const body = JSON.stringify(payload);
const webhook = new Webhook(secret);
const msgId = 'msg-' + Date.now();
const timestamp = Math.floor(Date.now() / 1000).toString();
const signature = webhook.sign(msgId, new Date(Number(timestamp) * 1000), body);

const url = new URL('https://emploiplus-group.com/send-email');
const options = {
  method: 'POST',
  hostname: url.hostname,
  path: url.pathname,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'webhook-id': msgId,
    'webhook-timestamp': timestamp,
    'webhook-signature': signature,
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('BODY', data);
  });
});

req.on('error', (err) => {
  console.error('ERROR', err.message);
});
req.write(body);
req.end();
