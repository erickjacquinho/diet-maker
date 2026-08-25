import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PatientDietsTable } from '@/components/organisms/patient/PatientDietsTable';
import type { HistoricalDiet } from '@/lib/patientsStore';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PatientDietsTable', () => {
  const mockDiets: HistoricalDiet[] = [
    {
      id: 'diet-1',
      name: 'Plano cutting agosto',
      date: '23/08/2026',
      targetKcal: 2020,
      proteinG: 150,
      carbsG: 220,
      fatsG: 60,
      status: 'Ativa',
    },
    {
      id: 'diet-2',
      name: 'Dieta Manutenção Julho',
      date: '10/07/2026',
      targetKcal: 2400,
      proteinG: 160,
      carbsG: 280,
      fatsG: 70,
      status: 'Histórica',
    },
  ];

  it('renders empty state when no diets exist', () => {
    render(<PatientDietsTable patientId="p1" diets={[]} onOpenReadOnlyDiet={vi.fn()} />);

    expect(
      screen.getByText('Nenhuma prescrição dietética registrada para este paciente até o momento.'),
    ).toBeInTheDocument();
  });

  it('renders table columns, status badges and macros correctly', () => {
    render(<PatientDietsTable patientId="p1" diets={mockDiets} onOpenReadOnlyDiet={vi.fn()} />);

    expect(screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ })).toBeInTheDocument();
    expect(screen.getByText('Plano cutting agosto')).toBeInTheDocument();
    expect(screen.getByText('Plano Ativo')).toBeInTheDocument();
    expect(screen.getByText('2020 kcal')).toBeInTheDocument();
    expect(screen.getByText(/P\s*150g/)).toBeInTheDocument();
    expect(screen.getByText(/C\s*220g/)).toBeInTheDocument();
    expect(screen.getByText(/G\s*60g/)).toBeInTheDocument();

    expect(screen.getByText('Dieta Manutenção Julho')).toBeInTheDocument();
    expect(screen.getByText('Histórica')).toBeInTheDocument();
    expect(screen.getByText('2400 kcal')).toBeInTheDocument();
  });

  it('triggers onOpenReadOnlyDiet when "Ver Cardápio" button is clicked', () => {
    const handleOpen = vi.fn();
    render(<PatientDietsTable patientId="p1" diets={mockDiets} onOpenReadOnlyDiet={handleOpen} />);

    const buttons = screen.getAllByRole('button', { name: /Ver cardápio completo da dieta/ });
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    expect(handleOpen).toHaveBeenCalledTimes(1);
    expect(handleOpen).toHaveBeenCalledWith(mockDiets[0]);
  });

  it('triggers onDeleteDiet when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <PatientDietsTable
        patientId="p1"
        diets={mockDiets}
        onOpenReadOnlyDiet={vi.fn()}
        onDeleteDiet={handleDelete}
      />,
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Excluir prescrição/ });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(mockDiets[0]);
  });
});
