// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';

import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

describe('local database runtime boundary', () => {
  it('opens a memory-only PGlite runtime without auto-creating an account', async () => {
    handle = await openLocalDatabase({ mode: 'memory', dataDir: `memory://session-client-${Date.now()}` });

    expect(handle.mode).toBe('memory');
    const result = await handle.client.query<{ count: number }>('SELECT count(*)::int AS count FROM accounts');
    expect(result.rows[0]?.count).toBe(0);
  });

  it('does not accept a host-persistent filesystem for a memory session', async () => {
    await expect(openLocalDatabase({ mode: 'memory', dataDir: 'idb://nutridiet-local-db-v1' })).rejects.toThrow();
  });

  it('reopens persistent IndexedDB workspaces and isolates stable account keys', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const accountA = `idb://nutridiet-${suffix}-account-a`;
    const accountB = `idb://nutridiet-${suffix}-account-b`;

    handle = await openLocalDatabase({ mode: 'persistent', dataDir: accountA });
    await handle.client.exec('CREATE TABLE workspace_probe (value text NOT NULL); INSERT INTO workspace_probe VALUES (\'account-a\');');
    await handle.close();
    handle = undefined;

    handle = await openLocalDatabase({ mode: 'persistent', dataDir: accountB });
    const accountBTables = await handle.client.query<{ tablename: string }>("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workspace_probe'");
    expect(accountBTables.rows).toEqual([]);
    await handle.client.exec('CREATE TABLE workspace_probe (value text NOT NULL); INSERT INTO workspace_probe VALUES (\'account-b\');');
    await handle.close();
    handle = undefined;

    handle = await openLocalDatabase({ mode: 'persistent', dataDir: accountA });
    const reopened = await handle.client.query<{ value: string }>('SELECT value FROM workspace_probe');
    expect(handle.mode).toBe('persistent');
    expect(reopened.rows).toEqual([{ value: 'account-a' }]);
  });

  it('creates local tables for checkpoint revisions and diet history summaries', async () => {
    handle = await openLocalDatabase({ mode: 'memory', dataDir: `memory://session-checkpoint-${Date.now()}` });

    const result = await handle.client.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('profile_checkpoint_state', 'diet_variation_history_summaries')
      ORDER BY table_name
    `);

    expect(result.rows.map(({ table_name }) => table_name)).toEqual([
      'diet_variation_history_summaries',
      'profile_checkpoint_state',
    ]);
  });
});
