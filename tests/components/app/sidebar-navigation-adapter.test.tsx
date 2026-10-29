import { readFileSync } from 'node:fs';

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({ pathname: '/pacientes' }));
const profileSnapshot = vi.hoisted(() => ({
  status: 'empty', authorizationExpiresAt: null, syncState: 'unbound',
  account: null, accountId: null, runtime: null, fileName: null,
  hydration: 'ready', resumeFileName: null, error: null, protectedCopyRequired: false,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => routeState.pathname,
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserProfileSession: () => ({
    subscribe: () => () => undefined,
    getSnapshot: () => profileSnapshot,
  }),
  getBrowserPatientRuntime: vi.fn(),
}));

import { SidebarNavigationAdapter } from '@/app/navigation/SidebarNavigationAdapter';

describe('SidebarNavigationAdapter boundary', () => {
  it('supplies the application pathname and six production destinations to SidebarNav', () => {
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
      '/pacientes',
      '/agenda',
      '/presets',
      '/refeicoes',
      '/receitas',
      '/alimentos',
    ]);
  });

  it('keeps route context out of the SidebarNav organism', () => {
    const source = readFileSync('src/components/organisms/SidebarNav.tsx', 'utf8');

    expect(source).not.toContain("from 'next/navigation'");
    expect(source).not.toContain('usePathname');
  });

  it.each([false, true])('opens empty settings and restores focus (collapsed=%s)', async (initialCollapsed) => {
    render(<SidebarNavigationAdapter initialCollapsed={initialCollapsed} />);
    const trigger = screen.getByRole('button', { name: /^Abrir menu de conta/ });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    try {
      act(() => trigger.focus());
      fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' });
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Configurações' }));

      const dialog = await screen.findByRole('dialog', { name: 'Configurações' });
      expect(within(dialog).getByRole('heading', { name: 'Configurações' })).toBeInTheDocument();
      expect(within(dialog).getAllByRole('button')).toHaveLength(1);
      expect(dialog.querySelector('input, select, textarea, form, [role="tablist"]')).toBeNull();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());

      fireEvent.pointerDown(trigger, { button: 0 });
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Configurações' }));
      fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Fechar' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(routeState.pathname).toBe('/pacientes');
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('preserves an explicit account action supplied by a consumer', async () => {
    const onOpenAccount = vi.fn();
    render(<SidebarNavigationAdapter onOpenAccount={onOpenAccount} />);

    fireEvent.pointerDown(screen.getByRole('button', { name: /^Abrir menu de conta/ }), { button: 0 });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Configurações' }));

    expect(onOpenAccount).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
