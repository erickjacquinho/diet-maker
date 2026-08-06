import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

describe('SelectTrigger', () => {
  it('uses the same canonical field geometry and typography as DatePickerField', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Tipo">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
      </Select>,
    );

    expect(screen.getByRole('combobox', { name: 'Tipo' })).toHaveClass(
      'h-control-standard',
      'rounded-control',
      'text-style-field-value',
    );
  });

  it('preserves the canonical disabled and placeholder states', () => {
    render(
      <Select disabled>
        <SelectTrigger aria-label="Tipo">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
      </Select>,
    );

    expect(screen.getByRole('combobox', { name: 'Tipo' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Tipo' })).toHaveClass('data-[placeholder]:text-text-muted');
  });

  it('places the selected item indicator on the right', async () => {
    render(
      <Select defaultValue="assessment-update">
        <SelectTrigger aria-label="Tipo">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="assessment-update">Atualização de avaliação</SelectItem>
          <SelectItem value="diet-update">Atualização de dieta</SelectItem>
        </SelectContent>
      </Select>,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Tipo' }));
    const popup = await waitFor(() => screen.getByRole('listbox'));
    const selectedItem = await screen.findByRole('option', { name: 'Atualização de avaliação' });

    expect(popup).toHaveClass(
      'rounded-control',
      'border-border-subtle',
      'bg-surface',
      'p-1',
      'text-text-primary',
      'shadow-floating',
    );
    expect(selectedItem).toHaveClass('pr-8', 'pl-2');
    expect(selectedItem).toHaveClass('rounded-control', 'text-style-nav-item', 'data-[state=checked]:bg-primary-soft');
    expect(selectedItem.querySelector('span')).toHaveClass('right-2');
  });
});
