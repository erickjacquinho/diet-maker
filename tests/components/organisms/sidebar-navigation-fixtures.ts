import { BookOpen, CalendarDays, LayoutDashboard, Sparkles, Utensils, UtensilsCrossed, Users } from 'lucide-react';

import type {
  SidebarGroupItem,
  SidebarNavigationItem,
  SidebarRouteItem,
} from '@/components/organisms/sidebar-navigation-model';

export const sidebarProductionRoutes: SidebarRouteItem[] = [
  { kind: 'route', href: '/dashboard', label: 'Início', icon: LayoutDashboard, match: 'prefix' },
  { kind: 'route', href: '/pacientes', label: 'Pacientes', icon: Users, match: 'patients-prefix' },
  { kind: 'route', href: '/agenda', label: 'Agenda', icon: CalendarDays, match: 'prefix' },
  { kind: 'route', href: '/presets', label: 'Dietas prontas', icon: Sparkles, match: 'prefix' },
  {
    kind: 'route',
    href: '/refeicoes',
    label: 'Refeições',
    icon: UtensilsCrossed,
    match: 'prefix',
  },
  { kind: 'route', href: '/receitas', label: 'Receitas', icon: Utensils, match: 'prefix' },
  { kind: 'route', href: '/alimentos', label: 'Alimentos', icon: BookOpen, match: 'prefix' },
];

export const sidebarFutureGroup: SidebarGroupItem = {
  kind: 'group',
  id: 'library',
  label: 'Biblioteca',
  icon: BookOpen,
  children: [sidebarProductionRoutes[6]],
};

export const sidebarEmptyGroup: SidebarGroupItem = {
  kind: 'group',
  id: 'empty',
  label: 'Grupo vazio',
  children: [],
};

export const sidebarNavigationFixture: SidebarNavigationItem[] = [
  ...sidebarProductionRoutes,
  sidebarFutureGroup,
  sidebarEmptyGroup,
];

export const sidebarNestedPatientPathname = '/pacientes/123/dieta/1';
export const sidebarUnknownPathname = '/rota-inexistente';
