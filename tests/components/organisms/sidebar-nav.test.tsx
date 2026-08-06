import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({ pathname: '/pacientes' }));

vi.mock('next/navigation', () => ({
  usePathname: () => routeState.pathname,
}));

import { SidebarNav, SidebarNavComponent } from '@/components/organisms/SidebarNav';

describe('SidebarNav preservation contract', () => {
  afterEach(() => {
    routeState.pathname = '/pacientes';
  });

  it('keeps all six current destinations reachable in the documented order', () => {
    render(<SidebarNav />);

    expect(
      screen
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
        .filter((href) => href !== '/pacientes'),
    ).toEqual([
      '/presets',
      '/refeicoes-prontas',
      '/receitas',
      '/alimentos',
      '/design-system',
    ]);
    expect(screen.getByRole('link', { name: /Pacientes/ })).toHaveAttribute('href', '/pacientes');
  });

  it.each([
    ['/design-system', '/design-system'],
    ['/design-system/tokens', '/design-system'],
    ['/pacientes/123/dieta/1', '/pacientes'],
  ])('marks the matching destination current for %s', (pathname, href) => {
    routeState.pathname = pathname;
    render(<SidebarNav />);

    expect(screen.getByRole('link', { name: new RegExp(href === '/pacientes' ? 'Pacientes' : 'Guia Design System') })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not mark an unrelated destination current', () => {
    routeState.pathname = '/unknown';
    render(<SidebarNav />);

    expect(screen.queryByRole('link', { current: 'page' })).toBeNull();
  });

  it('preserves brand, profile, quick actions and optional callback safety', () => {
    const onSave = vi.fn();
    const onOpen = vi.fn();
    render(<SidebarNav doctorName="Dr. Ana" doctorRole="Nutricionista clínica" onSave={onSave} onOpen={onOpen} />);

    expect(screen.getByRole('link', { name: /NutriDiet/ })).toHaveAttribute('href', '/pacientes');
    expect(screen.getByText('Dr. Ana')).toBeInTheDocument();
    expect(screen.getByText('Nutricionista clínica')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
      fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    }).not.toThrow();
  });

  it('preserves collapsed labels, tooltips and the visible toggle transition', () => {
    render(<SidebarNav initialCollapsed />);

    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'collapsed');
    expect(screen.getByRole('link', { name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Planilha de Alimentos' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expandir Menu' }));
    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'expanded');
    expect(screen.getByRole('button', { name: 'Recolher Menu' })).toBeInTheDocument();
  });

  it('keeps the public compound component parts available', () => {
    expect(SidebarNavComponent.Brand).toBeDefined();
    expect(SidebarNavComponent.Item).toBeDefined();
    expect(SidebarNavComponent.UserProfile).toBeDefined();
    expect(SidebarNavComponent.QuickActions).toBeDefined();
  });
});
