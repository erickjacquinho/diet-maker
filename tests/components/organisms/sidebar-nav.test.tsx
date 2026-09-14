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
  it('keeps all six current destinations reachable in the documented order', () => {
    renderSidebar();

    expect(
      within(screen.getByRole('navigation', { name: /principal/ }))
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/pacientes',
      '/presets',
      '/refeicoes',
      '/receitas',
      '/alimentos',
      '/design-system',
    ]);
  });

  it.each([
    ['/design-system', '/design-system'],
    ['/design-system/tokens', '/design-system'],
    [sidebarNestedPatientPathname, '/pacientes'],
  ])('marks the matching destination current for %s', (pathname, href) => {
    renderSidebar({ pathname });

    expect(screen.getByRole('link', { name: new RegExp(href === '/pacientes' ? 'Pacientes' : 'Guia Design System') })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not mark an unrelated destination current', () => {
    renderSidebar({ pathname: '/unknown' });

    expect(screen.queryByRole('link', { current: 'page' })).toBeNull();
  });

  it('preserves brand, profile, account actions and optional callback safety', () => {
    const onExportBackup = vi.fn();
    const onRestoreBackup = vi.fn();
    renderSidebar({
      doctorName: 'Dr. Ana',
      doctorRole: 'Nutricionista clínica',
      onExportBackup,
      onRestoreBackup,
    });

    expect(screen.getByRole('link', { name: /NutriDiet/ })).toHaveAttribute('href', '/pacientes');
    expect(screen.getByText('Dr. Ana')).toBeInTheDocument();
    expect(screen.getByText('Nutricionista clínica')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Dr. Ana' }), { button: 0 });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Exportar backup' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Dr. Ana' }), { button: 0 });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Importar backup' }));
    expect(onExportBackup).toHaveBeenCalledTimes(1);
    expect(onRestoreBackup).toHaveBeenCalledTimes(1);

    expect(() => {
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Dr. Ana' }), { button: 0 });
      fireEvent.click(screen.getByRole('menuitem', { name: 'Exportar backup' }));
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Dr. Ana' }), { button: 0 });
      fireEvent.click(screen.getByRole('menuitem', { name: 'Importar backup' }));
    }).not.toThrow();
  });

  it('preserves collapsed labels, tooltips and the visible toggle transition', () => {
    renderSidebar({ initialCollapsed: true });

    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'collapsed');
    expect(screen.getByRole('link', { name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Planilha de Alimentos' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expandir Menu' }));
    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'expanded');
    expect(screen.getByRole('button', { name: 'Recolher Menu' })).toBeInTheDocument();
  });

  it('announces a paused profile save and exposes explicit reauthorization', () => {
    const onRetryProfileSync = vi.fn(async () => undefined);
    renderSidebar({ profileSyncState: 'paused', onRetryProfileSync });

    expect(screen.getByRole('status')).toHaveTextContent('Sincronização pausada');
    fireEvent.click(screen.getByRole('button', { name: 'Reautorizar arquivo' }));
    expect(onRetryProfileSync).toHaveBeenCalledTimes(1);
  });

  it('keeps the public compound component parts available', () => {
    expect(SidebarNavComponent.Brand).toBeDefined();
    expect(SidebarNavComponent.Item).toBeDefined();
    expect(SidebarNavComponent.UserProfile).toBeDefined();
    expect(SidebarNavComponent.QuickActions).toBeDefined();
  });
});
