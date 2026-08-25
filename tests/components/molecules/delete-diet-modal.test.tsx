import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteDietModal } from '@/components/molecules/DeleteDietModal';

describe('DeleteDietModal', () => {
  it('renders confirmation dialog with diet details and warning message', () => {
    render(
      <DeleteDietModal
        open
        dietName="Plano Cutting 2026"
        dietDate="24/08/2026"
        onOpenChange={vi.fn()}
        onConfirmDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: /Confirmar Exclusão de Prescrição/ })).toBeInTheDocument();
    expect(screen.getByText('Plano Cutting 2026')).toBeInTheDocument();
    expect(screen.getByText(/\(24\/08\/2026\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/Todos os cálculos de calorias, distribuição de macronutrientes e cardápios/i),
    ).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when clicking Cancelar button', () => {
    const handleOpenChange = vi.fn();
    render(
      <DeleteDietModal
        open
        dietName="Plano Cutting 2026"
        onOpenChange={handleOpenChange}
        onConfirmDelete={vi.fn()}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onConfirmDelete when holding confirmation button', () => {
    vi.useFakeTimers();
    const handleConfirm = vi.fn();
    render(
      <DeleteDietModal
        open
        dietName="Plano Cutting 2026"
        onOpenChange={vi.fn()}
        onConfirmDelete={handleConfirm}
      />,
    );

    const deleteBtn = screen.getByRole('button', { name: 'Sim, Excluir Prescrição' });
    fireEvent.pointerDown(deleteBtn, { button: 0 });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('triggers onConfirmDelete when shortcut Ctrl+S is pressed', () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteDietModal
        open
        dietName="Plano Cutting 2026"
        onOpenChange={vi.fn()}
        onConfirmDelete={handleConfirm}
      />,
    );

    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
