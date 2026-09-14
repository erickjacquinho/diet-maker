// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';

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
});
