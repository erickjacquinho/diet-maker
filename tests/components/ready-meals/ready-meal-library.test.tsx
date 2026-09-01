import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CreateReadyMealModal } from '@/components/molecules/CreateReadyMealModal';

describe('ready meal library surface', () => {
  it('blocks an empty template and exposes the field-level action message', () => {
    render(<CreateReadyMealModal open onOpenChange={vi.fn()} onSave={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Nome do Bloco de Refeição'), { target: { value: 'Café rápido' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Refeição/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('Adicione pelo menos um alimento');
  });
});
