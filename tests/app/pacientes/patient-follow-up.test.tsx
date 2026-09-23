import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NextEventModal } from '@/components/molecules/NextEventModal';
import { toLegacyNextEvent, toNextFollowUpInput } from '@/lib/application/patients/clinical-ui-adapter';

describe('patient follow-up projection and commands', () => {
  it('preserves the canonical version while translating the UI enum', () => {
    const event = toLegacyNextEvent({
      accountId: 'account-1',
      patientId: 'patient-1',
      dueDate: '2026-09-15',
      type: ['DIET_UPDATE'],
      comments: 'Revisar o plano alimentar.',
      version: 4,
      createdAt: '2026-09-10T10:00:00.000Z',
      updatedAt: '2026-09-10T10:00:00.000Z',
    });

    expect(event).toEqual({ date: '15/09/2026', type: ['diet-update'], comments: 'Revisar o plano alimentar.', version: 4 });
    expect(toNextFollowUpInput(event!)).toEqual({ dueDate: '15/09/2026', type: ['DIET_UPDATE'], comments: 'Revisar o plano alimentar.' });
  });

  it('keeps the confirmed dialog open and draft intact when a replacement conflicts', async () => {
    const onOpenChange = vi.fn();
    const onSave = vi.fn().mockRejectedValue(new Error('Conflito de versão.'));

    render(
      <NextEventModal
        open
        nextEvent={{ date: '15/09/2026', type: 'diet-update', version: 4 }}
        onOpenChange={onOpenChange}
        onSave={onSave}
        onClear={vi.fn()}
      />,
    );

    fireEvent.submit(screen.getByRole('dialog').querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Conflito de versão.'));
    expect(screen.getByRole('heading', { name: 'Agendar acompanhamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover data' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('removes the confirmed follow-up only after the explicit hold confirmation', () => {
    vi.useFakeTimers();
    const onClear = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <NextEventModal
        open
        nextEvent={{ date: '15/09/2026', type: 'assessment-update', version: 2 }}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
        onClear={onClear}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remover data' }));
    const confirm = screen.getByRole('button', { name: 'Sim, remover' });
    fireEvent.pointerDown(confirm, { button: 0 });
    act(() => vi.advanceTimersByTime(1500));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });
});
