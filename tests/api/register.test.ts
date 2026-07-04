import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/register.ts';

test('returns a 500 response when email signing secret is missing', async () => {
  const previousSecret = process.env.EMAIL_SIGNING_SECRET;
  delete process.env.EMAIL_SIGNING_SECRET;

  const req = {
    method: 'POST',
    body: {
      email: 'candidate@example.com',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
    },
  } as any;

  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
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
