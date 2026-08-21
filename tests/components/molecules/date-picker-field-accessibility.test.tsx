import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DatePickerField } from '@/components/molecules/DatePickerField';

describe('DatePickerField accessibility', () => {
  it('opens the popup, supports day navigation and returns focus after Escape', async () => {
    render(
      <DatePickerField id="follow-up-date" label="Data" value="2026-08-03" onValueChange={vi.fn()} />,
    );

    const trigger = screen.getByRole('button', { name: /data/i });
    trigger.focus();
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const selectedDay = await waitFor(() => {
      const day = screen.getAllByRole('button').find((button) => button.getAttribute('data-day') === '03/08/2026');
      if (!day) {
        throw new Error('Selected day was not rendered');
      }
      return day;
    });

    selectedDay.focus();
    fireEvent.keyDown(selectedDay, { key: 'ArrowRight' });

    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-day', '04/08/2026'));

    fireEvent.keyDown(document.activeElement ?? selectedDay, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('exposes the label, validation relationship and disabled state without color-only semantics', () => {
    render(
      <DatePickerField
        id="follow-up-date"
        label="Data do acompanhamento"
        required
        error="Informe uma data."
        disabled
        onValueChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole('button', { name: /data do acompanhamento/i });

    expect(trigger).toHaveAccessibleName('Data do acompanhamento');
    expect(trigger).toHaveAttribute('aria-required', 'true');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-describedby', 'follow-up-date-error');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveClass('border-error-border');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma data.');
  });
});
