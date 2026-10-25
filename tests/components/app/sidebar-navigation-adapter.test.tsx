import { readFileSync } from 'node:fs';

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({ pathname: '/pacientes' }));
const profileSnapshot = vi.hoisted(() => ({
  status: 'empty', authorizationExpiresAt: null, syncState: 'unbound',
  account: null, accountId: null, runtime: null, fileName: null,
  hydration: 'ready', resumeFileName: null, error: null, protectedCopyRequired: false,
}));

const saveManagement = vi.hoisted(() => ({ overlayOpen: false, busy: false, content: null as any, dialogs: null as any }));

const professionalProfile = vi.hoisted(() => ({
  snapshot: {
    status: 'ready',
    accountEmail: 'ana@example.invalid',
    error: null,
    profile: {
      firstName: 'Ana', lastName: 'Souza', averagePatientsPerMonth: 40, experience: { kind: 'years', value: 5 },
      professionalTitle: 'Nutricionista esportiva', crn: 'CRN-3 12345', specialties: null, bio: null,
      contactEmail: null, phone: null, instagram: null, website: null, clinicName: null, city: null,
      state: null, serviceMode: null, showOnDocuments: true, agendaRemindersEnabled: true, documentLogo: null,
    },
  },
  load: vi.fn(async () => undefined),
  save: vi.fn(),
}));

vi.mock('@/lib/application/professional-profile-store', () => ({
  getBrowserProfessionalProfileStore: () => ({
    subscribe: () => () => undefined,
    getSnapshot: () => professionalProfile.snapshot,
    load: professionalProfile.load,
    save: professionalProfile.save,
    requestPasswordReset: vi.fn(async () => undefined),
    reset: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => routeState.pathname,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserProfileSession: () => ({
    subscribe: () => () => undefined,
    getSnapshot: () => profileSnapshot,
  }),
  getBrowserPatientRuntime: vi.fn(),
}));

vi.mock('@/app/navigation/useSaveManagement', () => ({
  useSaveManagement: () => saveManagement,
}));

import { SidebarNavigationAdapter } from '@/app/navigation/SidebarNavigationAdapter';

beforeEach(() => {
  routeState.pathname = '/pacientes';
  saveManagement.overlayOpen = false;
  saveManagement.busy = false;
  saveManagement.content = null;
  saveManagement.dialogs = null;
  profileSnapshot.status = 'empty';
});

describe('SidebarNavigationAdapter boundary', () => {
  it('supplies the application pathname and seven production destinations to SidebarNav', () => {
    render(<SidebarNavigationAdapter />);

    expect(screen.getByRole('link', { name: /Pacientes/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Agenda' })).toHaveAttribute(
      'href',
      '/agenda',
    );
    expect(
      within(screen.getByRole('navigation'))
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/dashboard',
      '/pacientes',
      '/agenda',
      '/presets',
      '/refeicoes',
      '/receitas',
      '/alimentos',
    ]);
    expect(
      within(screen.getByRole('navigation'))
        .getAllByRole('link')
        .map((link) => link.textContent?.trim()),
    ).toEqual(['Início', 'Pacientes', 'Agenda', 'Dietas prontas', 'Refeições', 'Receitas', 'Alimentos']);
  });

  it('keeps route context out of the SidebarNav organism', () => {
    const source = readFileSync('src/components/organisms/SidebarNav.tsx', 'utf8');

    expect(source).not.toContain("from 'next/navigation'");
    expect(source).not.toContain('usePathname');
  });

  it('shows the professional profile in the account trigger', () => {
    render(<SidebarNavigationAdapter />);

    expect(screen.getByRole('button', { name: 'Abrir menu de conta de Ana Souza' })).toHaveTextContent('Nutricionista esportiva');
    expect(professionalProfile.load).toHaveBeenCalled();
  });

  it.each([false, true])('opens profile and save settings and restores focus (collapsed=%s)', async (initialCollapsed) => {
    render(<SidebarNavigationAdapter initialCollapsed={initialCollapsed} />);
    const trigger = screen.getByRole('button', { name: /^Abrir menu de conta/ });

    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' });
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent?.trim())).toEqual([
      'Configurações',
      'Sair',
    ]);
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Configurações' }));

    const dialog = await screen.findByRole('dialog', { name: 'Configurações' });
    expect(within(dialog).getAllByRole('tab').map((tab) => tab.textContent?.trim())).toEqual(['Perfil profissional', 'Saves', 'Assinatura']);
    expect(within(dialog).getByLabelText(/^Nome/)).toHaveValue('Ana');
    expect(within(dialog).getByLabelText(/CRN/)).toHaveValue('CRN-3 12345');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.mouseDown(within(dialog).getByRole('tab', { name: 'Saves' }), { button: 0 });
    expect(await within(dialog).findByText('Nenhum save está aberto nesta sessão.')).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());

    fireEvent.pointerDown(trigger, { button: 0 });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Configurações' }));
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(routeState.pathname).toBe('/pacientes');
    expect(professionalProfile.save).not.toHaveBeenCalled();
  });

  it('preserves an explicit account action supplied by a consumer', async () => {
    const onOpenAccount = vi.fn();
    render(<SidebarNavigationAdapter onOpenAccount={onOpenAccount} />);

    fireEvent.pointerDown(screen.getByRole('button', { name: /^Abrir menu de conta/ }), { button: 0 });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Configurações' }));

    expect(onOpenAccount).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens subscription directly from its event and restores focus to the trigger', async () => {
    render(<SidebarNavigationAdapter />);
    const trigger = document.createElement('button');
    trigger.textContent = 'Gerenciar assinatura';
    document.body.append(trigger);
    trigger.focus();

    act(() => window.dispatchEvent(new Event('nutridiet:open-subscription')));

    const dialog = await screen.findByRole('dialog', { name: 'Configurações' });
    expect(within(dialog).getByRole('tab', { name: 'Assinatura' })).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).getByText('A gestão da assinatura estará disponível em breve.')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it.each(['busy', 'overlayOpen'] as const)('ignores the subscription event while %s', async (guard) => {
    const view = render(<SidebarNavigationAdapter />);
    const accountTrigger = screen.getByRole('button', { name: /^Abrir menu de conta/ });
    fireEvent.pointerDown(accountTrigger, { button: 0 });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Configurações' }));
    expect(await screen.findByRole('dialog', { name: 'Configurações' })).toBeInTheDocument();

    saveManagement[guard] = true;
    view.rerender(<SidebarNavigationAdapter />);
    act(() => window.dispatchEvent(new Event('nutridiet:open-subscription')));
    saveManagement[guard] = false;
    view.rerender(<SidebarNavigationAdapter />);

    const dialog = await screen.findByRole('dialog', { name: 'Configurações' });
    expect(within(dialog).getByRole('tab', { name: 'Perfil profissional' })).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).getByRole('tab', { name: 'Assinatura' })).toHaveAttribute('aria-selected', 'false');
  });
});
