import { createHmac } from 'crypto';

type TokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

export function base64url(input: string | Buffer) {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function base64urlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

export function verifyPasswordResetToken(token: string, secret: string) {
  const [payloadEncoded, signature] = token.split('.');

  if (!payloadEncoded || !signature) {
    throw new Error('Invalid token format');
  }

  const expectedSignature = base64url(createHmac('sha256', secret).update(payloadEncoded).digest());
  if (expectedSignature !== signature) {
    throw new Error('Invalid or tampered token');
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadEncoded));
  } catch (error) {
    throw new Error('Invalid token payload');
  }

  if (!payload?.sub || !payload?.exp || !payload?.email) {
    throw new Error('Invalid token payload');
  }

  if (Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}

export function signPasswordResetToken(payload: Omit<TokenPayload, 'exp' | 'iat'>, secret: string) {
  const tokenPayload: TokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const payloadEncoded = base64url(Buffer.from(JSON.stringify(tokenPayload), 'utf8'));
  const signature = base64url(createHmac('sha256', secret).update(payloadEncoded).digest());
  return `${payloadEncoded}.${signature}`;
}
