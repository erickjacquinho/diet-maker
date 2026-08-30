import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeletePatientModal } from '@/components/molecules/DeletePatientModal';

describe('archive patient interaction', () => {
  it('explains logical archiving and preserves history on cancellation', () => {
    const onOpenChange = vi.fn();
    const onConfirmArchive = vi.fn();
    render(
      <DeletePatientModal
        open
        patientName="Ana Lima"
        onOpenChange={onOpenChange}
        onConfirmArchive={onConfirmArchive}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Confirmar arquivamento do paciente' })).toBeInTheDocument();
    expect(screen.getByText(/histórico será preservado/i)).toBeInTheDocument();
    expect(screen.getByText(/Dietas, avaliações e demais registros históricos permanecerão preservados/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirmArchive).not.toHaveBeenCalled();
  });

  it('requires a prolonged accessible confirmation before archiving', () => {
    vi.useFakeTimers();
    try {
      const onConfirmArchive = vi.fn();
      render(
        <DeletePatientModal
          open
          patientName="Ana Lima"
          onOpenChange={vi.fn()}
          onConfirmArchive={onConfirmArchive}
        />,
      );

      const confirm = screen.getByRole('button', { name: /segure.*arquivar/i });
      fireEvent.pointerDown(confirm, { button: 0 });
      vi.advanceTimersByTime(1499);
      expect(onConfirmArchive).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onConfirmArchive).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
