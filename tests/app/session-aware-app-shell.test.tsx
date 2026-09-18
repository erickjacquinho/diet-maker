import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  pathname: '/pacientes',
  snapshot: { status: 'empty', syncState: 'unbound', account: null, accountId: null, runtime: null, fileName: null, error: null } as Record<string, unknown>,
  replace: vi.fn(),
  sync: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => testState.pathname,
  useRouter: () => ({ replace: testState.replace }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserProfileSession: () => ({
    getSnapshot: () => testState.snapshot,
    subscribe: (listener: () => void) => {
      void listener;
      return () => undefined;
    },
    sync: testState.sync,
  }),
}));

vi.mock('@/app/navigation/SidebarNavigationAdapter', () => ({
  SidebarNavigationAdapter: () => <aside data-testid="session-sidebar">Sidebar</aside>,
}));

import { SessionAwareAppShell } from '@/app/SessionAwareAppShell';

describe('SessionAwareAppShell', () => {
  beforeEach(() => {
    testState.pathname = '/pacientes';
    testState.snapshot = { status: 'empty', syncState: 'unbound', account: null, accountId: null, runtime: null, fileName: null, error: null };
    testState.replace.mockReset();
    testState.sync.mockReset();
  });

  it('redirects an internal route before rendering internal content without a session', async () => {
    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(screen.queryByTestId('internal-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('session-sidebar')).not.toBeInTheDocument();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/home'));
  });

  it('keeps Home public and without the sidebar while the session is empty', () => {
    testState.pathname = '/home';

    render(<SessionAwareAppShell><div data-testid="onboarding">Onboarding</div></SessionAwareAppShell>);

    expect(screen.getByTestId('onboarding')).toBeInTheDocument();
    expect(screen.queryByTestId('session-sidebar')).not.toBeInTheDocument();
  });

  it('renders the existing shell for active sessions and redirects Home to the default route', async () => {
    testState.snapshot = { status: 'active', syncState: 'synced', account: { displayName: 'Jacques Regiani' }, accountId: 'account-1', runtime: {}, fileName: 'profile.nutridiet', error: null };

    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(screen.getByTestId('internal-content')).toBeInTheDocument();
    expect(screen.getByTestId('session-sidebar')).toBeInTheDocument();

    testState.pathname = '/home';
    render(<SessionAwareAppShell><div data-testid="home-content">Home</div></SessionAwareAppShell>);
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/pacientes'));
  });

  it('retries a pending checkpoint after a pathname change without waiting for the write', async () => {
    testState.snapshot = { status: 'active', syncState: 'pending', account: { displayName: 'Jacques Regiani' }, accountId: 'account-1', runtime: {}, fileName: 'profile.nutridiet', error: null };
    let finishSync: () => void = () => undefined;
    const pendingSync = new Promise<void>((resolve) => { finishSync = resolve; });
    testState.sync.mockReturnValueOnce(pendingSync);
    const { rerender } = render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(testState.sync).not.toHaveBeenCalled();
    testState.pathname = '/receitas';
    rerender(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    await waitFor(() => expect(testState.sync).toHaveBeenCalledOnce());
    expect(screen.getByTestId('internal-content')).toBeInTheDocument();
    finishSync();
    await pendingSync;
  });
});
