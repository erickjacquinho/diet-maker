import { fireEvent, render, screen } from '@testing-library/react';
import { BookOpen, Palette } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({ pathname: '/pacientes' }));

vi.mock('next/navigation', () => ({
  usePathname: () => routeState.pathname,
}));

import { SidebarNav } from '@/components/organisms/SidebarNav';
import type { SidebarGroupItem } from '@/components/organisms/sidebar-navigation-model';

const libraryGroup: SidebarGroupItem = {
  kind: 'group',
  id: 'library',
  label: 'Biblioteca',
  icon: BookOpen,
  defaultOpen: false,
  children: [
    {
      kind: 'route',
      href: '/biblioteca/guia',
      label: 'Guia da Biblioteca',
      icon: Palette,
      match: 'exact',
    },
  ],
};

describe('SidebarNav future submenu contract', () => {
  afterEach(() => {
    routeState.pathname = '/pacientes';
  });

  it('exposes an expanded state and keyboard-operable disclosure for future groups', () => {
    render(<SidebarNav navigationItems={[libraryGroup]} />);

    const trigger = screen.getByRole('button', { name: 'Biblioteca' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Guia da Biblioteca' })).toBeInTheDocument();
  });

  it('marks an active child current and makes its ancestor discoverable', () => {
    routeState.pathname = '/biblioteca/guia';
    render(<SidebarNav navigationItems={[libraryGroup]} />);

    const trigger = screen.getByRole('button', { name: /Biblioteca/ });
    expect(trigger).toHaveAttribute('data-active', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Guia da Biblioteca' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('omits empty groups and keeps the production navigation flat by default', () => {
    render(
      <SidebarNav
        navigationItems={[
          { ...libraryGroup, children: [] },
        ]}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Biblioteca' })).toBeNull();

    render(<SidebarNav />);
    expect(screen.queryByRole('button', { name: 'Biblioteca' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Pacientes' })).toBeInTheDocument();
  });

  it('keeps future group children discoverable through a collapsed keyboard surface', () => {
    render(<SidebarNav initialCollapsed navigationItems={[libraryGroup]} />);

    const trigger = screen.getByRole('button', { name: 'Biblioteca' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(trigger, { key: ' ' });
    fireEvent.click(trigger);

    expect(screen.getByRole('link', { name: 'Guia da Biblioteca' })).toBeInTheDocument();
  });
});
