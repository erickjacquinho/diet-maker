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
    assignedDays: ['seg', 'qua', 'sex'],
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
    assignedDays: ['ter', 'qui'],
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
    assignedDays: ['sab', 'dom'],
    targetKcal: 1600,
    targetProtein: 160,
    targetCarbs: 100,
    targetFats: 50,
    meals: [],
  },
];

describe('CarbCyclingVariationPanel molecule', () => {
  it('renders variation cards, assigned days, and triggers onSelectVariation when clicked', () => {
    const onSelectVariation = vi.fn();
    const onCopyMealsBetweenVariations = vi.fn();
    const onOpenCycleMatrix = vi.fn();
    const onAddVariation = vi.fn();

    render(
      <CarbCyclingVariationPanel
        variations={mockVariations}
        activeVariationId="var-high"
        onSelectVariation={onSelectVariation}
        onCopyMealsBetweenVariations={onCopyMealsBetweenVariations}
        onOpenCycleMatrix={onOpenCycleMatrix}
        onAddVariation={onAddVariation}
      />
    );

    expect(screen.getByText('Variações do Ciclo')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto')).toBeInTheDocument();
    expect(screen.getByText('Dia Médio')).toBeInTheDocument();
    expect(screen.getByText('Dia Baixo')).toBeInTheDocument();
    expect(screen.getByText(/Seg, Qua, Sex/i)).toBeInTheDocument();

    // Click Dia Médio
    fireEvent.click(screen.getByText('Dia Médio'));
    expect(onSelectVariation).toHaveBeenCalledWith('var-med');

    // Click Copy button
    fireEvent.click(screen.getByRole('button', { name: /Copiar Refeições/i }));
    expect(onCopyMealsBetweenVariations).toHaveBeenCalledTimes(1);

    // Click Configurar Ciclo
    fireEvent.click(screen.getByRole('button', { name: /Configurar Ciclo/i }));
    expect(onOpenCycleMatrix).toHaveBeenCalledTimes(1);

    // Click Adicionar Dia
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Dia/i }));
    expect(onAddVariation).toHaveBeenCalledTimes(1);
  });

  it('renders dynamic number of variations (e.g. 4 variations)', () => {
    const fourVariations: CarbCyclingVariation[] = [
      ...mockVariations,
      {
        id: 'var-refeed',
        name: 'Dia de Refeed',
        type: 'custom',
        customBadge: 'Refeed',
        targetKcal: 3000,
        targetProtein: 150,
        targetCarbs: 450,
        targetFats: 40,
        meals: [],
      },
    ];

    render(
      <CarbCyclingVariationPanel
        variations={fourVariations}
        activeVariationId="var-high"
        onSelectVariation={vi.fn()}
      />
    );

    expect(screen.getByText('Dia de Refeed')).toBeInTheDocument();
  });

  it('handles Drag and Drop reordering correctly', () => {
    const onReorderVariations = vi.fn();
    render(
      <CarbCyclingVariationPanel
        variations={mockVariations}
        activeVariationId="var-high"
        onSelectVariation={vi.fn()}
        onReorderVariations={onReorderVariations}
      />
    );

    const tabs = screen.getAllByRole('tab');
    const handles = screen.getAllByTitle(/Arrastar para reordenar/i);
    const firstHandle = handles[0];
    const thirdItem = tabs[2];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue('0'),
      effectAllowed: 'move',
      dropEffect: 'move',
    };

    // Drag start on 1st grip handle
    fireEvent.dragStart(firstHandle, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');

    // Drag over 3rd item
    fireEvent.dragOver(thirdItem, { dataTransfer });

    // Drop on 3rd item
    fireEvent.drop(thirdItem, { dataTransfer });

    expect(onReorderVariations).toHaveBeenCalledTimes(1);
    const reordered = onReorderVariations.mock.calls[0][0];
    // Moved index 0 to index 2
    expect(reordered[0].id).toBe('var-med');
    expect(reordered[1].id).toBe('var-low');
    expect(reordered[2].id).toBe('var-high');
  });

  it('handles DragEnd edge case when drag is cancelled outside target', () => {
    render(
      <CarbCyclingVariationPanel
        variations={mockVariations}
        activeVariationId="var-high"
        onSelectVariation={vi.fn()}
      />
    );

    const tabs = screen.getAllByRole('tab');
    const firstItem = tabs[0];
    const handles = screen.getAllByTitle(/Arrastar para reordenar/i);
    const firstHandle = handles[0];

    // Drag start on handle
    fireEvent.dragStart(firstHandle, {
      dataTransfer: { setData: vi.fn(), effectAllowed: 'move' },
    });

    // Drag end (cancelled / dropped outside)
    fireEvent.dragEnd(firstHandle);

    // Item should not have residual opacity-40 dragging class
    expect(firstItem.className).not.toContain('opacity-40');
  });

  it('supports accessible keyboard reordering with Alt + ArrowDown', () => {
    const onReorderVariations = vi.fn();
    render(
      <CarbCyclingVariationPanel
        variations={mockVariations}
        activeVariationId="var-high"
        onSelectVariation={vi.fn()}
        onReorderVariations={onReorderVariations}
      />
    );

    const tabs = screen.getAllByRole('tab');
    const firstItem = tabs[0];

    fireEvent.keyDown(firstItem, { key: 'ArrowDown', altKey: true });
    expect(onReorderVariations).toHaveBeenCalledTimes(1);
    const reordered = onReorderVariations.mock.calls[0][0];
    expect(reordered[0].id).toBe('var-med');
    expect(reordered[1].id).toBe('var-high');
  });
});