import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarQuickActions } from '@/components/molecules/SidebarQuickActions';
import { TooltipProvider } from '@/components/ui/tooltip';

function renderActions(props: React.ComponentProps<typeof SidebarQuickActions>) {
  return render(
    <TooltipProvider>
      <SidebarQuickActions {...props} />
    </TooltipProvider>,
  );
}

describe('SidebarQuickActions', () => {
  it('keeps unavailable expanded actions visible, disabled and described', () => {
    renderActions({});

    const exportButton = screen.getByRole('button', { name: 'Exportar backup local' });
    const restoreButton = screen.getByRole('button', { name: 'Importar backup local' });

    expect(exportButton).toBeDisabled();
    expect(restoreButton).toBeDisabled();
    expect(exportButton).toHaveAccessibleDescription('A ação Exportar backup ainda não está disponível nesta tela.');
    expect(restoreButton).toHaveAccessibleDescription('A ação Importar backup ainda não está disponível nesta tela.');
  });

  it('enables and isolates each callback', () => {
    const onExportBackup = vi.fn();
    const onRestoreBackup = vi.fn();

    renderActions({ onExportBackup });
    const exportButton = screen.getByRole('button', { name: 'Exportar backup local' });
    const restoreButton = screen.getByRole('button', { name: 'Importar backup local' });

    expect(exportButton).toBeEnabled();
    expect(restoreButton).toBeDisabled();
    fireEvent.click(exportButton);
    fireEvent.click(restoreButton);
    expect(onExportBackup).toHaveBeenCalledTimes(1);
    expect(onRestoreBackup).not.toHaveBeenCalled();
  });

  it('preserves action labels and disabled semantics in collapsed mode', () => {
    const onRestoreBackup = vi.fn();

    renderActions({ isCollapsed: true, onRestoreBackup });

    const exportButton = screen.getByRole('button', { name: 'Exportar backup local' });
    const restoreButton = screen.getByRole('button', { name: 'Importar backup local' });

    expect(exportButton).toBeDisabled();
    expect(restoreButton).toBeEnabled();
    expect(exportButton).toHaveAccessibleDescription('A ação Exportar backup ainda não está disponível nesta tela.');
    fireEvent.click(restoreButton);
    expect(onRestoreBackup).toHaveBeenCalledTimes(1);
  });
});
