import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import { AppLayoutShell } from '@/components/templates/AppLayoutShell';

describe('AppLayoutShell sidebar integration', () => {
  it('keeps the persistent sidebar separate from the main scroll region', () => {
    render(
      <AppLayoutShell sidebar={<aside data-testid="sidebar-slot">Sidebar</aside>}>
        <div>Conteúdo da página</div>
      </AppLayoutShell>,
    );

    expect(screen.getByTestId('sidebar-slot')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('min-w-0', 'overflow-y-auto', 'h-screen');
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo principal' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });

  it('owns only the slot and does not import route or primitive concerns', () => {
    const pageSource = readFileSync('src/components/templates/AppLayoutShell.tsx', 'utf8');

    expect(pageSource).not.toContain('SidebarNav');
    expect(pageSource).not.toContain('usePathname');
    expect(pageSource).not.toContain('src/components/ui/sidebar');
  });
});
