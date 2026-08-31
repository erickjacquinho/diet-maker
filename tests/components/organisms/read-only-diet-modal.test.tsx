import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReadOnlyDietModal } from '@/components/organisms/diets/ReadOnlyDietModal';
import type { DietPlan } from '@/lib/domain/diets/diet-model';
import { historicalDietFixture } from '../../fixtures/diets';

describe('ReadOnlyDietModal', () => {
  it('renders the complete frozen aggregate without edit/delete actions or recalculating reference energy', () => {
    const onClose = vi.fn();
    render(<ReadOnlyDietModal isOpen onClose={onClose} diet={historicalDietFixture} patientName="Ana" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Prescrição histórica')).toBeInTheDocument();
    expect(screen.getByText('Arroz, tipo 1, cozido')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('128') && content.includes('kcal'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar|excluir/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar Visualização' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows every meal option and substitute as read-only content', () => {
    const diet = structuredClone(historicalDietFixture) as DietPlan;
    diet.variations[0].meals[0].options.push({ id: 'option-2', position: 1, label: 'Substituição', countsTowardTotals: false, items: [{ id: 'item-2', position: 0, role: 'SUBSTITUTE', parentItemId: 'item-simple-rice', name: 'Batata inglesa, cozida', snapshot: { ...diet.variations[0].meals[0].options[0].items[0].snapshot, displayName: 'Batata inglesa, cozida' } }] });
    render(<ReadOnlyDietModal isOpen onClose={vi.fn()} diet={diet} />);
    expect(screen.getByText('Substituição')).toBeInTheDocument();
    expect(screen.getByText('Batata inglesa, cozida')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).queryByRole('textbox')).not.toBeInTheDocument();
  });
});
