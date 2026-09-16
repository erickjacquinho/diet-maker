// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { parseBackupEnvelope, validateBackupEnvelope } from '@/lib/application/backup-application';
import { PGliteBackupRepository } from '@/lib/infrastructure/local-db/backup-repository';
import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import type { LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { createBackupEnvelope } from '../../fixtures/backup';
import { createBackupTestDatabase, seedBackupEnvelope } from '../../helpers/backup';

const projectRoot = resolve(process.cwd());
const validFixturePath = resolve(projectRoot, 'tests/fixtures/nutridiet/valid-jacques-regiani.nutridiet');

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

async function readValidFixture(): Promise<string> {
  return readFile(validFixturePath, 'utf8');
}

function expectValidationError(action: () => unknown, code: string): void {
  try {
    action();
    throw new Error(`Expected validation error ${code}.`);
  } catch (error) {
    expect(error).toMatchObject({ code });
  }
}

describe('NutriDiet save round trip', () => {
  it('validates and imports the Jacques Regiani fixture, then queries its patient by accountId', async () => {
    const serialized = await readValidFixture();
    const envelope = parseBackupEnvelope(serialized);

    expect(envelope.account[0]).toMatchObject({ id: 'fixture-jacques-account', displayName: 'Jacques Regiani', phone: '+55 11 99999-0000' });
    expect(envelope.patients).toHaveLength(1);

    handle = await createBackupTestDatabase('profile-roundtrip');
    const repository = new PGliteBackupRepository(handle);
    await repository.replaceAccountSnapshot(envelope.account[0].id, envelope);

    const restored = await repository.readAccountSnapshot('fixture-jacques-account');
    expect(restored.account[0]?.displayName).toBe('Jacques Regiani');
    expect(restored.patients).toEqual(expect.arrayContaining([
      expect.objectContaining({ accountId: 'fixture-jacques-account', name: 'Paciente de Jacques' }),
    ]));
  });

  it('accepts schema 4 accounts without phone and normalizes the next envelope to schema 6', () => {
    const legacy = createBackupEnvelope();
    const normalized = validateBackupEnvelope(legacy);

    expect(normalized.schemaVersion).toBe('6');
    expect(normalized.account[0]).toHaveProperty('phone', null);
  });

  it('rejects future versions, duplicate identifiers and broken relations before import', async () => {
    const source = JSON.parse(await readValidFixture()) as Record<string, unknown>;
    const future = { ...source, schemaVersion: '99' };
    const duplicatePatients = {
      ...source,
      patients: [
        ...(source.patients as Array<Record<string, unknown>>),
        { ...(source.patients as Array<Record<string, unknown>>)[0] },
      ],
    };
    const brokenRelation = {
      ...source,
      patients: [{ ...(source.patients as Array<Record<string, unknown>>)[0], accountId: 'foreign-account' }],
    };

    expectValidationError(() => validateBackupEnvelope(future), 'BACKUP_VERSION_UNSUPPORTED');
    expectValidationError(() => validateBackupEnvelope(duplicatePatients), 'BACKUP_RELATION_INVALID');
    expectValidationError(() => validateBackupEnvelope(brokenRelation), 'BACKUP_RELATION_INVALID');

    handle = await createBackupTestDatabase('profile-preserve');
    const original = validateBackupEnvelope(createBackupEnvelope());
    await seedBackupEnvelope(handle, original);
    const before = await new PGliteBackupRepository(handle).readAccountSnapshot(original.account[0].id);

    expectValidationError(() => validateBackupEnvelope(brokenRelation), 'BACKUP_RELATION_INVALID');
    const after = await new PGliteBackupRepository(handle).readAccountSnapshot(original.account[0].id);
    expect({ ...after, exportedAt: before.exportedAt }).toEqual(before);
  });
});
