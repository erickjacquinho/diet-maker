import type { Account } from '@/lib/domain/account';

export interface AccountContextSnapshot {
  accountId: string;
  account: Account;
}

export interface AccountContext {
  getActive(): Promise<AccountContextSnapshot | null>;
  requireActive(): Promise<AccountContextSnapshot>;
}

export interface AccountContextRepository {
  getActiveOrCreate(): Promise<Account>;
}
