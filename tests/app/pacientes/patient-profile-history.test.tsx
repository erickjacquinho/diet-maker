import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import {
  PATIENT_PROFILE_ASSESSMENTS,
  PATIENT_PROFILE_CARB_CYCLING_VARIATIONS,
  PATIENT_PROFILE_FIXTURES,
} from '../../fixtures/patient-profile';

const push = vi.fn();
const replace = vi.fn();
const router = { push, replace };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: PATIENT_PROFILE_FIXTURES.patient.id }),
  useRouter: () => router,
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
    replace.mockClear();
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
          simpleTargetKcal: 2020,
          simpleTargetProtein: 150,
          simpleTargetCarbs: 220,
          simpleTargetFats: 60,
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
    expect(within(dietsTable).getByText('Simples')).toBeInTheDocument();
    expect(within(dietsTable).queryByText('Plano cutting agosto')).not.toBeInTheDocument();
    expect(within(dietsTable).getByText('Ativo')).toBeInTheDocument();
    expect(within(dietsTable).getByRole('cell', { name: /2020\s+kcal/ })).toBeInTheDocument();
    expect(within(dietsTable).getByText(/P\s*150g/)).toBeInTheDocument();

    // Abertura do modal de cardápio
    const verCardapioBtn = screen.getByRole('button', {
      name: /Ver cardápio completo da dieta Plano cutting agosto/,
    });
    fireEvent.click(verCardapioBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders carb cycling averages and variation details in the diet history', async () => {
    localStorage.setItem(
      `nutridiet_diets_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([
        {
          id: 'diet-cycle',
          patientId: PATIENT_PROFILE_FIXTURES.patient.id,
          name: 'Plano ciclo agosto',
          createdAt: '24/08/2026',
          updatedAt: '24/08/2026',
          mode: 'carb_cycling',
          simpleTargetKcal: 0,
          simpleTargetProtein: 0,
          simpleTargetCarbs: 0,
          simpleTargetFats: 0,
          simpleMeals: [],
          carbCyclingVariationsCount: 2,
          carbCyclingVariations: [
            {
              id: 'high',
              name: 'Dia Alto Carbo',
              type: 'high',
              assignedDays: ['seg', 'qua', 'sex'],
              targetKcal: 2300,
              targetProtein: 180,
              targetCarbs: 260,
              targetFats: 55,
              meals: [],
            },
            {
              id: 'low',
              name: 'Dia Baixo Carbo',
              type: 'low',
              assignedDays: ['ter', 'qui', 'sab', 'dom'],
              targetKcal: 1950,
              targetProtein: 180,
              targetCarbs: 150,
              targetFats: 55,
              meals: [],
            },
          ],
        },
      ]),
    );

    render(<PatientDetailPage />);

    const dietsTable = await screen.findByRole('table', {
      name: /Histórico de prescrições dietéticas/,
    });
    expect(within(dietsTable).getByText('Ciclo de carboidratos')).toBeInTheDocument();
    expect(within(dietsTable).getByText('2100 kcal')).toBeInTheDocument();
    expect(within(dietsTable).getByText(/C\s*197g/)).toBeInTheDocument();

    fireEvent.click(
      within(dietsTable).getByRole('button', { name: 'Ver variações de Plano ciclo agosto' }),
    );

    expect(within(dietsTable).getByText('Variações do ciclo')).toBeInTheDocument();
    expect(within(dietsTable).getByText('Dia Alto Carbo')).toBeInTheDocument();
    expect(within(dietsTable).getByText(/Tipo\s+Alto/)).toBeInTheDocument();
    expect(within(dietsTable).getByText('Dia Baixo Carbo')).toBeInTheDocument();
    expect(within(dietsTable).getByText(/Tipo\s+Baixo/)).toBeInTheDocument();
  });

  it('keeps the weighted parent summary while displaying four stored variations as rows', async () => {
    const storedVariations = PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.four.map((variation) => ({
      id: variation.id,
      name: variation.name,
      type: variation.type,
      assignedDays: variation.assignedDays,
      targetKcal: variation.targetKcal,
      targetProtein: variation.proteinG,
      targetCarbs: variation.carbsG,
      targetFats: variation.fatsG,
      meals: Array.from({ length: variation.mealsCount }, (_, index) => ({
        id: `${variation.id}-meal-${index + 1}`,
        name: `Refeição ${index + 1}`,
        time: '08:00',
        items: [],
      })),
    }));

    localStorage.setItem(
      `nutridiet_diets_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([
        {
          id: 'diet-cycle-four',
          patientId: PATIENT_PROFILE_FIXTURES.patient.id,
          name: 'Plano ciclo quatro variações',
          createdAt: '24/08/2026',
          updatedAt: '24/08/2026',
          mode: 'carb_cycling',
          simpleTargetKcal: 0,
          simpleTargetProtein: 0,
          simpleTargetCarbs: 0,
          simpleTargetFats: 0,
          simpleMeals: [],
          carbCyclingVariations: storedVariations,
        },
      ]),
    );

    render(<PatientDetailPage />);

    const dietsTable = await screen.findByRole('table', {
      name: /Histórico de prescrições dietéticas/,
    });
    expect(within(dietsTable).queryByText('Plano ciclo quatro variações')).not.toBeInTheDocument();
    expect(within(dietsTable).getByText('2100 kcal')).toBeInTheDocument();
    expect(within(dietsTable).getByText(/C\s*207g/)).toBeInTheDocument();

    fireEvent.click(
      within(dietsTable).getByRole('button', {
        name: 'Ver variações de Plano ciclo quatro variações',
      }),
    );

    const variationTable = within(dietsTable).getByRole('table', {
      name: 'Variações do ciclo de Plano ciclo quatro variações',
    });
    expect(within(variationTable).getAllByRole('row')).toHaveLength(5);
    expect(within(variationTable).getByText('Dia Alto')).toBeInTheDocument();
    expect(within(variationTable).getByText(/Tipo\s+Alto/)).toBeInTheDocument();
    expect(within(variationTable).getByText('Dia Moderado')).toBeInTheDocument();
    expect(within(variationTable).getByText(/Tipo\s+Moderado/)).toBeInTheDocument();
    expect(within(variationTable).getByText('Dia Baixo')).toBeInTheDocument();
    expect(within(variationTable).getByText(/Tipo\s+Baixo/)).toBeInTheDocument();
    expect(within(variationTable).getByText('Dia Livre')).toBeInTheDocument();
    expect(within(variationTable).getByText(/Tipo\s+Zero/)).toBeInTheDocument();
    expect(within(variationTable).getByText('Nenhum dia atribuído')).toBeInTheDocument();
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
          simpleTargetKcal: 2020,
          simpleTargetProtein: 150,
          simpleTargetCarbs: 220,
          simpleTargetFats: 60,
        },
      ]),
    );

    render(<PatientDetailPage />);

    const dietsTable = await screen.findByRole('table', {
      name: /Histórico de prescrições dietéticas/,
    });
    expect(dietsTable).toBeInTheDocument();
    expect(within(dietsTable).queryByText('Plano cutting agosto')).not.toBeInTheDocument();

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
    vi.useFakeTimers();
    fireEvent.pointerDown(confirmBtn, { button: 0 });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    vi.useRealTimers();

    // Dieta removida da tabela e estado vazio renderizado
    await waitFor(() => {
      expect(
        screen.getByText('Nenhuma prescrição dietética registrada para este paciente até o momento.'),
      ).toBeInTheDocument();
    });
  });
});
