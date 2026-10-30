import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { parseBackupEnvelope } from '@/lib/server/imports/legacy-save/backup-format';

it('validates the external acceptance fixture with independent dates in one patient follow-up', () => {
  const content = readFileSync(resolve('tests/fixtures/nutridiet/external-routine.nutridiet'), 'utf8');
  const envelope = parseBackupEnvelope(content);
  expect(envelope.patients[0].name).toBe('Paciente externo SDD 1');
  expect(envelope.nextFollowUps).toHaveLength(1);
  expect(envelope.nextFollowUps[0]).toMatchObject({
    type: 'BOTH', dietDueDate: '2026-10-25', assessmentDueDate: '2026-10-26',
  });
});
