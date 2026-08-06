import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const routeState = { pathname: '/design-system' };

vi.mock('next/navigation', () => ({
  usePathname: () => routeState.pathname,
}));

import { SidebarNav, useSidebarContext } from '@/components/organisms/SidebarNav';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';

function StateProbe() {
  const { state } = useSidebar();
  return <output aria-label="provider-state">{state}</output>;
}

function ProductToggleProbe() {
  const context = useSidebarContext();
  return (
    <button type="button" onClick={context?.toggleCollapse}>
      Product toggle seam
    </button>
  );
}

describe('SidebarNav shortcut readiness', () => {
  afterEach(() => {
    document.cookie = 'sidebar_state=; Max-Age=0; path=/';
  });

  it('keeps the visible toggle operable and preserves route context', () => {
    render(<SidebarNav />);

    const toggle = screen.getByRole('button', { name: 'Recolher Menu' });
    expect(screen.getByRole('link', { name: 'Guia Design System' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Expandir Menu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Guia Design System' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'Expandir Menu' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Expandir Menu' }));
    expect(screen.getByRole('button', { name: 'Recolher Menu' })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('button', { name: 'Recolher Menu' }), { key: ' ' });
    fireEvent.click(screen.getByRole('button', { name: 'Recolher Menu' }));
    expect(screen.getByRole('button', { name: 'Expandir Menu' })).toBeInTheDocument();
  });

  it('does not activate Ctrl+B/Cmd+B or persistence in the current product wrapper', () => {
    render(<SidebarNav />);

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'b', metaKey: true });

    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'expanded');
    expect(document.cookie).not.toContain('sidebar_state');
  });

  it('leaves an explicit future shortcut adapter free to ignore editable controls', () => {
    render(
      <SidebarProvider defaultOpen shortcutKey="b">
        <Sidebar>
          <input aria-label="Nome" />
          <StateProbe />
        </Sidebar>
      </SidebarProvider>,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Nome' }), { key: 'b', ctrlKey: true });
    expect(screen.getByLabelText('provider-state')).toHaveTextContent('expanded');

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(screen.getByLabelText('provider-state')).toHaveTextContent('collapsed');
  });

  it('exposes the same product-owned toggle action for a future adapter', () => {
    render(
      <SidebarNav>
        <ProductToggleProbe />
      </SidebarNav>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Product toggle seam' }));
    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute('data-state', 'collapsed');
  });
});
