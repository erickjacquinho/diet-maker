import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import { AppLayoutShell } from '@/components/templates/AppLayoutShell';

describe('AppLayoutShell sidebar integration', () => {
  it('keeps the persistent sidebar separate from the main scroll region', () => {
    render(
      <AppLayoutShell>
        <div>Conteúdo da página</div>
      </AppLayoutShell>,
    );

    expect(document.querySelector('[data-sidebar="sidebar"]')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('min-w-0', 'overflow-y-auto', 'h-screen');
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });

  it('does not make the app pages import the generic Sidebar primitive directly', () => {
    const pageSource = readFileSync('src/components/templates/AppLayoutShell.tsx', 'utf8');

    expect(pageSource).toContain("import { SidebarNav }");
    expect(pageSource).not.toContain('src/components/ui/sidebar');
  });
});
