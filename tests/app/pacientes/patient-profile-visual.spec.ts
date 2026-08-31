import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import {
  PATIENT_PROFILE_ASSESSMENTS,
  PATIENT_PROFILE_DIETS,
  PATIENT_PROFILE_FIXTURES,
} from '../../fixtures/patient-profile';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { makePatientProfileState } from './profileState';

const push = vi.fn();
const router = { push, replace: vi.fn() };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: PATIENT_PROFILE_FIXTURES.patient.id }),
  useRouter: () => router,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    React.createElement('a', { href, ...props }, children)
  ),
}));

vi.mock('@/hooks/usePatientProfilePage', () => ({
  usePatientProfilePage: vi.fn(),
}));

const mockUsePatientProfilePage = vi.mocked(usePatientProfilePage);

describe('PatientDetailPage desktop visual contracts', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    push.mockClear();
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState());
  });

  it('scenario A keeps the current context primary and the plan empty state honest', async () => {
    render(React.createElement(PatientDetailPage));

    expect(await screen.findByRole('heading', { name: 'Indicadores atuais' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plano alimentar atual' })).toBeInTheDocument();
    expect(screen.getByText('Nenhuma dieta ativa está vinculada a este paciente.')).toBeInTheDocument();
    expect(screen.queryByText('2020 kcal')).not.toBeInTheDocument();
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('scenario B shows only the compact active plan summary', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      activePlan: {
        dietId: 'diet-current',
        name: 'Plano cutting agosto',
        date: '04/08/2026',
        status: 'Ativa',
        targetKcal: 2020,
        proteinG: 150,
        carbsG: 220,
        fatsG: 60,
      },
    }));

    render(React.createElement(PatientDetailPage));

    expect(await screen.findByText('Plano ativo')).toBeInTheDocument();
    const planSummary = within(screen.getByLabelText('Plano alimentar atual'));
    expect(planSummary.getByText(/P\s*150g/)).toBeInTheDocument();
    expect(planSummary.getByText(/C\s*220g/)).toBeInTheDocument();
    expect(planSummary.getByText(/G\s*60g/)).toBeInTheDocument();
    expect(planSummary.getByText(/2020/)).toBeInTheDocument();
    expect(planSummary.getByRole('link', { name: 'Abrir dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/diet-current',
    );
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('scenario C keeps the longitudinal history below the current context', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      bodyAssessments: PATIENT_PROFILE_ASSESSMENTS,
      latestAssessment: PATIENT_PROFILE_ASSESSMENTS[1],
      confirmedPlans: [PATIENT_PROFILE_DIETS[1]],
      activePlan: {
        dietId: PATIENT_PROFILE_DIETS[1].id,
        name: PATIENT_PROFILE_DIETS[1].name,
        date: PATIENT_PROFILE_DIETS[1].date,
        status: 'Ativa',
        targetKcal: PATIENT_PROFILE_DIETS[1].targetKcal,
        proteinG: PATIENT_PROFILE_DIETS[1].proteinG,
        carbsG: PATIENT_PROFILE_DIETS[1].carbsG,
        fatsG: PATIENT_PROFILE_DIETS[1].fatsG,
      },
    }));

    render(React.createElement(PatientDetailPage));

    const assessmentsTable = await screen.findByRole('table', { name: /Histórico de avaliações físicas/ });
    expect(assessmentsTable).toBeInTheDocument();
    const dietsTable = screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ });
    expect(dietsTable).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Indicadores atuais' })).toBeInTheDocument();
  });
});
