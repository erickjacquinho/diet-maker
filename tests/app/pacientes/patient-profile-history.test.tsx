import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import {
  PATIENT_PROFILE_ASSESSMENTS,
  PATIENT_PROFILE_FIXTURES,
} from '../../fixtures/patient-profile';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: PATIENT_PROFILE_FIXTURES.patient.id }),
  useRouter: () => ({ push }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PatientDetailPage history with two stacked tables', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([PATIENT_PROFILE_FIXTURES.patient]),
    );
  });

  it('renders both empty states cleanly with contextual creation links', async () => {
    render(<PatientDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Nenhuma avaliação física registrada para este paciente até o momento.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Nenhuma prescrição dietética registrada para este paciente até o momento.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Nova Avaliação' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/avaliacao/nova',
    );
    expect(screen.getByRole('link', { name: 'Nova Dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/nova',
    );
  });

  it('renders two specialized tables when assessments and diets exist', async () => {
    localStorage.setItem(
      `nutridiet_assessments_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([
        {
          id: 'asm-1',
          date: '04/08/2026',
          weightKg: 80,
          bodyFatPercent: 15,
          muscleMassKg: 35,
          waistCm: 80,
          abdomenCm: 82,
        },
      ]),
    );
    localStorage.setItem(
      `nutridiet_diets_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([
        {
          id: 'diet-1',
          name: 'Plano cutting agosto',
          date: '04/08/2026',
          status: 'Ativa',
          targetKcal: 2020,
          proteinG: 150,
          carbsG: 220,
          fatsG: 60,
        },
      ]),
    );

    render(<PatientDetailPage />);

    // 1. Tabela de Avaliações Físicas
    const assessmentsTable = await screen.findByRole('table', {
      name: /Histórico de avaliações físicas/,
    });
    expect(assessmentsTable).toBeInTheDocument();
    expect(screen.getByText('80 kg')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('35 kg')).toBeInTheDocument();

    // Expansão de detalhes na tabela de avaliações
    const detailsBtn = screen.getByRole('button', { name: 'Detalhes' });
    fireEvent.click(detailsBtn);
    expect(screen.getByText(/Circunferências & Perímetros Corporais/)).toBeInTheDocument();
    expect(screen.getByText('82 cm')).toBeInTheDocument();

    // 2. Tabela de Prescrições Dietéticas
    const dietsTable = screen.getByRole('table', {
      name: /Histórico de prescrições dietéticas/,
    });
    expect(dietsTable).toBeInTheDocument();
    expect(screen.getByText('Plano cutting agosto')).toBeInTheDocument();
    expect(screen.getByText('Plano Ativo')).toBeInTheDocument();
    expect(screen.getByText('2020 kcal')).toBeInTheDocument();
    expect(screen.getByText(/P\s*150g/)).toBeInTheDocument();

    // Abertura do modal de cardápio
    const verCardapioBtn = screen.getByRole('button', {
      name: /Ver cardápio completo da dieta Plano cutting agosto/,
    });
    fireEvent.click(verCardapioBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens confirmation modal and deletes a prescription diet from history', async () => {
    localStorage.setItem(
      `nutridiet_diets_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([
        {
          id: 'diet-1',
          name: 'Plano cutting agosto',
          date: '04/08/2026',
          status: 'Ativa',
          targetKcal: 2020,
          proteinG: 150,
          carbsG: 220,
          fatsG: 60,
        },
      ]),
    );

    render(<PatientDetailPage />);

    const dietsTable = await screen.findByRole('table', {
      name: /Histórico de prescrições dietéticas/,
    });
    expect(dietsTable).toBeInTheDocument();
    expect(screen.getByText('Plano cutting agosto')).toBeInTheDocument();

    // Clica no botão de excluir ao lado de editar
    const deleteBtn = screen.getByRole('button', {
      name: /Excluir prescrição Plano cutting agosto/,
    });
    fireEvent.click(deleteBtn);

    // Modal de confirmação
    expect(
      screen.getByRole('dialog', { name: /Confirmar Exclusão de Prescrição/ }),
    ).toBeInTheDocument();

    // Clica em confirmar exclusão
    const confirmBtn = screen.getByRole('button', { name: 'Sim, Excluir Prescrição' });
    fireEvent.click(confirmBtn);

    // Dieta removida da tabela e estado vazio renderizado
    await waitFor(() => {
      expect(
        screen.getByText('Nenhuma prescrição dietética registrada para este paciente até o momento.'),
      ).toBeInTheDocument();
    });
  });
});
