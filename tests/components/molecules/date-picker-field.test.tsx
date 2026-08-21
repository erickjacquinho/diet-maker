import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DatePickerField } from '@/components/molecules/DatePickerField';

function getCalendarDayButton(day: number) {
  const button = screen.getAllByRole('button').find((candidate) => candidate.textContent?.trim() === String(day));

  if (!button) {
    throw new Error(`Calendar day ${day} was not found`);
  }

  return button;
}

describe('DatePickerField', () => {
  it('presents the canonical initial value and placeholder', () => {
    const { rerender } = render(
      <DatePickerField id="follow-up-date" label="Data" value="2026-08-03" onValueChange={vi.fn()} />,
    );

    const trigger = screen.getByRole('button', { name: /data/i });

    expect(trigger).toHaveClass('h-control-standard', 'rounded-control', 'text-style-field-value');
    expect(trigger).toHaveTextContent('03/08/2026');

    rerender(<DatePickerField id="follow-up-date" label="Data" placeholder="Selecione uma data" onValueChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /data/i })).toHaveTextContent('Selecione uma data');
  });

  it('emits YYYY-MM-DD and closes after selecting a day', () => {
    const onValueChange = vi.fn();

    render(
      <DatePickerField id="follow-up-date" label="Data" value="2026-08-03" onValueChange={onValueChange} />,
    );

    const trigger = screen.getByRole('button', { name: /data/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toHaveClass(
      'z-modal',
      'rounded-surface',
      'border-border-subtle',
      'shadow-floating',
    );

    const grid = screen.getByRole('grid');
    const selectedDay = within(grid)
      .getAllByRole('button')
      .find((button) => button.getAttribute('data-day') === '03/08/2026');

    expect(selectedDay).toBeInTheDocument();

    fireEvent.click(getCalendarDayButton(10));

    expect(onValueChange).toHaveBeenCalledWith('2026-08-10');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('associates required and validation semantics with the trigger', () => {
    render(
      <DatePickerField
        id="follow-up-date"
        label="Data"
        required
        error="Informe a data do acompanhamento."
        onValueChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole('button', { name: /data/i });

    expect(trigger).toHaveAttribute('aria-required', 'true');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger.getAttribute('aria-describedby')).toContain('follow-up-date-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe a data do acompanhamento.');
  });

  it('keeps the trigger disabled when the field is disabled', () => {
    render(<DatePickerField id="follow-up-date" label="Data" disabled onValueChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /data/i })).toBeDisabled();
  });
});
