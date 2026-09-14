import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreateReadyMealModal } from '@/components/organisms/CreateReadyMealModal';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn().mockResolvedValue({
  listCustomFoods: vi.fn().mockResolvedValue([]),
  listRecipes: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));

describe('ready meal library surface', () => {
  it('shows the meal macro summary and opens the shared food picker', () => {
    render(<CreateReadyMealModal open onOpenChange={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByTestId('macro-proportion-bar')).toBeInTheDocument();
    expect(screen.getByLabelText('Horário')).toHaveAttribute('type', 'time');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Alimento' }));

    expect(screen.getByText(/Adicionar à Refeição "Refeição"/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Alimentos Incluídos (Resumo)')).not.toBeInTheDocument();
  });

  it('blocks an empty template and exposes the field-level action message', () => {
    render(<CreateReadyMealModal open onOpenChange={vi.fn()} onSave={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Nome da Refeição'), { target: { value: 'Café rápido' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Refeição/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('Adicione pelo menos um alimento');
  });

  it('confirms before discarding dirty changes from a backdrop click', async () => {
    const onOpenChange = vi.fn();

    render(<CreateReadyMealModal open onOpenChange={onOpenChange} onSave={vi.fn()} />);

    const name = screen.getByRole('textbox', { name: 'Nome da Refeição' });
    fireEvent.change(name, { target: { value: 'Refeição alterada' } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const overlay = document.querySelector('[data-state="open"].z-overlay');
    expect(overlay).toBeInTheDocument();
    fireEvent.pointerDown(overlay!, { button: 0, pointerType: 'mouse' });
    fireEvent.click(overlay!, { button: 0 });

    expect(await screen.findByRole('heading', { name: 'Descartar alterações?' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Continuar editando' }));
    expect(name).toHaveValue('Refeição alterada');
  });
});
