import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarUserProfile } from '@/components/molecules/SidebarUserProfile';
import { TooltipProvider } from '@/components/ui/tooltip';

function renderProfile(props: React.ComponentProps<typeof SidebarUserProfile>) {
  return render(
    <TooltipProvider>
      <SidebarUserProfile {...props} />
    </TooltipProvider>,
  );
}

describe('SidebarUserProfile', () => {
  it('uses an actionable account control only when onOpenAccount exists', () => {
    const onOpenAccount = vi.fn();

    renderProfile({ doctorName: 'Dr. Alice', onOpenAccount });

    const accountButton = screen.getByRole('button', {
      name: 'Abrir menu de conta de Dr. Alice',
    });

    fireEvent.pointerDown(accountButton, { button: 0 });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Configurações' }));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });

  it('keeps the expanded identity informational when no callback exists', () => {
    const { container } = renderProfile({ doctorName: 'Dr. Alice' });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveClass('cursor-pointer', 'hover:border-text-muted');
  });

  it('keeps the collapsed account control keyboard-operable', () => {
    const onOpenAccount = vi.fn();

    renderProfile({ doctorName: 'Dr. Alice', isCollapsed: true, onOpenAccount });

    const accountButton = screen.getByRole('button', {
      name: 'Abrir menu de conta de Dr. Alice',
    });

    fireEvent.pointerDown(accountButton, { button: 0 });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Configurações' }));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });

  it('renders only settings and sign out', async () => {
    const onOpenAccount = vi.fn();
    const onSignOut = vi.fn();

    renderProfile({
      doctorName: 'Dr. Alice',
      doctorRole: 'Nutricionista',
      onOpenAccount,
      onSignOut,
    });

    const trigger = screen.getByRole('button', {
      name: 'Abrir menu de conta de Dr. Alice',
    });

    fireEvent.pointerDown(trigger, { button: 0 });

    const accountItem = await screen.findByRole('menuitem', { name: 'Configurações' });
    const signOutItem = screen.getByRole('menuitem', { name: 'Sair' });

    expect(accountItem).toBeInTheDocument();
    expect(signOutItem).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    expect(screen.queryByRole('menuitem', { name: 'Visão geral' })).not.toBeInTheDocument();
  });
});
