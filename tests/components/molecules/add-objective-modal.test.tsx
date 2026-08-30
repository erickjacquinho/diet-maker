import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddObjectiveModal } from '@/components/molecules/AddObjectiveModal';

describe('AddObjectiveModal', () => {
  it('focuses the labelled field, rejects empty input and cancels without mutation', () => {
    const onAddObjective = vi.fn();
    const onOpenChange = vi.fn();
    render(<AddObjectiveModal open onOpenChange={onOpenChange} onAddObjective={onAddObjective} />);

    const input = screen.getByRole('textbox', { name: 'Descrição do Objetivo' });
    expect(input).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));
    expect(onAddObjective).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps the modal open while saving and closes only after success', async () => {
    const onAddObjective = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 20)));
    const onOpenChange = vi.fn();
    render(<AddObjectiveModal open onOpenChange={onOpenChange} onAddObjective={onAddObjective} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Descrição do Objetivo' }), { target: { value: 'Maratona' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(screen.getByRole('button', { name: /Salvando objetivo/i })).toBeDisabled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('shows a recoverable error and keeps the entered value after persistence failure', async () => {
    const onAddObjective = vi.fn().mockRejectedValue(new Error('Falha no catálogo'));
    const onOpenChange = vi.fn();
    render(<AddObjectiveModal open onOpenChange={onOpenChange} onAddObjective={onAddObjective} />);

    const input = screen.getByRole('textbox', { name: 'Descrição do Objetivo' });
    fireEvent.change(input, { target: { value: 'Objetivo falho' } });
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha no catálogo');
    expect(input).toHaveValue('Objetivo falho');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
