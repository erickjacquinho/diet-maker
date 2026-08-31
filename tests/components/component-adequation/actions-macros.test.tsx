import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DeleteIconButton,
  EditIconButton,
  IconButton,
} from '@/components/atoms/IconButton';
import { MacroProportionBar } from '@/components/molecules/MacroProportionBar';
import {
  MacroNutrientSummary,
  MacroSummary,
} from '@/components/molecules/MacroSummary';

describe('component adequation: actions and macro presentation', () => {
  it('keeps icon actions named, focusable, ref-compatible and keyboard-ready', () => {
    const onClick = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <>
        <IconButton
          ref={ref}
          icon={<span aria-hidden="true">i</span>}
          aria-label="Abrir detalhes"
          onClick={onClick}
        />
        <EditIconButton />
        <DeleteIconButton />
        <IconButton aria-label="Ação indisponível" disabled />
      </>,
    );

    const customAction = screen.getByRole('button', { name: 'Abrir detalhes' });
    expect(customAction).toBeInTheDocument();
    expect(ref.current).toBe(customAction);
    expect(screen.getByRole('button', { name: 'Editar' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Ação indisponível' })).toBeDisabled();

    customAction.focus();
    expect(customAction).toHaveFocus();
    fireEvent.keyDown(customAction, { key: 'Enter' });
    fireEvent.click(customAction);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('preserves canonical macro order, units, precision and derived percentages', () => {
    render(
      <MacroProportionBar
        proteinG={32.56}
        carbsG={48}
        fatsG={12}
        kcal={436}
      />,
    );

    const bar = screen.getByTestId('macro-proportion-bar');
    const columns = within(screen.getByTestId('macro-proportion-columns')).getAllByTitle(
      /Proteínas|Carboidratos|Gorduras|Calorias Totais/,
    );

    expect(columns.map((column) => column.getAttribute('title'))).toEqual([
      'Proteínas',
      'Carboidratos',
      'Gorduras',
      'Calorias Totais',
    ]);
    expect(bar).toHaveTextContent('32.6g');
    expect(bar).toHaveTextContent('48g');
    expect(bar).toHaveTextContent('12g');
    expect(within(columns[3]).getByText('436')).toBeInTheDocument();

    const segmentWidths = Array.from(
      screen.getByRole('progressbar').querySelectorAll('rect'),
    ).map((segment) => Number(segment.getAttribute('width')));
    expect(segmentWidths.reduce((total, width) => total + width, 0)).toBe(100);
  });

  it('distinguishes an explicitly supplied zero kcal from an omitted kcal value', () => {
    const { rerender } = render(
      <MacroProportionBar proteinG={30} carbsG={40} fatsG={10} kcal={0} />,
    );

    expect(
      within(screen.getByTitle('Calorias Totais')).getByText('0'),
    ).toBeInTheDocument();

    rerender(
      <MacroProportionBar proteinG={30} carbsG={40} fatsG={10} />,
    );
    expect(
      within(screen.getByTitle('Calorias Totais')).getByText('370'),
    ).toBeInTheDocument();
  });

  it('keeps zero values distinct from absent values in the summary and preserves the alias', () => {
    expect(MacroNutrientSummary).toBe(MacroSummary);

    render(
      <>
        <MacroSummary
          protein={0}
          carbs={0}
          fats={0}
          kcal={0}
          data-testid="zero-summary"
        />
        <MacroNutrientSummary
          protein={null}
          carbs={undefined}
          fats={null}
          kcal={undefined}
          data-testid="absent-summary"
        />
      </>,
    );

    expect(screen.getByTestId('zero-summary')).toHaveTextContent('P 0g');
    expect(screen.getByTestId('zero-summary')).toHaveTextContent('C 0g');
    expect(screen.getByTestId('zero-summary')).toHaveTextContent('G 0g');
    expect(screen.getByTestId('zero-summary')).toHaveTextContent('0 kcal');
    expect(screen.getByTestId('absent-summary')).toHaveTextContent('P —');
    expect(screen.getByTestId('absent-summary')).toHaveTextContent('C —');
    expect(screen.getByTestId('absent-summary')).toHaveTextContent('G —');
    expect(screen.getByTestId('absent-summary')).not.toHaveTextContent('kcal');
  });
});
