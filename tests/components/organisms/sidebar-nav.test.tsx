import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarNav, SidebarNavComponent } from '@/components/organisms/SidebarNav';
import { sidebarNestedPatientPathname, sidebarProductionRoutes } from './sidebar-navigation-fixtures';

function renderSidebar(
  props: Partial<React.ComponentProps<typeof SidebarNav>> = {},
) {
  return render(
    <SidebarNav
      pathname="/pacientes"
      navigationItems={sidebarProductionRoutes}
      {...props}
    />,
  );
}

describe('SidebarNav preservation contract', () => {
  it('keeps all seven current destinations reachable in the documented order', () => {
    renderSidebar();

    expect(
      within(screen.getByRole('navigation', { name: /principal/ }))
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
  });

  it.each([
    ['/dashboard', 'Início'],
    [sidebarNestedPatientPathname, 'Pacientes'],
    ['/agenda/semana', 'Agenda'],
    ['/presets/novo', 'Dietas prontas'],
    ['/refeicoes/lista', 'Refeições'],
    ['/receitas/1', 'Receitas'],
    ['/alimentos', 'Alimentos'],
    ['/alimentos/tabela', 'Alimentos'],
  ])('marks the matching destination current for %s', (pathname, label) => {
    renderSidebar({ pathname });

    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not mark an unrelated destination current', () => {
    renderSidebar({ pathname: '/unknown' });

    expect(screen.queryByRole('link', { current: 'page' })).toBeNull();
  });

  it('keeps only account actions in the profile menu', () => {
    const onOpenAccount = vi.fn();
    const onSignOut = vi.fn();
    renderSidebar({
      doctorName: 'Dr. Ana',
      doctorRole: 'Nutricionista clínica',
      onOpenAccount,
      onSignOut,
    });

    expect(screen.getByRole('link', { name: /NutriDiet/ })).toHaveAttribute('href', '/pacientes');
    expect(screen.getByText('Dr. Ana')).toBeInTheDocument();
    expect(screen.getByText('Nutricionista clínica')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Dr. Ana' }), { button: 0 });
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent?.trim())).toEqual([
      'Configurações',
      'Sair',
    ]);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Configurações' }));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Dr. Ana' }), { button: 0 });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('preserves collapsed labels, tooltips and the visible toggle transition', () => {
    renderSidebar({ initialCollapsed: true });

    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'collapsed');
    expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Alimentos' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expandir Menu' }));
    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'expanded');
    expect(screen.getByRole('button', { name: 'Recolher Menu' })).toBeInTheDocument();
  });

  it.each([
    ['pending', 'Alterações locais pendentes', 'Salvar alterações'],
    ['paused', 'Sincronização pausada', 'Reautorizar arquivo'],
  ] as const)('keeps global profile recovery for %s state', (state, message, action) => {
    const onRetryProfileSync = vi.fn(async () => undefined);
    renderSidebar({ profileSyncState: state, onRetryProfileSync });

    expect(screen.getByRole('status')).toHaveTextContent(message);
    fireEvent.click(screen.getByRole('button', { name: action }));
    expect(onRetryProfileSync).toHaveBeenCalledTimes(1);
  });

  it('keeps the public compound component parts available', () => {
    expect(SidebarNavComponent.Brand).toBeDefined();
    expect(SidebarNavComponent.Item).toBeDefined();
    expect(SidebarNavComponent.UserProfile).toBeDefined();
    expect(SidebarNavComponent.QuickActions).toBeDefined();
  });
});
