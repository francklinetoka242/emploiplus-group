import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCandidateProfileUpdatePayload } from '../../src/features/candidates/api/profileUpdateUtils.ts';

test('uses the existing first and last name when the incoming values are empty', () => {
  const payload = buildCandidateProfileUpdatePayload(
    {
      first_name: '',
      last_name: '',
      headline: 'Développeur',
    },
    {
      first_name: 'Jean',
      last_name: 'Dupont',
      headline: 'Ancien titre',
    },
  );

  assert.equal(payload.first_name, 'Jean');
  assert.equal(payload.last_name, 'Dupont');
  assert.equal(payload.headline, 'Développeur');
});

test('falls back to a safe default when no name exists anywhere', () => {
  const payload = buildCandidateProfileUpdatePayload({
    first_name: '',
    last_name: '',
  });

  assert.equal(payload.first_name, 'Candidat');
  assert.equal(payload.last_name, 'Candidat');
});
