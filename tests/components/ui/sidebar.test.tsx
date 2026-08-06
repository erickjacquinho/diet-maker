import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';

function StateProbe() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <>
      <output aria-label="sidebar-state">{state}</output>
      <button type="button" onClick={toggleSidebar}>
        Toggle
      </button>
    </>
  );
}

describe('Sidebar primitive contract', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('projects controlled and uncontrolled presentation state through the public context', () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <StateProbe />
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByLabelText('sidebar-state')).toHaveTextContent('expanded');
  });

  it('toggles the uncontrolled state without introducing a second state source', () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <StateProbe />
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByLabelText('sidebar-state')).toHaveTextContent('expanded');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByLabelText('sidebar-state')).toHaveTextContent('collapsed');
    expect(document.querySelector('[data-sidebar="sidebar"]')).toHaveAttribute(
      'data-state',
      'collapsed',
    );
  });

  it('projects controlled state and delegates changes to the host', () => {
    const onOpenChange = vi.fn();

    render(
      <SidebarProvider open={false} onOpenChange={onOpenChange}>
        <Sidebar>
          <StateProbe />
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByLabelText('sidebar-state')).toHaveTextContent('collapsed');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText('sidebar-state')).toHaveTextContent('collapsed');
  });

  it('exposes the canonical expanded and collapsed width variables as classes', () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <StateProbe />
        </Sidebar>
      </SidebarProvider>,
    );

    const provider = document.querySelector<HTMLElement>('[data-sidebar="provider"]');
    expect(provider).not.toBeNull();
    if (!provider) throw new Error('SidebarProvider was not rendered');
    expect(provider).toHaveClass('[--sidebar-width:var(--cmp-sidebar-width-expanded)]');
    expect(provider).toHaveClass('[--sidebar-width-collapsed:var(--cmp-sidebar-width-collapsed)]');
  });

  it('does not persist state or register Ctrl+B/Cmd+B by default', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');

    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <StateProbe />
        </Sidebar>
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));

    expect(document.cookie).not.toContain('sidebar_state');
    expect(window.localStorage).toHaveLength(0);
    expect(addEventListener).not.toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
