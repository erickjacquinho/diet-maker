import { BookOpen, Palette, Sparkles, Utensils, UtensilsCrossed, Users } from 'lucide-react';

import type { SidebarRouteItem } from '@/components/organisms/sidebar-navigation-model';

export const SIDEBAR_NAVIGATION_ITEMS: SidebarRouteItem[] = [
  { kind: 'route', href: '/pacientes', label: 'Pacientes', icon: Users, match: 'patients-prefix' },
  { kind: 'route', href: '/presets', label: 'Presets de Dietas', icon: Sparkles, match: 'prefix' },
  { kind: 'route', href: '/refeicoes-prontas', label: 'Refeições Prontas', icon: UtensilsCrossed, match: 'prefix' },
  { kind: 'route', href: '/receitas', label: 'Receitas Culinárias', icon: Utensils, match: 'prefix' },
  { kind: 'route', href: '/alimentos', label: 'Planilha de Alimentos', icon: BookOpen, match: 'prefix' },
  { kind: 'route', href: '/design-system', label: 'Guia Design System', icon: Palette, match: 'prefix' },
];
