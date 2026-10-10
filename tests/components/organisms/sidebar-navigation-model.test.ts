import { BookOpen, Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import {
  getRenderableNavigationItems,
  isSidebarNavigationItemActive,
  isSidebarRouteActive,
  validateSidebarNavigationItems,
  type SidebarGroupItem,
  type SidebarRouteItem,
} from '@/components/organisms/sidebar-navigation-model';
import { sidebarProductionRoutes } from './sidebar-navigation-fixtures';

const patients: SidebarRouteItem = {
  kind: 'route',
  href: '/pacientes',
  label: 'Pacientes',
  icon: Users,
  match: 'patients-prefix',
};

const foods: SidebarRouteItem = {
  kind: 'route',
  href: '/alimentos',
  label: 'Planilha de Alimentos',
  icon: BookOpen,
};

describe('sidebar navigation model', () => {
  it('keeps the six current destinations flat and ordered', () => {
    expect(sidebarProductionRoutes.map((item) => item.kind)).toEqual([
      'route',
      'route',
      'route',
      'route',
      'route',
      'route',
    ]);
    expect(sidebarProductionRoutes.map((item) => item.href)).toEqual([
      '/pacientes',
      '/agenda',
      '/presets',
      '/refeicoes',
      '/receitas',
      '/alimentos',
    ]);
  });

  it('matches exact, prefix, and patient routes without false positives', () => {
    expect(isSidebarRouteActive('/alimentos', foods)).toBe(true);
    expect(isSidebarRouteActive('/alimentos/tabela', foods)).toBe(false);
    expect(isSidebarRouteActive('/pacientes/123/dieta/1', patients)).toBe(true);
    expect(isSidebarRouteActive('/presets-extra', sidebarProductionRoutes[2])).toBe(false);
    expect(isSidebarRouteActive('/unknown', patients)).toBe(false);
  });

  it('marks a future group active when a child route is current', () => {
    const group: SidebarGroupItem = {
      kind: 'group',
      id: 'library',
      label: 'Biblioteca',
      icon: BookOpen,
      children: [foods],
    };

    expect(isSidebarNavigationItemActive('/alimentos', group)).toBe(true);
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

  it('reports invalid navigation ids, labels, hrefs, and duplicate route destinations', () => {
    expect(
      validateSidebarNavigationItems([
        { kind: 'route', href: 'pacientes', label: '', icon: Users },
        { kind: 'group', id: '', label: 'Grupo', children: [] },
        { kind: 'route', href: '/pacientes', label: 'Original', icon: Users },
        { kind: 'route', href: '/pacientes', label: 'Duplicado', icon: Users },
      ]),
    ).toEqual([
      'Route item at index 0 must have a non-empty label.',
      'Route item at index 0 must use an absolute pathname href.',
      'Group item at index 1 must have a stable id.',
      'Group item at index 1 must have at least one child route.',
      'Route href "/pacientes" is duplicated.',
    ]);
  });
});
