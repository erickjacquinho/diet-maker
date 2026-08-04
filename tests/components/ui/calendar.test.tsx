import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Calendar } from '@/components/ui/calendar';

function getDayButton(day: number) {
  const buttons = screen.getAllByRole('button');
  const button = buttons.find((candidate) => candidate.textContent?.trim() === String(day));

  if (!button) {
    throw new Error(`Day button ${day} was not found`);
  }

  return button;
}

describe('Calendar', () => {
  it('exposes a controlled single-date selection', () => {
    const onSelect = vi.fn();
    const selected = new Date(2026, 7, 3);

    render(<Calendar mode="single" month={selected} selected={selected} onSelect={onSelect} />);

    const grid = screen.getByRole('grid');
    const selectedDay = within(grid)
      .getAllByRole('button')
      .find((button) => button.getAttribute('data-selected-single') === 'true');

    expect(selectedDay).toBeDefined();
    expect(selectedDay).toHaveTextContent('3');

    fireEvent.click(getDayButton(10));

    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0]?.[0]).toEqual(new Date(2026, 7, 10));
  });

  it('keeps disabled days unavailable to selection', () => {
    const onSelect = vi.fn();
    const selected = new Date(2026, 7, 3);

    render(
      <Calendar
        mode="single"
        month={selected}
        selected={selected}
        onSelect={onSelect}
        disabled={{ before: new Date(2026, 7, 3) }}
      />,
    );

    const grid = screen.getByRole('grid');
    const disabledDay = within(grid).getAllByRole('button').find((button) => button.textContent?.trim() === '2');

    expect(disabledDay).toBeDisabled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('accepts the pt-BR locale without changing the selection contract', () => {
    const onSelect = vi.fn();
    const selected = new Date(2026, 7, 3);
    const locale = {
      code: 'pt-BR',
    } as never;

    render(<Calendar mode="single" month={selected} selected={selected} onSelect={onSelect} locale={locale} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('supports keyboard focus movement and exposes selected semantics', () => {
    const selected = new Date(2026, 7, 3);

    render(<Calendar mode="single" month={selected} selected={selected} onSelect={vi.fn()} autoFocus />);

    const grid = screen.getByRole('grid');
    const selectedDay = within(grid)
      .getAllByRole('button')
      .find((button) => button.getAttribute('data-selected-single') === 'true');

    expect(selectedDay).toBeDefined();
    expect(selectedDay).toHaveAttribute('aria-label', expect.stringMatching(/selected/i));

    selectedDay?.focus();
    fireEvent.keyDown(selectedDay as HTMLElement, { key: 'ArrowRight' });

    expect(document.activeElement).toHaveAttribute('data-day', '04/08/2026');
  });
});
