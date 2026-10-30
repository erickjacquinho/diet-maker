import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  pathname: '/pacientes',
  snapshot: { status: 'empty', account: null, accountId: null, runtime: null, hydration: 'pending', error: null } as Record<string, unknown>,
  replace: vi.fn(),
  signOut: vi.fn(async () => undefined),
  signOutBrowserAccount: vi.fn(async () => undefined),
  loadProfile: vi.fn(async () => undefined),
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
    signOut: testState.signOut,
    loadProfile: testState.loadProfile,
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

const signedIn = () => vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: true })));
const openAccount = (accountId = 'owner') => ({
  status: 'active', account: { displayName: 'Dra. Ana' }, accountId, runtime: { account: { id: accountId } }, hydration: 'ready', error: null,
});

describe('SessionAwareAppShell', () => {
  beforeEach(() => {
    testState.pathname = '/pacientes';
    testState.snapshot = { status: 'empty', account: null, accountId: null, runtime: null, hydration: 'pending', error: null };
    testState.replace.mockReset();
    testState.signOut.mockReset();
    testState.signOutBrowserAccount.mockReset();
    testState.loadProfile.mockClear();
    testState.schedulerAccountIds.length = 0;
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: null, profileComplete: false }, { status: 401 })));
  });

  it('redirects an unauthenticated internal route to login before rendering clinical content', async () => {
    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(screen.queryByTestId('internal-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('session-sidebar')).not.toBeInTheDocument();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/login'));
    expect(testState.loadProfile).not.toHaveBeenCalled();
  });

  it('sends an account with an incomplete profile to finish the registration', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ user: { id: 'owner' }, profileComplete: false })));

    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/criar-conta?completar=1'));
    expect(screen.queryByTestId('internal-content')).not.toBeInTheDocument();
  });

  it.each(['/home', '/saves'])('sends the removed %s screen to the dashboard', async (pathname) => {
    testState.pathname = pathname;
    signedIn();

    render(<SessionAwareAppShell><div data-testid="removed">Removida</div></SessionAwareAppShell>);

    expect(screen.queryByTestId('removed')).not.toBeInTheDocument();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/dashboard'));
  });

  it('opens the account by itself and keeps a deep link instead of bouncing to the dashboard', async () => {
    signedIn();
    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(await screen.findByText('Abrindo sua conta…')).toBeInTheDocument();
    await waitFor(() => expect(testState.loadProfile).toHaveBeenCalledOnce());
    expect(testState.replace).not.toHaveBeenCalled();
    expect(screen.queryByTestId('internal-content')).not.toBeInTheDocument();
  });

  it('shows the module and the reminder scheduler once the account runtime is available', async () => {
    signedIn();
    testState.snapshot = openAccount();

    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(await screen.findByTestId('internal-content')).toBeInTheDocument();
    expect(screen.getByTestId('session-sidebar')).toBeInTheDocument();
    expect(testState.loadProfile).not.toHaveBeenCalled();
    expect(testState.replace).not.toHaveBeenCalled();
    expect(testState.schedulerAccountIds.at(-1)).toBe('owner');
  });

  it('explains a failed open and retries on request', async () => {
    signedIn();
    testState.snapshot = { status: 'empty', account: null, accountId: null, runtime: null, hydration: 'ready', error: 'sem rede' };

    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(await screen.findByRole('alert')).toHaveTextContent('sem rede');
    expect(testState.loadProfile).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(testState.loadProfile).toHaveBeenCalledOnce();
  });

  it('closes the account runtime before revoking the session on sign out', async () => {
    signedIn();
    testState.snapshot = openAccount();
    render(<SessionAwareAppShell><div data-testid="clinical-content">Pacientes</div></SessionAwareAppShell>);

    await waitFor(() => expect(screen.getByTestId('clinical-content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(testState.signOutBrowserAccount).toHaveBeenCalledOnce());
    expect(testState.signOut).toHaveBeenCalledOnce();
    await waitFor(() => expect(testState.replace).toHaveBeenCalledWith('/login'));
  });

  it('tells the user when the account cannot be validated', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })));

    render(<SessionAwareAppShell><div data-testid="internal-content">Pacientes</div></SessionAwareAppShell>);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível validar sua conta.');
    expect(screen.queryByTestId('internal-content')).not.toBeInTheDocument();
  });
});
