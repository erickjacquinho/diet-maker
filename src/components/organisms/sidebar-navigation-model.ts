import type { LucideIcon } from 'lucide-react';
import { BookOpen, Palette, Sparkles, Utensils, UtensilsCrossed, Users } from 'lucide-react';

export type SidebarRouteMatch = 'exact' | 'prefix' | 'patients-prefix';

export interface SidebarRouteItem {
  kind: 'route';
  href: string;
  label: string;
  icon: LucideIcon;
  match?: SidebarRouteMatch;
}

export interface SidebarGroupItem {
  kind: 'group';
  id: string;
  label: string;
  icon?: LucideIcon;
  children: SidebarRouteItem[];
  defaultOpen?: boolean;
}

export type SidebarNavigationItem = SidebarRouteItem | SidebarGroupItem;

export const DEFAULT_NAVIGATION_ITEMS: SidebarRouteItem[] = [
  { kind: 'route', href: '/pacientes', label: 'Pacientes', icon: Users, match: 'patients-prefix' },
  { kind: 'route', href: '/presets', label: 'Presets de Dietas', icon: Sparkles, match: 'prefix' },
  {
    kind: 'route',
    href: '/refeicoes-prontas',
    label: 'Refeições Prontas',
    icon: UtensilsCrossed,
    match: 'prefix',
  },
  { kind: 'route', href: '/receitas', label: 'Receitas Culinárias', icon: Utensils, match: 'prefix' },
  {
    kind: 'route',
    href: '/alimentos',
    label: 'Planilha de Alimentos',
    icon: BookOpen,
    match: 'prefix',
  },
  { kind: 'route', href: '/design-system', label: 'Guia Design System', icon: Palette, match: 'prefix' },
];

function isSegmentPrefix(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isSidebarRouteActive(pathname: string, item: SidebarRouteItem): boolean {
  switch (item.match) {
    case 'prefix':
    case 'patients-prefix':
      return isSegmentPrefix(pathname, item.href);
    case 'exact':
    default:
      return pathname === item.href;
  }
}

export function isSidebarNavigationItemActive(
  pathname: string,
  item: SidebarNavigationItem,
): boolean {
  if (item.kind === 'route') return isSidebarRouteActive(pathname, item);
  return item.children.some((child) => isSidebarRouteActive(pathname, child));
}

export function getRenderableNavigationItems(
  items: SidebarNavigationItem[],
): SidebarNavigationItem[] {
  return items.filter((item) => item.kind === 'route' || item.children.length > 0);
}
