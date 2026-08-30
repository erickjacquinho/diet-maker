// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { closeDatabase, openDatabase } from '../src/db/client';

describe('database lease lifecycle', () => {
  it('keeps the lease until the database is closed', async () => {
    let closedAtRelease = false;
    const handle = await openDatabase({
      mode: 'test-memory',
      lock: {
        acquire: async () => ({
          release: async () => { closedAtRelease = handle.client.closed; },
        }),
      },
    });
    await closeDatabase(handle);
    expect(closedAtRelease).toBe(true);
  });

  it('closes an instance whose migration failed before releasing its lease', async () => {
    const client = new PGlite();
    await client.waitReady;
    await client.exec('CREATE TABLE __poc_migrations (id text PRIMARY KEY)');
    let closedAtRelease = false;
    try {
      await expect(openDatabase({
        mode: 'test-memory',
        client,
        lock: {
          acquire: async () => ({
            release: async () => { closedAtRelease = client.closed; },
          }),
        },
      })).rejects.toMatchObject({ code: 'MIGRATION_FAILED' });
      expect(closedAtRelease).toBe(true);
    } finally {
      if (!client.closed) await client.close();
    }
  });
});
