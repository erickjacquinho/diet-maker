import type { Account } from '@/lib/domain/account';
import {
  ProfileSessionError,
  type CreateProfileInput,
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

const unsupported = (what: string) => new ProfileSessionError('SESSION_UNAVAILABLE', `${what} não existe no modo online: os dados ficam na sua conta.`);

/**
 * A {@link ProfileSession} for the 100% online model. There is no save file, grant or tab lock: once the account
 * session is valid the runtime opens by itself, every write goes straight to the server, and nothing needs preserving
 * when the session ends. The save-oriented operations of the interface are intentionally unsupported.
 */
export function createOnlineProfileSession<TRuntime extends ProfileSessionRuntime & { readonly account: Account }>(
  dependencies: OnlineProfileSessionDependencies<TRuntime>,
): ProfileSession<TRuntime> {
  const listeners = new Set<(snapshot: ProfileSessionSnapshot<TRuntime>) => void>();
  let snapshot: ProfileSessionSnapshot<TRuntime> = {
    status: 'empty', authorizationExpiresAt: null, syncState: 'synced', account: null, accountId: null, runtime: null,
    fileName: null, hydration: 'pending', resumeFileName: null, error: null, protectedCopyRequired: false,
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
        update({ status: 'active', account: runtime.account, accountId: runtime.account.id, runtime, hydration: 'ready', syncState: 'synced' });
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
    isSaveAuthorized: () => snapshot.runtime !== null && snapshot.status === 'active',
    onResume: () => undefined,
    registerPendingDraftFlush: () => () => undefined,
    retryLockedSave: async () => undefined,
    loadProfile,
    restoreActiveProfile: loadProfile,
    resumeProfile: loadProfile,
    async updateProfileDetails(input: CreateProfileInput) {
      if (!snapshot.runtime) throw unsupported('Editar o perfil sem uma conta aberta');
      const account = { ...snapshot.runtime.account, displayName: input.displayName.trim(), phone: input.phone ?? null, updatedAt: new Date().toISOString() };
      Object.assign(snapshot.runtime.account, account);
      update({ account: snapshot.runtime.account });
    },
    async signOut() {
      const runtime = snapshot.runtime;
      update({ status: 'empty', runtime: null, account: null, accountId: null, error: null });
      if (runtime) await dependencies.disposeRuntime(runtime);
    },
    async sync() {
      await dependencies.sync?.();
    },
    createProfile: async () => { throw unsupported('Criar um save'); },
    adoptLegacyProfile: async () => { throw unsupported('Adotar um perfil local'); },
    listPendingRegistrations: async () => [],
    resumePendingProfile: async () => { throw unsupported('Retomar um save pendente'); },
    openSave: async () => { throw unsupported('Abrir um save'); },
    locateSave: async () => { throw unsupported('Localizar um save'); },
  };
}
