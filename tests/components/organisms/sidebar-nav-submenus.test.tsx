import { fireEvent, render, screen } from '@testing-library/react';
import { BookOpen, Palette } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { SidebarNav } from '@/components/organisms/SidebarNav';
import type { SidebarGroupItem } from '@/components/organisms/sidebar-navigation-model';
import { sidebarProductionRoutes } from './sidebar-navigation-fixtures';

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
  it('exposes an expanded state and keyboard-operable disclosure for future groups', () => {
    render(<SidebarNav pathname="/pacientes" navigationItems={[libraryGroup]} />);

    const trigger = screen.getByRole('button', { name: 'Biblioteca' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Guia da Biblioteca' })).toBeInTheDocument();
  });

  it('marks an active child current and makes its ancestor discoverable', () => {
    render(<SidebarNav pathname="/biblioteca/guia" navigationItems={[libraryGroup]} />);

    const trigger = screen.getByRole('button', { name: /Biblioteca/ });
    expect(trigger).toHaveAttribute('data-active', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Guia da Biblioteca' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('omits empty groups and keeps production navigation data explicit', () => {
    render(
      <SidebarNav
        pathname="/pacientes"
        navigationItems={[{ ...libraryGroup, children: [] }]}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Biblioteca' })).toBeNull();

    render(<SidebarNav pathname="/pacientes" navigationItems={sidebarProductionRoutes} />);
    expect(screen.getByRole('link', { name: 'Pacientes' })).toBeInTheDocument();
  });

  it('keeps future group children discoverable through a collapsed keyboard surface', () => {
    render(<SidebarNav pathname="/pacientes" initialCollapsed navigationItems={[libraryGroup]} />);

    const trigger = screen.getByRole('button', { name: 'Biblioteca' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(trigger, { key: ' ' });
    fireEvent.click(trigger);

    expect(screen.getByRole('link', { name: 'Guia da Biblioteca' })).toBeInTheDocument();
  });
});
