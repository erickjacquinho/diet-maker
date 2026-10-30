import type { Account } from '@/lib/domain/account';
import {
  type ProfileSession,
  type ProfileSessionRuntime,
  type ProfileSessionSnapshot,
} from './profile-session';

export interface OnlineProfileSessionDependencies<TRuntime extends ProfileSessionRuntime & { readonly account: Account }> {
  /** The signed-in account, taken from the server session (never from a local file). */
  loadAccount(): Promise<Account>;
  createRuntime(account: Account): Promise<TRuntime>;
  activateRuntime(runtime: TRuntime): void;
  disposeRuntime(runtime: TRuntime): Promise<void>;
  /** Sends pending preference changes (favorites, agenda) to the account. */
  sync?(): Promise<void>;
}

/** Opens the signed-in account's data once and keeps it for the session; every write goes straight to the server. */
export function createOnlineProfileSession<TRuntime extends ProfileSessionRuntime & { readonly account: Account }>(
  dependencies: OnlineProfileSessionDependencies<TRuntime>,
): ProfileSession<TRuntime> {
  const listeners = new Set<(snapshot: ProfileSessionSnapshot<TRuntime>) => void>();
  let snapshot: ProfileSessionSnapshot<TRuntime> = {
    status: 'empty', account: null, accountId: null, runtime: null, hydration: 'pending', error: null,
  };
  let loading: Promise<void> | null = null;

  function update(next: Partial<ProfileSessionSnapshot<TRuntime>>): void {
    snapshot = { ...snapshot, ...next };
    for (const listener of listeners) listener(snapshot);
  }

  async function loadProfile(): Promise<void> {
    if (snapshot.runtime) return;
    loading ??= (async () => {
      update({ status: 'busy', error: null });
      try {
        const account = await dependencies.loadAccount();
        const runtime = await dependencies.createRuntime(account);
        dependencies.activateRuntime(runtime);
        update({ status: 'active', account: runtime.account, accountId: runtime.account.id, runtime, hydration: 'ready' });
      } catch (error) {
        update({ status: 'empty', hydration: 'ready', error: error instanceof Error ? error.message : 'Não foi possível abrir sua conta.' });
        throw error;
      } finally {
        loading = null;
      }
    })();
    return loading;
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    isReady: () => snapshot.runtime !== null && snapshot.status === 'active',
    loadProfile,
    async signOut() {
      const runtime = snapshot.runtime;
      update({ status: 'empty', runtime: null, account: null, accountId: null, error: null });
      if (runtime) await dependencies.disposeRuntime(runtime);
    },
    async sync() {
      await dependencies.sync?.();
    },
  };
}
