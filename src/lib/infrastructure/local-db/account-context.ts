import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Account } from '@/lib/domain/account';
import { DEFAULT_OBJECTIVE_LABELS } from '@/lib/domain/objective-option';
import type { AccountContextRepository } from '@/lib/persistence/account-context';
import type { LocalDatabaseHandle } from './client';
import { accounts, objectiveOptions } from './schema';

const DEFAULT_ACCOUNT_ID = 'local-account';

export class LocalAccountContextRepository implements AccountContextRepository {
  constructor(private readonly handle: LocalDatabaseHandle) {}

  async getActiveOrCreate(): Promise<Account> {
    const existing = await this.handle.db.select().from(accounts).where(eq(accounts.id, DEFAULT_ACCOUNT_ID));
    if (existing[0]) return existing[0];

    const now = new Date().toISOString();
    const account = {
      id: DEFAULT_ACCOUNT_ID,
      displayName: 'Meu consultório',
      createdAt: now,
      updatedAt: now,
    } satisfies Account;

    await this.handle.db.transaction(async (tx) => {
      await tx.insert(accounts).values(account).onConflictDoNothing({ target: accounts.id });
      const seeded = await tx.select({ id: objectiveOptions.id }).from(objectiveOptions).where(eq(objectiveOptions.accountId, account.id));
      if (seeded.length === 0) {
        await tx.insert(objectiveOptions).values(DEFAULT_OBJECTIVE_LABELS.map((label) => ({
          id: nanoid(16),
          accountId: account.id,
          label,
          normalizedLabel: label.toLocaleLowerCase('pt-BR'),
          origin: 'SYSTEM' as const,
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        })));
      }
    });

    const current = await this.handle.db.select().from(accounts).where(eq(accounts.id, DEFAULT_ACCOUNT_ID));
    if (!current[0]) throw new Error('A Conta local não pôde ser criada.');
    return current[0];
  }
}
