'use client';

import type { ReactNode } from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarNavigationAdapter } from '@/app/navigation/SidebarNavigationAdapter';
import { getBrowserProfileSession } from '@/lib/application/browser-composition';
import { AppLayoutShell } from '@/components/templates';

const ONBOARDING_ROUTE = '/home';
const DEFAULT_INTERNAL_ROUTE = '/pacientes';

export interface SessionAwareAppShellProps {
  children: ReactNode;
}

export function SessionAwareAppShell({ children }: SessionAwareAppShellProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const session = getBrowserProfileSession();
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const isOnboarding = pathname === ONBOARDING_ROUTE;
  const hasUsableSession = snapshot.status === 'active' || snapshot.status === 'paused' || Boolean(snapshot.runtime);
  const isHydrating = snapshot.hydration === 'pending';

  useEffect(() => {
    if (typeof session.restoreActiveProfile !== 'function') return;
    void session.restoreActiveProfile().catch(() => undefined);
  }, [session]);

  useEffect(() => {
    if (isHydrating) return;
    if (isOnboarding) {
      if (hasUsableSession) router.replace(DEFAULT_INTERNAL_ROUTE);
      return;
    }
    if (!hasUsableSession) router.replace(ONBOARDING_ROUTE);
  }, [hasUsableSession, isHydrating, isOnboarding, pathname, router]);

  const handleSignOut = async (): Promise<void> => {
    await session.signOut();
    router.replace(ONBOARDING_ROUTE);
  };

  if (isOnboarding) {
    if (hasUsableSession) {
      return <div role="status" aria-live="polite" data-session-gate="redirecting" />;
    }
    return <>{children}</>;
  }

  if (!hasUsableSession) {
    if (isHydrating) {
      return (
        <div role="status" aria-live="polite" data-session-gate="restoring">
          Restaurando o último save…
        </div>
      );
    }
    return (
      <div role="status" aria-live="polite" data-session-gate="redirecting">
        Preparando o onboarding do profile…
      </div>
    );
  }

  return <AppLayoutShell sidebar={<SidebarNavigationAdapter onSignOut={handleSignOut} />}>{children}</AppLayoutShell>;
}
