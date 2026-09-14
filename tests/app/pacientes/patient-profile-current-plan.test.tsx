import { render, screen, within, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import { PATIENT_PROFILE_FIXTURES } from '../../fixtures/patient-profile';
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

describe('PatientDetailPage current plan', () => {
  beforeEach(() => {
    push.mockClear();
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState());
  });

  it('shows a compact summary and a details action when a diet is active', async () => {
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

    render(<PatientDetailPage />);

    expect(await screen.findByText('Plano cutting agosto')).toBeInTheDocument();
    expect(screen.getByText('Plano ativo')).toBeInTheDocument();
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

  it('does not promote manual targets when no diet is active', async () => {
    render(<PatientDetailPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma dieta ativa está vinculada a este paciente.')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Criar dieta' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nova Dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/nova',
    );
    expect(screen.queryByText('2020 kcal')).not.toBeInTheDocument();
  });
});
