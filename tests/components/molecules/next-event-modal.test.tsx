import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextEventModal } from '@/components/molecules/NextEventModal';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

describe('NextEventModal', () => {
  it('renders the modal with date and select field', () => {
    render(
      <NextEventModal
        open
        nextEvent={null}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Definir próximo acompanhamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Data' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument();
  });

  it('renders "Reagendar acompanhamento" and "Remover data" when nextEvent is present', () => {
    render(
      <NextEventModal
        open
        nextEvent={{ date: '2026-09-15', type: 'diet-update' }}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Reagendar acompanhamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover data' })).toBeInTheDocument();
  });

  it('opens confirmation alert when "Remover data" is clicked, and confirms removal', async () => {
    const onClear = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <NextEventModal
        open
        nextEvent={{ date: '2026-09-15', type: 'diet-update' }}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
        onClear={onClear}
      />,
    );

    const removeBtn = screen.getByRole('button', { name: 'Remover data' });
    fireEvent.click(removeBtn);

    const alertDialog = await screen.findByRole('heading', { name: 'Remover acompanhamento?' });
    expect(alertDialog).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Sim, remover' });
    fireEvent.click(confirmBtn);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('opens discard alert when closing with unsaved changes', async () => {
    const onOpenChange = vi.fn();

    render(
      <NextEventModal
        open
        nextEvent={null}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    // Change select value to make it dirty
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    const option = await screen.findByRole('option', { name: 'Atualização de dieta' });
    fireEvent.click(option);

    // Try to cancel
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Descartar alterações?' })).toBeInTheDocument();

    const confirmDiscardBtn = screen.getByRole('button', { name: 'Sim, descartar' });
    fireEvent.click(confirmDiscardBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
