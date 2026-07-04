import test from 'node:test';
import assert from 'node:assert/strict';
import { readResponseBody } from '../../api/register.ts';

test('parses JSON bodies from upstream responses', async () => {
  const response = new Response(JSON.stringify({ message: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

  const body = await readResponseBody(response as Response);

  assert.deepEqual(body, { message: 'ok' });
});

test('falls back to plain text when the upstream response is not JSON', async () => {
  const response = new Response('duplicate email', {
    status: 422,
    headers: { 'content-type': 'text/plain' },
  });

  const body = await readResponseBody(response as Response);

  assert.equal(body, 'duplicate email');
});
