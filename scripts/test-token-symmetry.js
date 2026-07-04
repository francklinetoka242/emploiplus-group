const { createHmac } = require('crypto');

function base64url(input) {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function base64urlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

const EMAIL_SIGNING_SECRET = process.env.EMAIL_SIGNING_SECRET || 'test-secret-12345';
console.log('EMAIL_SIGNING_SECRET exists', !!EMAIL_SIGNING_SECRET);
console.log('EMAIL_SIGNING_SECRET length', EMAIL_SIGNING_SECRET.length);

const tokenPayload = {
  sub: 'user_test_1',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
};

const payloadEncoded = base64url(Buffer.from(JSON.stringify(tokenPayload), 'utf8'));
const signature = base64url(createHmac('sha256', EMAIL_SIGNING_SECRET).update(payloadEncoded).digest());
const token = `${payloadEncoded}.${signature}`;
console.log('TOKEN GENERATED', token);

// Now validate
const [payloadEncodedR, signatureR] = token.split('.')
console.log('TOKEN RECEIVED', token);
const expectedSignature = base64url(createHmac('sha256', EMAIL_SIGNING_SECRET).update(payloadEncodedR).digest());
console.log('EXPECTED SIGNATURE', expectedSignature);
console.log('RECEIVED SIGNATURE', signatureR);
console.log('SIGNATURE MATCH', expectedSignature === signatureR);

const decoded = base64urlDecode(payloadEncodedR);
console.log('DECODED PAYLOAD', decoded);
try {
  const parsed = JSON.parse(decoded);
  console.log('DECODED PAYLOAD (obj)', parsed);
} catch (e) {
  console.error('Failed to parse payload', e);
}
