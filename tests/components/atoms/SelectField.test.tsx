import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SelectField } from '@/components/atoms/SelectField';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

const SAMPLE_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
];

describe('SelectField', () => {
  it('renders label and placeholder correctly', () => {
    render(
      <SelectField
        id="gender-select"
        label="Gênero"
        placeholder="Selecione o gênero"
        options={SAMPLE_OPTIONS}
      />,
    );

    expect(screen.getByText('Gênero')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Selecione o gênero')).toBeInTheDocument();
  });

  it('renders selected value and triggers onValueChange on option click', async () => {
    const handleValueChange = vi.fn();
    render(
      <SelectField
        id="gender-select"
        label="Gênero"
        value="masculino"
        onValueChange={handleValueChange}
        options={SAMPLE_OPTIONS}
      />,
    );

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveTextContent('Masculino');

    fireEvent.click(combobox);
    const option = await waitFor(() => screen.getByRole('option', { name: 'Feminino' }));
    fireEvent.click(option);

    expect(handleValueChange).toHaveBeenCalledWith('feminino');
  });

  it('supports disabled state', () => {
    render(
      <SelectField
        id="gender-select"
        label="Gênero"
        disabled
        options={SAMPLE_OPTIONS}
      />,
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders error message when state is error', () => {
    render(
      <SelectField
        id="gender-select"
        label="Gênero"
        state="error"
        errorMessage="Campo obrigatório"
        options={SAMPLE_OPTIONS}
      />,
    );

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('supports compact size', () => {
    render(
      <SelectField
        id="gender-select"
        size="compact"
        options={SAMPLE_OPTIONS}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveClass('h-control-compact');
  });
});
