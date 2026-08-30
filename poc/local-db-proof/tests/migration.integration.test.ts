// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { closeDatabase, type DatabaseHandle } from '../src/db/client';
import { cloneFixture } from '../src/fixture';
import { assertSupportedSchemaVersion, applyMigrations, migrationFiles } from '../src/db/migrations';
import { createDatabaseRepository } from '../src/db/repositories';
import { assertConfirmedFixtureEqual } from './support/fixture-assertions';
import { schema } from '../src/db/schema';

const handles: DatabaseHandle[] = [];

afterEach(async () => {
  for (const handle of handles.splice(0)) {
    await closeDatabase(handle);
  }
});

describe('versioned migration seam', () => {
  it('preserves a populated fixture when the additive migration is applied twice', async () => {
    const client = new PGlite('memory://migration-upgrade-test');
    await client.waitReady;
    await applyMigrations(client, migrationFiles.slice(0, 1));
    const initialHandle: DatabaseHandle = {
      mode: 'test-memory',
      schemaVersion: '1',
      persistent: false,
      client,
      db: drizzle(client, { schema }),
      close: () => client.close(),
    };
    handles.push(initialHandle);
    const repository = createDatabaseRepository(initialHandle);
    await repository.seedFixture(cloneFixture());
    const before = await repository.readConfirmed('account-alpha');

    expect(await applyMigrations(initialHandle.client)).toBe('2');
    const afterFirstRun = await repository.readConfirmed('account-alpha');
    expect(await applyMigrations(initialHandle.client)).toBe('2');
    const afterSecondRun = await repository.readConfirmed('account-alpha');

    assertConfirmedFixtureEqual(afterFirstRun, before);
    assertConfirmedFixtureEqual(afterSecondRun, before);
  });

  it('rejects an unsupported schema version before running migration work', () => {
    let thrown: unknown;
    try {
      assertSupportedSchemaVersion('unsupported-schema');
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toMatchObject({ code: 'MIGRATION_FAILED' });
  });
});
