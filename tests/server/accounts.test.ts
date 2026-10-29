import { randomUUID } from 'node:crypto';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const dialect = new PgDialect();
const statements: Array<{ sql: string; params: unknown[] }> = [];
const getOnlineDatabase = vi.fn();
let rowsToReturn: unknown[] = [];

const tx = {
  execute: vi.fn(async (query: SQL) => {
    statements.push(dialect.sqlToQuery(query));
    return { rows: rowsToReturn };
  }),
};
const transaction = vi.fn(async (run: (handle: typeof tx) => Promise<unknown>) => run(tx));

vi.mock('@/lib/server/online-db/client', () => ({
  getOnlineDatabase: () => getOnlineDatabase(),
}));

async function load() {
  return import('@/lib/server/online-db/accounts');
}

beforeEach(() => {
  statements.length = 0;
  rowsToReturn = [];
  tx.execute.mockClear();
  transaction.mockClear();
  getOnlineDatabase.mockReset();
  getOnlineDatabase.mockReturnValue({ transaction });
});

describe('accounts module (unit)', () => {
  it('rejects an invalid account id before obtaining the database', async () => {
    const { withAccountTransaction } = await load();
    await expect(withAccountTransaction('not-a-uuid', async () => 1)).rejects.toThrow(
      new TypeError('A valid account id is required.'),
    );
    expect(getOnlineDatabase).not.toHaveBeenCalled();
  });

  it('rejects an invalid user id before obtaining the database', async () => {
    const { resolveOrCreateAccount } = await load();
    await expect(resolveOrCreateAccount('')).rejects.toThrow(TypeError);
    expect(getOnlineDatabase).not.toHaveBeenCalled();
  });

  it('sets only app.account_id, transaction-locally, as the first command', async () => {
    const { withAccountTransaction } = await load();
    const accountId = randomUUID();
    const result = await withAccountTransaction(accountId, async (handle) => {
      expect(handle).toBe(tx);
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(statements[0].sql).toMatch(/set_config\(\s*'app\.account_id'/);
    expect(statements[0].sql).toMatch(/,\s*true\)/);
    expect(statements[0].params).toEqual([accountId]);
    expect(statements.map((entry) => entry.sql).join('\n')).not.toContain('app.user_id');
  });

  it('propagates the error of the callback unchanged', async () => {
    const { withAccountTransaction } = await load();
    const failure = new Error('boom');
    await expect(
      withAccountTransaction(randomUUID(), async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);
  });

  it('resolveOrCreateAccount sets only app.user_id and returns the account', async () => {
    const { resolveOrCreateAccount } = await load();
    const userId = randomUUID();
    const accountId = randomUUID();
    rowsToReturn = [{ id: accountId, owner_user_id: userId }];
    await expect(resolveOrCreateAccount(userId)).resolves.toEqual({ id: accountId, ownerUserId: userId });
    expect(statements[0].sql).toMatch(/set_config\(\s*'app\.user_id'/);
    expect(statements[0].sql).toMatch(/,\s*true\)/);
    expect(statements[0].params).toEqual([userId]);
    expect(statements.map((entry) => entry.sql).join('\n')).not.toContain('app.account_id');
  });

  it('resolveOrCreateAccount propagates a database error', async () => {
    const { resolveOrCreateAccount } = await load();
    const failure = new Error('violates foreign key constraint');
    tx.execute.mockRejectedValueOnce(failure);
    await expect(resolveOrCreateAccount(randomUUID())).rejects.toBe(failure);
  });
});
