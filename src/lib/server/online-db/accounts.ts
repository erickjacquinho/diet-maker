import 'server-only';

import { sql } from 'drizzle-orm';
import { getOnlineDatabase } from './client';
import { uuidPattern } from './repository';

export type AccountTransaction = Parameters<Parameters<ReturnType<typeof getOnlineDatabase>['transaction']>[0]>[0];

function assertUuid(value: string, label: string): void {
  if (!uuidPattern.test(value)) throw new TypeError(`A valid ${label} is required.`);
}

export async function withAccountTransaction<T>(
  accountId: string,
  run: (transaction: AccountTransaction) => Promise<T>,
): Promise<T> {
  assertUuid(accountId, 'account id');
  return getOnlineDatabase().transaction(async (transaction) => {
    await transaction.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    return run(transaction);
  });
}

export async function resolveOrCreateAccount(userId: string): Promise<{ id: string; ownerUserId: string }> {
  assertUuid(userId, 'user id');
  return getOnlineDatabase().transaction(async (transaction) => {
    await transaction.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
    await transaction.execute(
      sql`INSERT INTO app.accounts (owner_user_id) VALUES (${userId}) ON CONFLICT (owner_user_id) DO NOTHING`,
    );
    const { rows } = await transaction.execute<{ id: string; owner_user_id: string }>(
      sql`SELECT id, owner_user_id FROM app.accounts WHERE owner_user_id = ${userId}`,
    );
    const [row] = rows;
    if (!row) throw new Error('The account was not resolved.');
    return { id: row.id, ownerUserId: row.owner_user_id };
  });
}
