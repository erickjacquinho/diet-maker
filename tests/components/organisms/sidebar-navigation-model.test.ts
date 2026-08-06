import { BookOpen, Palette, Sparkles, Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_NAVIGATION_ITEMS,
  getRenderableNavigationItems,
  isSidebarNavigationItemActive,
  isSidebarRouteActive,
  type SidebarGroupItem,
  type SidebarRouteItem,
} from '@/components/organisms/sidebar-navigation-model';

const patients: SidebarRouteItem = {
  kind: 'route',
  href: '/pacientes',
  label: 'Pacientes',
  icon: Users,
  match: 'patients-prefix',
};

const designSystem: SidebarRouteItem = {
  kind: 'route',
  href: '/design-system',
  label: 'Guia Design System',
  icon: Palette,
};

describe('sidebar navigation model', () => {
  it('keeps the six current destinations flat and ordered', () => {
    expect(DEFAULT_NAVIGATION_ITEMS.map((item) => item.kind)).toEqual([
      'route',
      'route',
      'route',
      'route',
      'route',
      'route',
    ]);
    expect(DEFAULT_NAVIGATION_ITEMS.map((item) => item.href)).toEqual([
      '/pacientes',
      '/presets',
      '/refeicoes-prontas',
      '/receitas',
      '/alimentos',
      '/design-system',
    ]);
  });

  it('matches exact, prefix, and patient routes without false positives', () => {
    expect(isSidebarRouteActive('/design-system', designSystem)).toBe(true);
    expect(isSidebarRouteActive('/design-system/tokens', designSystem)).toBe(false);
    expect(isSidebarRouteActive('/pacientes/123/dieta/1', patients)).toBe(true);
    expect(isSidebarRouteActive('/presets-extra', DEFAULT_NAVIGATION_ITEMS[1])).toBe(false);
    expect(isSidebarRouteActive('/unknown', patients)).toBe(false);
  });

  it('marks a future group active when a child route is current', () => {
    const group: SidebarGroupItem = {
      kind: 'group',
      id: 'library',
      label: 'Biblioteca',
      icon: BookOpen,
      children: [designSystem],
    };

    expect(isSidebarNavigationItemActive('/design-system', group)).toBe(true);
    expect(isSidebarNavigationItemActive('/unknown', group)).toBe(false);
  });

  it('omits empty future groups while retaining routes', () => {
    const emptyGroup: SidebarGroupItem = {
      kind: 'group',
      id: 'empty',
      label: 'Empty',
      children: [],
    };

    expect(getRenderableNavigationItems([emptyGroup, patients])).toEqual([patients]);
  });
});
