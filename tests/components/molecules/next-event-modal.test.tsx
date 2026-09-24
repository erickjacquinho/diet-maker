import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  it('renders the scheduling form with a date, type options, and five-line comments field', () => {
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
    expect(screen.getByRole('heading', { name: 'Agendar acompanhamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir calendário para Data' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualização de avaliação' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Atualização de dieta' })).toHaveAttribute('aria-pressed', 'false');
    const observations = screen.getByRole('textbox', { name: 'Observações' });
    expect(observations).toHaveAttribute('rows', '5');
    expect(observations).toHaveClass('resize-none');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument();
  });

  it('keeps the scheduling title and renders "Remover data" when nextEvent is present', () => {
    render(
      <NextEventModal
        open
        nextEvent={{ date: '2026-09-15', type: 'diet-update', comments: 'Revisar evolução.' }}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Agendar acompanhamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover data' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualização de dieta' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Observações' })).toHaveValue('Revisar evolução.');
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
    vi.useFakeTimers();
    fireEvent.pointerDown(confirmBtn, { button: 0 });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
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

    fireEvent.click(screen.getByRole('button', { name: 'Atualização de dieta' }));

    // Try to cancel
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Descartar alterações?' })).toBeInTheDocument();

    const confirmDiscardBtn = screen.getByRole('button', { name: 'Sim, descartar' });
    fireEvent.click(confirmDiscardBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps the modal open until an asynchronous save is confirmed', async () => {
    let resolveSave: (() => void) | undefined;
    const onSave = vi.fn(() => new Promise<void>((resolve) => { resolveSave = resolve; }));
    const onOpenChange = vi.fn();
    render(
      <NextEventModal
        open
        nextEvent={{ date: '2026-09-15', type: 'diet-update', version: 1 }}
        onOpenChange={onOpenChange}
        onSave={onSave}
        onClear={vi.fn()}
      />,
    );

    fireEvent.submit(screen.getByRole('dialog').querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    await act(async () => {
      resolveSave?.();
    });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('keeps the confirmed follow-up visible and shows a recoverable error when save fails', async () => {
    const onOpenChange = vi.fn();
    render(
      <NextEventModal
        open
        nextEvent={{ date: '2026-09-15', type: 'diet-update', version: 1 }}
        onOpenChange={onOpenChange}
        onSave={vi.fn().mockRejectedValue(new Error('Conflito de versão.'))}
        onClear={vi.fn()}
      />,
    );

    fireEvent.submit(screen.getByRole('dialog').querySelector('form') as HTMLFormElement);
    expect(await screen.findByRole('alert')).toHaveTextContent('Conflito de versão.');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('heading', { name: 'Agendar acompanhamento' })).toBeInTheDocument();
  });

  it('allows both type boxes to be selected and saves both with the comments', async () => {
    const onSave = vi.fn();
    render(
      <NextEventModal
        open
        nextEvent={null}
        onOpenChange={vi.fn()}
        onSave={onSave}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /Data/ }), { target: { value: '16/09/2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualização de dieta' }));
    expect(screen.getByRole('button', { name: 'Atualização de avaliação' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Atualização de dieta' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByRole('textbox', { name: 'Observações' }), { target: { value: 'Revisar o plano alimentar.' } });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      date: '2026-09-16',
      type: ['assessment-update', 'diet-update'],
      comments: 'Revisar o plano alimentar.',
    }));
  });

  it('allows clearing both types but disables save and rejects submission until one is selected', async () => {
    const onSave = vi.fn();
    render(
      <NextEventModal
        open
        nextEvent={null}
        onOpenChange={vi.fn()}
        onSave={onSave}
        onClear={vi.fn()}
      />,
    );

    const assessmentType = screen.getByRole('button', { name: 'Atualização de avaliação' });
    const dietType = screen.getByRole('button', { name: 'Atualização de dieta' });
    const saveButton = screen.getByRole('button', { name: /Salvar/i });

    fireEvent.click(assessmentType);
    expect(assessmentType).toHaveAttribute('aria-pressed', 'false');
    expect(dietType).toHaveAttribute('aria-pressed', 'false');
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox', { name: /Data/ }), { target: { value: '16/09/2026' } });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form') as HTMLFormElement);
    expect(onSave).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Selecione ao menos um tipo de acompanhamento.');

    fireEvent.click(dietType);
    expect(saveButton).toBeEnabled();
    fireEvent.submit(screen.getByRole('dialog').querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      date: '2026-09-16',
      type: ['diet-update'],
      comments: '',
    }));
  });
});
