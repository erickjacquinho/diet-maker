import { render, screen, within } from '@testing-library/react';
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

  it('keeps the progress area clear and shows the latest assessment beside patient identity', async () => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      bodyAssessments: PATIENT_PROFILE_ASSESSMENTS,
      latestAssessment: PATIENT_PROFILE_ASSESSMENTS[1],
    }));

    render(<PatientDetailPage />);

    const progress = await screen.findByRole('region', { name: 'Progresso Atual' });
    expect(progress).toHaveClass('col-span-2');
    expect(within(progress).getByRole('combobox', { name: 'Período' })).toHaveTextContent('30 dias');
    expect(progress).not.toHaveTextContent('Peso');
    expect(progress).not.toHaveTextContent('Nenhuma avaliação');
    const sideSummary = screen.getByRole('group', { name: 'Última dieta e avaliação' });
    expect(sideSummary.parentElement).toHaveClass('col-span-1');
    expect(within(sideSummary).getAllByRole('region')).toHaveLength(2);
    expect(within(sideSummary).getByRole('region', { name: 'Última dieta' })).toBeInTheDocument();
    expect(within(sideSummary).getByRole('region', { name: 'Última avaliação' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hanna Perfil' })).toBeInTheDocument();
    expect(screen.getByText('Cutting')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Última avaliação' })).getByText('48,5 kg')).toBeInTheDocument();
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('keeps latest diet and assessment empty states explicit without filling the progress area', async () => {
    render(<PatientDetailPage />);

    const progress = await screen.findByRole('region', { name: 'Progresso Atual' });
    expect(within(progress).getByRole('combobox', { name: 'Período' })).toHaveTextContent('30 dias');
    expect(progress).not.toHaveTextContent('Peso');
    expect(screen.getByText('Nenhuma dieta registrada.')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma avaliação registrada.')).toBeInTheDocument();
    expect(screen.queryByText('Sem acompanhamento previsto')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Definir acompanhamento' })).toBeInTheDocument();
  });

});
