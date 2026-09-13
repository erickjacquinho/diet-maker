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

    fireEvent.click(accountButton);
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

    fireEvent.keyDown(accountButton, { key: 'Enter' });
    fireEvent.click(accountButton);
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });

  it('renders dropdown menu with backup actions and account option when callbacks are provided', async () => {
    const onExportBackup = vi.fn();
    const onRestoreBackup = vi.fn();
    const onOpenAccount = vi.fn();

    renderProfile({
      doctorName: 'Dr. Alice',
      doctorRole: 'Nutricionista',
      onExportBackup,
      onRestoreBackup,
      onOpenAccount,
    });

    const trigger = screen.getByRole('button', {
      name: 'Abrir menu de conta de Dr. Alice',
    });

    fireEvent.pointerDown(trigger, { button: 0 });

    const exportItem = await screen.findByRole('menuitem', { name: /Exportar backup/i });
    const restoreItem = screen.getByRole('menuitem', { name: /Restaurar backup/i });
    const accountItem = screen.getByRole('menuitem', { name: /Configurações da Conta/i });

    expect(exportItem).toBeInTheDocument();
    expect(restoreItem).toBeInTheDocument();
    expect(accountItem).toBeInTheDocument();

    fireEvent.click(exportItem);
    expect(onExportBackup).toHaveBeenCalledTimes(1);
  });
});
