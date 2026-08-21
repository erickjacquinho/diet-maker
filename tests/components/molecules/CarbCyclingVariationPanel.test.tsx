import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CarbCyclingVariationPanel } from '@/components/molecules/CarbCyclingVariationPanel';
import { CarbCyclingVariation } from '@/lib/dietStore';

const mockVariations: CarbCyclingVariation[] = [
  {
    id: 'var-high',
    name: 'Dia Alto',
    type: 'high',
    targetKcal: 2400,
    targetProtein: 160,
    targetCarbs: 300,
    targetFats: 50,
    meals: [],
  },
  {
    id: 'var-med',
    name: 'Dia Médio',
    type: 'medium',
    targetKcal: 2000,
    targetProtein: 160,
    targetCarbs: 200,
    targetFats: 50,
    meals: [],
  },
  {
    id: 'var-low',
    name: 'Dia Baixo',
    type: 'low',
    targetKcal: 1600,
    targetProtein: 160,
    targetCarbs: 100,
    targetFats: 50,
    meals: [],
  },
];

describe('CarbCyclingVariationPanel molecule', () => {
  it('renders variation cards and triggers onSelectVariation when clicked', () => {
    const onSelectVariation = vi.fn();
    const onVariationsCountChange = vi.fn();
    const onCopyMealsBetweenVariations = vi.fn();

    render(
      <CarbCyclingVariationPanel
        variationsCount={3}
        onVariationsCountChange={onVariationsCountChange}
        variations={mockVariations}
        activeVariationId="var-high"
        onSelectVariation={onSelectVariation}
        onCopyMealsBetweenVariations={onCopyMealsBetweenVariations}
      />
    );

    expect(screen.getByText('Variações do Ciclo de Carboidratos')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto')).toBeInTheDocument();
    expect(screen.getByText('Dia Médio')).toBeInTheDocument();
    expect(screen.getByText('Dia Baixo')).toBeInTheDocument();

    // Click Dia Médio
    fireEvent.click(screen.getByText('Dia Médio'));
    expect(onSelectVariation).toHaveBeenCalledWith('var-med');

    // Click Copy button
    fireEvent.click(screen.getByRole('button', { name: /Copiar Refeições/i }));
    expect(onCopyMealsBetweenVariations).toHaveBeenCalledTimes(1);

    // Toggle 2 variations
    fireEvent.click(screen.getByRole('button', { name: /2 Variações/i }));
    expect(onVariationsCountChange).toHaveBeenCalledWith(2);
  });

  it('renders only 2 variations when variationsCount is 2', () => {
    render(
      <CarbCyclingVariationPanel
        variationsCount={2}
        onVariationsCountChange={vi.fn()}
        variations={mockVariations}
        activeVariationId="var-high"
        onSelectVariation={vi.fn()}
      />
    );

    expect(screen.getByText('Dia Alto')).toBeInTheDocument();
    expect(screen.getByText('Dia Baixo')).toBeInTheDocument();
    expect(screen.queryByText('Dia Médio')).not.toBeInTheDocument();
  });
});