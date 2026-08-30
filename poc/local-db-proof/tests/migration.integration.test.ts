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
import { SUPPORTED_SCHEMA_VERSION } from '../src/contracts';

const handles: DatabaseHandle[] = [];

afterEach(async () => {
  for (const handle of handles.splice(0)) {
    await closeDatabase(handle);
  }
});

describe('versioned migration seam', () => {
  it.each([1, 2])('preserves both accounts when upgrading schema v%i twice', async (initialVersion) => {
    const client = new PGlite('memory://migration-upgrade-test');
    await client.waitReady;
    await applyMigrations(client, migrationFiles.slice(0, initialVersion));
    const initialHandle: DatabaseHandle = {
      mode: 'test-memory',
      schemaVersion: String(initialVersion),
      persistent: false,
      client,
      db: drizzle(client, { schema }),
      close: () => client.close(),
    };
    handles.push(initialHandle);
    const repository = createDatabaseRepository(initialHandle);
    await repository.seedFixture(cloneFixture());
    const before = await repository.readConfirmed('account-alpha');
    const betaBefore = await repository.readConfirmed('account-beta');

    expect(await applyMigrations(initialHandle.client)).toBe(SUPPORTED_SCHEMA_VERSION);
    const afterFirstRun = await repository.readConfirmed('account-alpha');
    expect(await applyMigrations(initialHandle.client)).toBe(SUPPORTED_SCHEMA_VERSION);
    const afterSecondRun = await repository.readConfirmed('account-alpha');

    assertConfirmedFixtureEqual(afterFirstRun, before);
    assertConfirmedFixtureEqual(afterSecondRun, before);
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-beta'), betaBefore);
    const journal = await client.query('SELECT id FROM __poc_migrations ORDER BY id');
    expect(journal.rows).toEqual(migrationFiles.map(({ id }) => ({ id })));
  });

  it('rejects invalid v2 ownership atomically without deleting existing data or journaling v3', async () => {
    const client = new PGlite();
    await client.waitReady;
    await applyMigrations(client, migrationFiles.slice(0, 2));
    const handle: DatabaseHandle = {
      mode: 'test-memory', schemaVersion: '2', persistent: false,
      client, db: drizzle(client, { schema }), close: () => client.close(),
    };
    handles.push(handle);
    const repository = createDatabaseRepository(handle);
    const invalid = cloneFixture();
    invalid.dietPlans[0].accountId = 'account-beta';
    await repository.seedFixture(invalid);
    const alphaBefore = await repository.readConfirmed('account-alpha');
    const betaBefore = await repository.readConfirmed('account-beta');

    await expect(applyMigrations(client)).rejects.toMatchObject({ code: 'MIGRATION_FAILED' });
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-alpha'), alphaBefore);
    assertConfirmedFixtureEqual(await repository.readConfirmed('account-beta'), betaBefore);
    expect((await client.query('SELECT id FROM __poc_migrations ORDER BY id')).rows)
      .toEqual(migrationFiles.slice(0, 2).map(({ id }) => ({ id })));
    expect((await client.query("SELECT conname FROM pg_constraint WHERE conname = 'diet_plans_account_id_accounts_id_fk'")).rows)
      .toEqual([]);
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
