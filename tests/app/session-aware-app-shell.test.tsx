import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  pathname: '/pacientes',
  snapshot: { status: 'empty', authorizationExpiresAt: null, syncState: 'unbound', account: null, accountId: null, runtime: null, fileName: null, error: null } as Record<string, unknown>,
  replace: vi.fn(),
  sync: vi.fn(),
  signOut: vi.fn(async () => undefined),
  signOutBrowserAccount: vi.fn(async () => undefined),
  restoreActiveProfile: vi.fn(),
  onResume: vi.fn(),
  retryLockedSave: vi.fn(async () => undefined),
  schedulerAccountIds: [] as Array<string | null>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => testState.pathname,
  useRouter: () => ({ replace: testState.replace }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  signOutBrowserAccount: testState.signOutBrowserAccount,
  getBrowserProfileSession: () => ({
    getSnapshot: () => testState.snapshot,
    subscribe: (listener: () => void) => {
      void listener;
      return () => undefined;
    },
    sync: testState.sync,
    signOut: testState.signOut,
    onResume: testState.onResume,
    retryLockedSave: testState.retryLockedSave,
  }),
}));

vi.mock('@/app/AgendaReminderScheduler', () => ({
  AgendaReminderScheduler: ({ accountId }: { accountId: string | null }) => {
    testState.schedulerAccountIds.push(accountId);
    return null;
  },
}));

vi.mock('@/app/navigation/SidebarNavigationAdapter', () => ({
  SidebarNavigationAdapter: ({ onSignOut }: { onSignOut?: () => void | Promise<void> }) => (
    <aside data-testid="session-sidebar"><button onClick={() => void onSignOut?.()}>Sair</button></aside>
  ),
}));

import { SessionAwareAppShell } from '@/app/SessionAwareAppShell';
import { useEffect } from 'react';

describe('SessionAwareAppShell', () => {
  beforeEach(() => {
    testState.pathname = '/pacientes';
    testState.snapshot = { status: 'empty', authorizationExpiresAt: null, syncState: 'unbound', account: null, accountId: null, runtime: null, fileName: null, hydration: 'pending', error: null };
    testState.replace.mockReset();
    testState.sync.mockReset();
    testState.signOut.mockReset();
    testState.signOutBrowserAccount.mockReset();
    testState.restoreActiveProfile.mockReset();
    testState.onResume.mockReset();
    testState.retryLockedSave.mockReset();
    testState.schedulerAccountIds.length = 0;
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: null, profileComplete: false }, { status: 401 })));
  });

  it('redirects an unauthenticated internal route to login before rendering clinical content', async () => {
    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(screen.queryByTestId('internal-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('session-sidebar')).not.toBeInTheDocument();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/login'));
    expect(testState.restoreActiveProfile).not.toHaveBeenCalled();
  });

  it('routes a completed account from Home to the dashboard when no file/runtime is active', async () => {
    testState.pathname = '/home';
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));

    render(<SessionAwareAppShell><div data-testid="onboarding">Onboarding</div></SessionAwareAppShell>);

    expect(screen.queryByTestId('onboarding')).not.toBeInTheDocument();
    expect(screen.queryByTestId('session-sidebar')).not.toBeInTheDocument();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('keeps the dashboard visible with an active file and redirects Home to the dashboard', async () => {
    testState.snapshot = { status: 'active', authorizationExpiresAt: null, syncState: 'synced', account: { displayName: 'Jacques Regiani' }, accountId: 'account-1', runtime: {}, fileName: 'profile.nutridiet', error: null };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));

    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    await waitFor(() => expect(screen.getByTestId('internal-content')).toBeInTheDocument());
    expect(screen.getByTestId('session-sidebar')).toBeInTheDocument();

    testState.pathname = '/home';
    render(<SessionAwareAppShell><div data-testid="home-content">Home</div></SessionAwareAppShell>);
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('renders the dashboard shell for a complete account without a file', async () => {
    testState.pathname = '/dashboard';
    testState.snapshot = { status: 'empty', authorizationExpiresAt: null, syncState: 'unbound', account: null, accountId: 'stale-local-account', runtime: null, fileName: null, error: null };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));

    render(<SessionAwareAppShell><div data-testid="dashboard-content">Dashboard sem arquivo</div></SessionAwareAppShell>);

    await waitFor(() => expect(screen.getByTestId('dashboard-content')).toBeInTheDocument());
    expect(screen.getByTestId('session-sidebar')).toBeInTheDocument();
    expect(testState.replace).not.toHaveBeenCalled();
    expect(testState.schedulerAccountIds.at(-1)).toBeNull();
  });

  it('keeps the dashboard visible when an authorized file is already active', async () => {
    testState.pathname = '/dashboard';
    testState.snapshot = { status: 'active', authorizationExpiresAt: null, syncState: 'synced', account: { displayName: 'Ana Lima' }, accountId: 'local-account', runtime: { account: { id: 'local-account' } }, fileName: 'profile.nutridiet', error: null };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));

    render(<SessionAwareAppShell><div data-testid="dashboard-content">Dashboard com arquivo</div></SessionAwareAppShell>);

    await waitFor(() => expect(screen.getByTestId('dashboard-content')).toBeInTheDocument());
    expect(testState.replace).not.toHaveBeenCalled();
    expect(testState.schedulerAccountIds.at(-1)).toBe('local-account');
  });

  it('sends a clinical module without an authorized file back to the dashboard', async () => {
    testState.pathname = '/pacientes';
    testState.snapshot = { status: 'empty', authorizationExpiresAt: null, syncState: 'unbound', account: null, accountId: null, runtime: null, fileName: null, error: null };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));

    render(<SessionAwareAppShell><div data-testid="clinical-content">Paciente</div></SessionAwareAppShell>);

    expect(screen.queryByTestId('clinical-content')).not.toBeInTheDocument();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('preserves a paused runtime inside the app shell without restoring a file automatically', async () => {
    testState.snapshot = { status: 'paused', authorizationExpiresAt: null, syncState: 'paused', account: { displayName: 'Jacques Regiani' }, accountId: 'account-1', runtime: {}, fileName: 'profile.nutridiet', error: 'Permissão de escrita necessária.' };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));

    render(<SessionAwareAppShell><div data-testid="paused-content">Trabalho em memória</div></SessionAwareAppShell>);

    await waitFor(() => expect(screen.getByTestId('paused-content')).toBeInTheDocument());
    expect(screen.getByTestId('session-sidebar')).toBeInTheDocument();
    expect(testState.restoreActiveProfile).not.toHaveBeenCalled();
  });

  it('preserves the clinical workspace before revoking the online account session', async () => {
    testState.snapshot = { status: 'active', authorizationExpiresAt: null, syncState: 'synced', account: { displayName: 'Nome clínico' }, accountId: 'account-1', runtime: {}, fileName: 'profile.nutridiet', error: null };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));
    render(<SessionAwareAppShell><div data-testid="clinical-content">Pacientes</div></SessionAwareAppShell>);

    await waitFor(() => expect(screen.getByTestId('clinical-content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(testState.signOutBrowserAccount).toHaveBeenCalledOnce());
    expect(testState.signOut).toHaveBeenCalledOnce();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/login'));
  });

  it('hides the clinical tree and offers a local-draft retry while a locked runtime is being preserved', () => {
    testState.snapshot = {
      status: 'locked', authorizationExpiresAt: null, syncState: 'paused',
      account: { displayName: 'Jacques Regiani' }, accountId: 'account-1', runtime: {},
      fileName: 'profile.nutridiet', error: 'O rascunho local mudou durante a preservação.',
    };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));

    render(<SessionAwareAppShell><div data-testid="clinical-content">Paciente e dieta</div></SessionAwareAppShell>);

    expect(screen.getByRole('alert')).toHaveTextContent('O save está bloqueado.');
    const hiddenClinicalTree = screen.getByTestId('clinical-content').closest('[hidden]');
    expect(hiddenClinicalTree).toHaveAttribute('hidden');
    expect(hiddenClinicalTree).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Tentar preservar rascunho' })).toBeInTheDocument();
  });

  it('keeps the same editor mounted while a failed preservation waits for retry', async () => {
    const unmount = vi.fn();
    const mount = vi.fn();
    function Editor() {
      useEffect(() => { mount(); return unmount; }, []);
      return <input aria-label="Pending clinical edit" defaultValue="Unsaved latest edit" />;
    }
    testState.snapshot = { status: 'active', authorizationExpiresAt: null, syncState: 'synced', account: { displayName: 'Conta' }, accountId: 'account-1', runtime: {}, fileName: 'profile.nutridiet', error: null };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));
    const { rerender } = render(<SessionAwareAppShell><Editor /></SessionAwareAppShell>);
    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    const input = screen.getByRole('textbox');
    testState.snapshot = { ...testState.snapshot, status: 'locked', syncState: 'paused', error: 'Transient flush failure' };
    rerender(<SessionAwareAppShell><Editor /></SessionAwareAppShell>);
    expect(unmount).not.toHaveBeenCalled();
    expect(mount).toHaveBeenCalledOnce();
    expect(input).toHaveValue('Unsaved latest edit');
    expect(input.closest('[hidden]')).toHaveAttribute('inert');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar preservar rascunho' }));
    expect(testState.retryLockedSave).toHaveBeenCalledOnce();
  });

  it('retries a pending checkpoint after a pathname change without waiting for the write', async () => {
    testState.snapshot = { status: 'active', authorizationExpiresAt: null, syncState: 'pending', account: { displayName: 'Jacques Regiani' }, accountId: 'account-1', runtime: {}, fileName: 'profile.nutridiet', error: null };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));
    let finishSync: () => void = () => undefined;
    const pendingSync = new Promise<void>((resolve) => { finishSync = resolve; });
    testState.sync.mockReturnValueOnce(pendingSync);
    const { rerender } = render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(testState.sync).not.toHaveBeenCalled();
    testState.pathname = '/receitas';
    rerender(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    await waitFor(() => expect(testState.sync).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByTestId('internal-content')).toBeInTheDocument());
    finishSync();
    await pendingSync;
  });
});
