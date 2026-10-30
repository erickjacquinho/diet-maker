import type { Account } from '@/lib/domain/account';

export type ProfileSessionStatus = 'empty' | 'busy' | 'active';
export type ProfileSessionHydrationState = 'pending' | 'ready';

export interface ProfileSessionRuntime {
  readonly account: Account;
}

export interface ProfileSessionSnapshot<TRuntime extends ProfileSessionRuntime> {
  status: ProfileSessionStatus;
  account: Account | null;
  accountId: string | null;
  runtime: TRuntime | null;
  hydration: ProfileSessionHydrationState;
  error: string | null;
}

/**
 * The signed-in account and its application runtime. Every record lives in the account on the server,
 * so there is nothing to open, lock or preserve: once the account session is valid the runtime opens by itself.
 */
export interface ProfileSession<TRuntime extends ProfileSessionRuntime> {
  getSnapshot(): ProfileSessionSnapshot<TRuntime>;
  subscribe(listener: (snapshot: ProfileSessionSnapshot<TRuntime>) => void): () => void;
  /** Whether the account data is open and screens may read and write it. */
  isReady(): boolean;
  loadProfile(): Promise<void>;
  signOut(): Promise<void>;
  /** Sends pending preference changes (favorites, agenda) to the account. */
  sync(): Promise<void>;
}
