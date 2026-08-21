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

    const save = screen.getByRole('button', { name: 'Salvar Arquivo Local' });
    const open = screen.getByRole('button', { name: 'Abrir Arquivo .diet' });

    expect(save).toBeDisabled();
    expect(open).toBeDisabled();
    expect(save).toHaveAccessibleDescription('A ação Salvar ainda não está disponível nesta tela.');
    expect(open).toHaveAccessibleDescription('A ação Abrir ainda não está disponível nesta tela.');
  });

  it('enables and isolates each callback', () => {
    const onSave = vi.fn();
    const onOpen = vi.fn();

    renderActions({ onSave });
    const save = screen.getByRole('button', { name: 'Salvar Arquivo Local' });
    const open = screen.getByRole('button', { name: 'Abrir Arquivo .diet' });

    expect(save).toBeEnabled();
    expect(open).toBeDisabled();
    fireEvent.click(save);
    fireEvent.click(open);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('preserves action labels and disabled semantics in collapsed mode', () => {
    const onOpen = vi.fn();

    renderActions({ isCollapsed: true, onOpen });

    const save = screen.getByRole('button', { name: 'Salvar Arquivo Local' });
    const open = screen.getByRole('button', { name: 'Abrir Arquivo .diet' });

    expect(save).toBeDisabled();
    expect(open).toBeEnabled();
    expect(save).toHaveAccessibleDescription('A ação Salvar ainda não está disponível nesta tela.');
    fireEvent.click(open);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
