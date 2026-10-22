import { BookOpen, CalendarDays, LayoutDashboard, Sparkles, Utensils, UtensilsCrossed, Users } from 'lucide-react';

import type { SidebarRouteItem } from '@/components/organisms/sidebar-navigation-model';

export const SIDEBAR_NAVIGATION_ITEMS: SidebarRouteItem[] = [
  { kind: 'route', href: '/dashboard', label: 'Início', icon: LayoutDashboard, match: 'prefix' },
  { kind: 'route', href: '/pacientes', label: 'Pacientes', icon: Users, match: 'patients-prefix' },
  { kind: 'route', href: '/agenda', label: 'Agenda', icon: CalendarDays, match: 'prefix' },
  { kind: 'route', href: '/presets', label: 'Dietas prontas', icon: Sparkles, match: 'prefix' },
  { kind: 'route', href: '/refeicoes', label: 'Refeições', icon: UtensilsCrossed, match: 'prefix' },
  { kind: 'route', href: '/receitas', label: 'Receitas', icon: Utensils, match: 'prefix' },
  { kind: 'route', href: '/alimentos', label: 'Alimentos', icon: BookOpen, match: 'prefix' },
];
