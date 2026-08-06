import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DietModeSwitcher, DietModeSwitcherProps } from '@/components/molecules/DietModeSwitcher';

const variations: DietModeSwitcherProps['variations'] = [
  {
    id: 'var-high',
    name: 'Dia Alto Carbo',
    type: 'high',
    targetKcal: 2200,
    targetCarbs: 250,
    targetProtein: 160,
    targetFats: 60,
    meals: [],
  },
  {
    id: 'var-low',
    name: 'Dia Baixo Carbo',
    type: 'low',
    targetKcal: 1800,
    targetCarbs: 120,
    targetProtein: 160,
    targetFats: 70,
    meals: [],
  },
  {
    id: 'var-medium',
    name: 'Dia Médio Carbo',
    type: 'medium',
    targetKcal: 2000,
    targetCarbs: 180,
    targetProtein: 160,
    targetFats: 65,
    meals: [],
  },
];

const makeProps = (overrides: Partial<DietModeSwitcherProps> = {}): DietModeSwitcherProps => ({
  mode: 'simple',
  onModeChange: vi.fn(),
  variationsCount: 2,
  onVariationsCountChange: vi.fn(),
  variations,
  activeVariationId: 'var-high',
  onSelectVariation: vi.fn(),
  onCopyMealsBetweenVariations: vi.fn(),
  ...overrides,
});

describe('DietModeSwitcher', () => {
  it('keeps cycle-only controls hidden in simple mode', () => {
    render(<DietModeSwitcher {...makeProps()} />);

    expect(screen.getByRole('group', { name: 'Modelo de dieta' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dieta Simples' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText('Número de variações')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copiar Refeições/ })).not.toBeInTheDocument();
  });

  it('moves the mode focus and callback with horizontal arrow keys', () => {
    const onModeChange = vi.fn();
    render(<DietModeSwitcher {...makeProps({ onModeChange })} />);

    const simpleMode = screen.getByRole('radio', { name: 'Dieta Simples' });
    const carbCyclingMode = screen.getByRole('radio', { name: 'Ciclo de Carboidratos' });

    fireEvent.keyDown(simpleMode, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(onModeChange).toHaveBeenCalledWith('carb_cycling');
    expect(carbCyclingMode).toHaveFocus();

    fireEvent.keyDown(carbCyclingMode, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(onModeChange).toHaveBeenCalledWith('simple');
    expect(simpleMode).toHaveFocus();
  });

  it('reveals cycle controls in the same context and preserves the selected variation', () => {
    const onVariationsCountChange = vi.fn();
    const onSelectVariation = vi.fn();
    const onCopyMealsBetweenVariations = vi.fn();

    render(
      <DietModeSwitcher
        {...makeProps({
          mode: 'carb_cycling',
          onVariationsCountChange,
          onSelectVariation,
          onCopyMealsBetweenVariations,
        })}
      />,
    );

    const group = screen.getByRole('group', { name: 'Modelo de dieta' });
    expect(within(group).getByRole('radio', { name: 'Ciclo de Carboidratos' })).toHaveAttribute('aria-checked', 'true');
    expect(within(group).getByText('Número de variações')).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /2 variações/i })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /3 variações/i })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'Copiar Refeições entre Dias' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /Dia Alto Carbo/i })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(within(group).getByRole('button', { name: /3 variações/i }));
    fireEvent.click(within(group).getByRole('button', { name: /Dia Baixo Carbo/i }));
    fireEvent.click(within(group).getByRole('button', { name: 'Copiar Refeições entre Dias' }));

    expect(onVariationsCountChange).toHaveBeenCalledWith(3);
    expect(onSelectVariation).toHaveBeenCalledWith('var-low');
    expect(onCopyMealsBetweenVariations).toHaveBeenCalledTimes(1);
  });
});
