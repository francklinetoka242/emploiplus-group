import test from 'node:test';
import assert from 'node:assert/strict';
import { updateSupabaseUserConfirmation } from './confirm-utils.ts';

test('retries with PATCH when PUT is rejected as unsupported', async () => {
  const calls: Array<{ method?: string }> = [];
  const successResponse = {
    ok: true,
    status: 200,
    text: async () => 'ok',
  };
  const unsupportedResponse = {
    ok: false,
    status: 405,
    text: async () => 'method not allowed',
  };

  const response = await updateSupabaseUserConfirmation(
    async (_url, init) => {
      calls.push({ method: init?.method });
      return calls.length === 1 ? unsupportedResponse : successResponse;
    },
    'https://example.supabase.co',
    'user-123',
    'service-key',
    '2026-07-03T00:00:00.000Z',
  );

  assert.equal(response, successResponse);
  assert.deepEqual(calls.map((call) => call.method), ['PUT', 'PATCH']);
});
