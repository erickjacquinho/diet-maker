import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import {
  PATIENT_PROFILE_ASSESSMENTS,
  PATIENT_PROFILE_CARB_CYCLING_VARIATIONS,
  PATIENT_PROFILE_DIETS,
  PATIENT_PROFILE_FIXTURES,
} from '../../fixtures/patient-profile';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { makePatientProfileState } from './profileState';

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

vi.mock('@/hooks/usePatientProfilePage', () => ({
  usePatientProfilePage: vi.fn(),
}));

const mockUsePatientProfilePage = vi.mocked(usePatientProfilePage);

describe('PatientDetailPage history with two stacked tables', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState());
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
    const state = makePatientProfileState({
      bodyAssessments: [{
        id: 'asm-1',
        date: '04/08/2026',
        weightKg: 80,
        bodyFatPercent: 15,
        muscleMassKg: 35,
        waistCm: 80,
        abdomenCm: 82,
      }],
      latestAssessment: {
        id: 'asm-1',
        date: '04/08/2026',
        weightKg: 80,
        bodyFatPercent: 15,
        muscleMassKg: 35,
        waistCm: 80,
        abdomenCm: 82,
      },
      confirmedPlans: [{
        id: 'diet-1',
        name: 'Plano cutting agosto',
        date: '04/08/2026',
        status: 'Ativa',
        targetKcal: 2020,
        proteinG: 150,
        carbsG: 220,
        fatsG: 60,
      }],
    });
    mockUsePatientProfilePage.mockReturnValue(state);

    render(<PatientDetailPage />);

    // 1. Tabela de Avaliações Físicas
    const assessmentsTable = await screen.findByRole('table', {
      name: /Histórico de avaliações físicas/,
    });
    expect(assessmentsTable).toBeInTheDocument();
    expect(within(assessmentsTable).getByText('80 kg')).toBeInTheDocument();
    expect(within(assessmentsTable).getByText('15%')).toBeInTheDocument();
    expect(within(assessmentsTable).getByText('35 kg')).toBeInTheDocument();

    // Expansão de detalhes na tabela de avaliações
    const detailsBtn = screen.getByRole('button', { name: 'Detalhes' });
    fireEvent.click(detailsBtn);
    expect(screen.getByText(/Circunferências & Perímetros Corporais/)).toBeInTheDocument();
    expect(within(assessmentsTable).getByText('82 cm')).toBeInTheDocument();

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
    expect(state.handleOpenReadOnlyDietModal).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Plano cutting agosto',
    }));
  });

  it('renders carb cycling averages and variation details in the diet history', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      confirmedPlans: [{
        id: 'diet-cycle',
        name: 'Plano ciclo agosto',
        date: '24/08/2026',
        targetKcal: 2100,
        proteinG: 180,
        carbsG: 197,
        fatsG: 55,
        status: 'Ativa',
        mode: 'carb_cycling',
        carbCyclingVariations: [
          { ...PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.one[0], id: 'high', name: 'Dia Alto Carbo' },
          { ...PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.one[0], id: 'low', name: 'Dia Baixo Carbo', type: 'low', targetKcal: 1950, carbsG: 150 },
        ],
      }],
    }));

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
    const storedVariations = PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.four;

    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      confirmedPlans: [{
        id: 'diet-cycle-four',
        name: 'Plano ciclo quatro variações',
        date: '24/08/2026',
        targetKcal: 2100,
        proteinG: 180,
        carbsG: 207,
        fatsG: 62,
        status: 'Ativa',
        mode: 'carb_cycling',
        carbCyclingVariations: storedVariations,
      }],
    }));

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

  it('keeps historical prescriptions read-only without delete or edit controls', async () => {
    const state = makePatientProfileState({ confirmedPlans: [{ ...PATIENT_PROFILE_DIETS[1], status: 'Histórica' }] });
    mockUsePatientProfilePage.mockReturnValue(state);

    render(<PatientDetailPage />);

    const dietsTable = await screen.findByRole('table', {
      name: /Histórico de prescrições dietéticas/,
    });
    expect(dietsTable).toBeInTheDocument();
    expect(within(dietsTable).queryByText('Plano cutting agosto')).not.toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /Excluir prescrição/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Editar Plano cutting agosto/ })).not.toBeInTheDocument();
  });

  it('limits profile histories to 10 rows and links to their paginated full-history pages', () => {
    const assessments = Array.from({ length: 26 }, (_, index) => ({
      ...PATIENT_PROFILE_ASSESSMENTS[0],
      id: `assessment-${index}`,
      version: 1,
      abdomenCm: 82,
    }));
    const diets = Array.from({ length: 26 }, (_, index) => ({
      ...PATIENT_PROFILE_DIETS[1],
      id: `diet-${index}`,
      name: `Plano ${index}`,
    }));
    const state = makePatientProfileState({
      bodyAssessments: assessments.slice(0, 10),
      assessmentTotal: assessments.length,
      confirmedPlans: diets.slice(0, 10),
      dietTotal: diets.length,
    });
    mockUsePatientProfilePage.mockReturnValue(state);

    render(<PatientDetailPage />);

    expect(screen.getByText('26 avaliações')).toBeInTheDocument();
    expect(screen.getByText('26 planos')).toBeInTheDocument();
    expect(within(screen.getByRole('table', { name: /Histórico de avaliações físicas/ })).getAllByRole('row')).toHaveLength(11);
    expect(within(screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ })).getAllByRole('row')).toHaveLength(11);
    expect(screen.getAllByRole('link', { name: 'Editar Avaliação Física' })).toHaveLength(10);
    expect(screen.getByRole('button', { name: /Ver cardápio completo da dieta Plano 0/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver histórico completo de prescrições dietéticas' }))
      .toHaveAttribute('href', '/pacientes/patient-profile-1/dietas');
    expect(screen.getByRole('link', { name: 'Ver histórico completo de avaliações físicas' }))
      .toHaveAttribute('href', '/pacientes/patient-profile-1/avaliacoes');
    expect(screen.queryByRole('button', { name: /página/i })).not.toBeInTheDocument();
  });

  it('shows independent empty and read-error states for remote histories', () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      confirmedPlans: [],
      bodyAssessments: [],
      dietTotal: 0,
      assessmentTotal: 0,
      dietsError: 'Falha ao ler dietas.',
      assessmentsError: null,
    } as never));

    render(<PatientDetailPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao ler dietas.');
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma avaliação física registrada');
  });
});
