import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SidebarNav } from '@/components/organisms/SidebarNav';
import { sidebarFutureGroup, sidebarProductionRoutes } from './sidebar-navigation-fixtures';

describe('SidebarNav Design System conformance', () => {
  it('uses the canonical rail, motion, navigation control and collapsed identity contracts', () => {
    const { unmount } = render(
      <SidebarNav pathname="/pacientes" navigationItems={sidebarProductionRoutes} />,
    );

    const rail = document.querySelector('[data-sidebar="sidebar"]');
    expect(rail).toHaveClass('border-r', 'motion-reduce:transition-none');
    expect(screen.getByRole('link', { name: 'Pacientes' }).closest('[data-sidebar="menu-button"]')).toHaveClass(
      'h-9',
      '[&>svg]:size-4',
    );

    unmount();
    render(
      <SidebarNav pathname="/pacientes" navigationItems={sidebarProductionRoutes} initialCollapsed />,
    );

    expect(screen.getByRole('link', { name: 'NutriDiet Pro Local' })).toBeInTheDocument();
  });

  it('keeps future submenu items on the 36px canonical control height', () => {
    render(
      <SidebarNav pathname="/design-system" navigationItems={[sidebarFutureGroup]} />,
    );

    expect(screen.getByRole('link', { name: 'Guia Design System' }).closest('[data-sidebar="menu-sub-button"]')).toHaveClass(
      'h-control-standard',
      '[&>svg]:size-4',
    );
  });
});
