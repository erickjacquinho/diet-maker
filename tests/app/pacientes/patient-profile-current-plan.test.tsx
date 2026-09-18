import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
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
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/hooks/usePatientProfilePage', () => ({
  usePatientProfilePage: vi.fn(),
}));

const mockUsePatientProfilePage = vi.mocked(usePatientProfilePage);

describe('PatientDetailPage latest diet', () => {
  beforeEach(() => {
    push.mockClear();
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState());
  });

  it('shows a compact summary and a details action for the latest diet', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      confirmedPlans: [PATIENT_PROFILE_DIETS[1]],
      latestAssessment: PATIENT_PROFILE_ASSESSMENTS[1],
    }));

    render(<PatientDetailPage />);

    expect(await screen.findByText('Plano cutting agosto')).toBeInTheDocument();
    const planSummary = within(screen.getByRole('region', { name: 'Última Prescrição 04/08/2026' }));
    expect(planSummary.getByText('Ativo')).toBeInTheDocument();
    expect(planSummary.getByText('Metas diárias')).toBeInTheDocument();
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

  it('does not promote manual targets when no diet is registered', async () => {
    render(<PatientDetailPage />);

    expect(await screen.findByText('Nenhuma prescrição registrada.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Criar dieta' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nova Dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/nova',
    );
    expect(screen.queryByText('2020 kcal')).not.toBeInTheDocument();
  });

  it('labels carb-cycling targets as a weekly average', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      confirmedPlans: [{ ...PATIENT_PROFILE_DIETS[1], id: 'diet-cycle', name: 'Ciclo de carboidratos', mode: 'carb_cycling' }],
    }));

    render(<PatientDetailPage />);

    const planSummary = within(await screen.findByRole('region', { name: /Última Prescrição/ }));
    expect(planSummary.getByText('Média semanal do ciclo')).toBeInTheDocument();
    expect(planSummary.queryByText('Metas diárias')).not.toBeInTheDocument();
  });
});
