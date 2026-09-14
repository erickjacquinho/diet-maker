import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { makePatientProfileState } from './profileState';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/hooks/usePatientProfilePage', () => ({
  usePatientProfilePage: vi.fn(),
}));

const mockUsePatientProfilePage = vi.mocked(usePatientProfilePage);

describe('patient clinical profile projection', () => {
  beforeEach(() => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      patient: {
        ...makePatientProfileState().patient!,
        nextEvent: { date: '15/09/2026', type: 'assessment-update', version: 2 },
      },
      nextEventSummary: { date: '15/09/2026', label: 'Atualização de avaliação' },
      bodyAssessments: [{
        id: 'assessment-confirmed',
        date: '10/09/2026',
        clinicalDate: '2026-09-10',
        version: 3,
        weightKg: 76,
        bodyFatPercent: 19.32,
        muscleMassKg: 61.32,
        fatMassKg: 14.68,
        waistCm: 85,
      }],
      latestAssessment: {
        id: 'assessment-confirmed',
        date: '10/09/2026',
        clinicalDate: '2026-09-10',
        version: 3,
        weightKg: 76,
        bodyFatPercent: 19.32,
        muscleMassKg: 61.32,
        fatMassKg: 14.68,
        waistCm: 85,
      },
    }));
  });

  it('renders confirmed assessment values and the same follow-up projection', () => {
    render(<PatientDetailPage />);

    expect(screen.getByText('1 avaliação')).toBeInTheDocument();
    const assessments = screen.getByRole('table', { name: /Histórico de avaliações físicas/ });
    expect(within(assessments).getByText('76 kg')).toBeInTheDocument();
    expect(within(assessments).getByText('19.32%')).toBeInTheDocument();
    expect(screen.getByText('15/09/2026')).toBeInTheDocument();
    expect(screen.getByText('Atualização de avaliação')).toBeInTheDocument();
  });

  it('does not expose clinical mutation controls for an archived profile', () => {
    const current = makePatientProfileState();
    mockUsePatientProfilePage.mockReturnValue({
      ...current,
      patient: { ...current.patient!, archivedAt: '2026-09-11T10:00:00.000Z' },
      bodyAssessments: [{ id: 'assessment-archived', date: '10/09/2026', weightKg: 76, bodyFatPercent: 19, muscleMassKg: 61, waistCm: 85 }],
    });

    render(<PatientDetailPage />);

    expect(screen.getByText(/Este paciente está arquivado/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Nova Avaliação' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Definir acompanhamento' })).not.toBeInTheDocument();
  });
});
