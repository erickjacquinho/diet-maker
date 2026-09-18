import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import {
  PATIENT_PROFILE_ASSESSMENTS,
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

describe('PatientDetailPage current context', () => {
  beforeEach(() => {
    push.mockClear();
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState());
  });

  it('prioritizes patient identity and current indicators over manual targets', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      bodyAssessments: PATIENT_PROFILE_ASSESSMENTS,
      latestAssessment: PATIENT_PROFILE_ASSESSMENTS[1],
    }));

    render(<PatientDetailPage />);

    expect(await screen.findByRole('heading', { name: 'Indicadores atuais' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hanna Perfil' })).toBeInTheDocument();
    expect(screen.getByText('Cutting')).toBeInTheDocument();
    expect(screen.getAllByText('48.5 kg').length).toBeGreaterThan(0);
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('keeps missing assessments and follow-up as explicit empty states', async () => {
    render(<PatientDetailPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Indicadores atuais' })).toBeInTheDocument());
    expect(screen.getAllByText('Sem avaliação')).toHaveLength(4);
    expect(screen.getByText('Sem acompanhamento previsto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Definir acompanhamento' })).toBeInTheDocument();
  });
});
