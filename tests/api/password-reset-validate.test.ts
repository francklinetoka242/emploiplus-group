import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/password-reset-validate.ts';

test('returns a JSON error response when email signing secret is missing', async () => {
  const previousSecret = process.env.EMAIL_SIGNING_SECRET;
  delete process.env.EMAIL_SIGNING_SECRET;

  const req = {
    method: 'GET',
    query: { token: 'dummy-token' },
  } as any;

  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
  } as any;

  try {
    await handler(req, res);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: 'Server misconfiguration' });
  } finally {
    if (previousSecret === undefined) {
      delete process.env.EMAIL_SIGNING_SECRET;
    } else {
      process.env.EMAIL_SIGNING_SECRET = previousSecret;
    }
  }
});
