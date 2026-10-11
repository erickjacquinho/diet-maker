import { readFileSync } from 'node:fs';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({ pathname: '/pacientes' }));

vi.mock('next/navigation', () => ({
  usePathname: () => routeState.pathname,
}));

import { SidebarNavigationAdapter } from '@/app/navigation/SidebarNavigationAdapter';

describe('SidebarNavigationAdapter boundary', () => {
  it('supplies the application pathname and six production destinations to SidebarNav', () => {
    render(<SidebarNavigationAdapter />);

    expect(screen.getByRole('link', { name: /Pacientes/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Agenda' })).toHaveAttribute(
      'href',
      '/agenda',
    );
    expect(
      within(screen.getByRole('navigation'))
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/pacientes',
      '/agenda',
      '/presets',
      '/refeicoes',
      '/receitas',
      '/alimentos',
    ]);
  });

  it('keeps route context out of the SidebarNav organism', () => {
    const source = readFileSync('src/components/organisms/SidebarNav.tsx', 'utf8');

    expect(source).not.toContain("from 'next/navigation'");
    expect(source).not.toContain('usePathname');
  });
});
