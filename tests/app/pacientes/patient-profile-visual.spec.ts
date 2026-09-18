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

  it('scenario A keeps the progress area clear and shows honest empty states', async () => {
    render(React.createElement(PatientDetailPage));

    expect(await screen.findByRole('region', { name: 'Progresso Atual' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Última Prescrição/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Última avaliação' })).toBeInTheDocument();
    expect(screen.getByText('Nenhuma prescrição registrada.')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma avaliação registrada.')).toBeInTheDocument();
    expect(screen.queryByText('2020 kcal')).not.toBeInTheDocument();
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('scenario B shows the latest diet summary', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      confirmedPlans: [PATIENT_PROFILE_DIETS[1]],
    }));

    render(React.createElement(PatientDetailPage));

    const planSummary = within(await screen.findByRole('region', { name: 'Última Prescrição 04/08/2026' }));
    expect(planSummary.getByText('Ativo')).toBeInTheDocument();
    expect(planSummary.getByText(/P\s*150g/)).toBeInTheDocument();
    expect(planSummary.getByText(/C\s*220g/)).toBeInTheDocument();
    expect(planSummary.getByText(/G\s*60g/)).toBeInTheDocument();
    expect(planSummary.getByText(/2\.020/)).toBeInTheDocument();
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
    }));

    render(React.createElement(PatientDetailPage));

    const assessmentsTable = await screen.findByRole('table', { name: /Histórico de avaliações físicas/ });
    expect(assessmentsTable).toBeInTheDocument();
    const dietsTable = screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ });
    expect(dietsTable).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Progresso Atual' })).toBeInTheDocument();
  });
});
