'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { ProfileSessionSnapshot } from '@/lib/application/profile-session';
import { AgendaReminderScheduler } from '@/app/AgendaReminderScheduler';
import { SidebarNavigationAdapter } from '@/app/navigation/SidebarNavigationAdapter';
import { getBrowserProfileSession, type BrowserPatientRuntime } from '@/lib/application/browser-composition';
import { AppLayoutShell } from '@/components/templates';
import { Button } from '@/components/atoms';
import { toast } from 'sonner';
import { signOutBrowserAccount } from '@/lib/application/browser-composition';

const DEFAULT_INTERNAL_ROUTE = '/pacientes';
const SAVES_ROUTE = '/saves';
const HOME_ROUTE = '/home';
const PUBLIC_ROUTES = new Set(['/', '/login', '/criar-conta', '/recuperar-senha', '/redefinir-senha']);
const EMPTY_PROFILE_SNAPSHOT: ProfileSessionSnapshot<BrowserPatientRuntime> = {
  status: 'empty',
  authorizationExpiresAt: null,
  syncState: 'unbound',
  account: null,
  accountId: null,
  runtime: null,
  fileName: null,
  hydration: 'ready',
  resumeFileName: null,
  error: null,
  protectedCopyRequired: false,
};
const subscribeToNoProfile = () => () => undefined;
const getEmptyProfileSnapshot = () => EMPTY_PROFILE_SNAPSHOT;

type AccountGateState = 'checking' | 'anonymous' | 'profile-incomplete' | 'ready' | 'unavailable';

export interface SessionAwareAppShellProps {
  children: ReactNode;
}

function accountStateFrom(value: unknown): Exclude<AccountGateState, 'checking' | 'unavailable'> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'anonymous';
  const body = value as Record<string, unknown>;
  const user = body.user;
  if (!user || typeof user !== 'object' || Array.isArray(user) || typeof (user as Record<string, unknown>).id !== 'string') {
    return 'anonymous';
  }
  return body.profileComplete === true ? 'ready' : 'profile-incomplete';
}

export function SessionAwareAppShell({ children }: SessionAwareAppShellProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isSavesRoute = pathname === SAVES_ROUTE;
  const isHomeRoute = pathname === HOME_ROUTE;
  const session = isPublicRoute ? null : getBrowserProfileSession();
  const subscribe = session?.subscribe ?? subscribeToNoProfile;
  const getSnapshot = session?.getSnapshot ?? getEmptyProfileSnapshot;
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [accountGate, setAccountGate] = useState<AccountGateState>('checking');
  const previousPathname = useRef(pathname);
  const hasUsableSession = Boolean(snapshot.runtime) && ['active', 'paused', 'busy'].includes(snapshot.status);
  const isPreservingLockedSave = snapshot.status === 'locked' && Boolean(snapshot.runtime);

  useEffect(() => {
    if (isPublicRoute) {
      setAccountGate('checking');
      return;
    }
    let current = true;
    void fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const body: unknown = await response.json().catch(() => null);
        if (!current) return;
        if (response.status === 401) {
          setAccountGate('anonymous');
          return;
        }
        if (!response.ok) {
          setAccountGate('unavailable');
          return;
        }
        setAccountGate(accountStateFrom(body));
      })
      .catch(() => {
        if (current) setAccountGate('unavailable');
      });
    return () => { current = false; };
  }, [isPublicRoute]);

  useEffect(() => {
    if (isPublicRoute || !session || typeof snapshot.authorizationExpiresAt !== 'number') return;
    const handleResume = () => session.onResume();
    const delay = Math.max(0, snapshot.authorizationExpiresAt - Date.now());
    const timer = window.setTimeout(handleResume, delay);
    window.addEventListener('focus', handleResume);
    document.addEventListener('visibilitychange', handleResume);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', handleResume);
      document.removeEventListener('visibilitychange', handleResume);
    };
  }, [isPublicRoute, session, snapshot.authorizationExpiresAt]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (isPublicRoute || !session || !['pending', 'paused', 'syncing'].includes(snapshot.syncState)) return;
    void session.sync().catch(() => undefined);
  }, [isPublicRoute, pathname, session, snapshot.syncState]);

  useEffect(() => {
    if (isPublicRoute || isPreservingLockedSave || accountGate === 'checking' || accountGate === 'unavailable') return;
    if (accountGate === 'anonymous') {
      router.replace('/login');
      return;
    }
    if (accountGate === 'profile-incomplete') {
      if (pathname !== '/criar-conta') router.replace('/criar-conta?completar=1');
      return;
    }
    if (isHomeRoute) {
      router.replace(hasUsableSession ? DEFAULT_INTERNAL_ROUTE : SAVES_ROUTE);
      return;
    }
    if (isSavesRoute) {
      if (hasUsableSession) router.replace(DEFAULT_INTERNAL_ROUTE);
      return;
    }
    if (!hasUsableSession) router.replace(SAVES_ROUTE);
  }, [accountGate, hasUsableSession, isHomeRoute, isPreservingLockedSave, isPublicRoute, isSavesRoute, pathname, router]);

  const handleSignOut = async (): Promise<void> => {
    try {
      await session?.signOut();
      await signOutBrowserAccount();
      router.replace('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão da conta.');
    }
  };

  if (isPublicRoute) return <>{children}</>;
  const lockedGate = isPreservingLockedSave ? (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8" data-session-gate="locked">
        {snapshot.error ? (
          <div role="alert" className="max-w-container-reading rounded-control border border-warning-border bg-warning-soft p-4 text-style-body text-warning">
            O save está bloqueado. O rascunho local não foi preservado; tente novamente antes de sair.
          </div>
        ) : (
          <div role="status" aria-live="polite">O save expirou. Preservando o rascunho local antes de fechar a sessão…</div>
        )}
        {snapshot.error ? (
          <Button type="button" onClick={() => void session?.retryLockedSave().catch(() => undefined)}>
            Tentar preservar rascunho
          </Button>
        ) : null}
      </main>
  ) : null;
  if (!isPreservingLockedSave) {
  if (accountGate === 'checking') {
    return <div role="status" aria-live="polite" data-session-gate="checking">Verificando sua conta…</div>;
  }
  if (accountGate === 'unavailable') {
    return <div role="alert" data-session-gate="unavailable">Não foi possível validar sua conta. Recarregue a página.</div>;
  }
  if (accountGate !== 'ready') {
    return <div role="status" aria-live="polite" data-session-gate="redirecting">Encaminhando para o acesso da conta…</div>;
  }
  if (isHomeRoute) {
    return <div role="status" aria-live="polite" data-session-gate="redirecting">Abrindo seus saves…</div>;
  }
  if (isSavesRoute) {
    if (hasUsableSession) return <div role="status" aria-live="polite" data-session-gate="redirecting">Abrindo o save atual…</div>;
    return <>{children}</>;
  }
  if (!hasUsableSession) {
    return <div role="status" aria-live="polite" data-session-gate="redirecting">Selecione um save para continuar.</div>;
  }
  }

  return (
    <>
      {lockedGate}
      <div hidden={isPreservingLockedSave} aria-hidden={isPreservingLockedSave || undefined} inert={isPreservingLockedSave || undefined}>
      <AgendaReminderScheduler accountId={snapshot.accountId ?? snapshot.runtime?.account.id ?? null} />
      <AppLayoutShell sidebar={<SidebarNavigationAdapter onSignOut={handleSignOut} />}>
        {children}
      </AppLayoutShell>
      </div>
    </>
  );
}
