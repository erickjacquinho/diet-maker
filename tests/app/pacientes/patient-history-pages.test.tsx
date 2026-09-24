import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PatientHistoryPage } from '@/app/pacientes/[id]/_components/PatientHistoryPage';
import { makeClinicalAssessment } from '../../fixtures/clinical';
import { PATIENT_PROFILE_DIETS } from '../../fixtures/patient-profile';

const mocks = vi.hoisted(() => ({
  patientApplication: {
    getPatientProfile: vi.fn(),
    listAssessmentsPage: vi.fn(),
  },
  dietApplication: {
    listDietHistoryViewsPage: vi.fn(),
    getDietSnapshot: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'patient-history' }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: async () => mocks.patientApplication,
  getBrowserDietApplication: async () => mocks.dietApplication,
}));

const profile = {
  patient: { id: 'patient-history', name: 'Ana Lima' },
};
const assessments = [
  makeClinicalAssessment({ id: 'assessment-1', accountId: 'account-1', patientId: 'patient-history', clinicalDate: '2026-09-10' }),
  makeClinicalAssessment({ id: 'assessment-2', accountId: 'account-1', patientId: 'patient-history', clinicalDate: '2026-09-01' }),
];
const diets = [
  { ...PATIENT_PROFILE_DIETS[0], id: 'diet-1', name: 'Plano mais recente' },
  { ...PATIENT_PROFILE_DIETS[1], id: 'diet-2', name: 'Plano anterior' },
];

describe('PatientHistoryPage', () => {
  beforeEach(() => {
    mocks.patientApplication.getPatientProfile.mockReset().mockResolvedValue(profile);
    mocks.patientApplication.listAssessmentsPage.mockReset().mockImplementation(async (
      _patientId: string,
      request: { pageIndex?: number; pageSize?: number },
    ) => {
      const pageIndex = request.pageIndex ?? 0;
      return {
        items: [assessments[pageIndex === 0 ? 0 : 1]],
        total: 26,
        pageIndex,
        pageSize: request.pageSize ?? 25,
      };
    });
    mocks.dietApplication.listDietHistoryViewsPage.mockReset().mockImplementation(async (
      _patientId: string,
      request: { pageIndex?: number; pageSize?: number },
    ) => {
      const pageIndex = request.pageIndex ?? 0;
      return {
        items: [diets[pageIndex === 0 ? 0 : 1]],
        total: 26,
        pageIndex,
        pageSize: request.pageSize ?? 25,
      };
    });
    mocks.dietApplication.getDietSnapshot.mockReset().mockResolvedValue({ id: 'diet-1', variations: [] });
  });

  it('loads and pages through the complete assessment history', async () => {
    render(<PatientHistoryPage kind="avaliacoes" />);

    expect(await screen.findByRole('table', { name: /Histórico de avaliações físicas/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o perfil de Ana Lima' })).toHaveAttribute(
      'href',
      '/pacientes/patient-history',
    );
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(mocks.patientApplication.listAssessmentsPage).toHaveBeenCalledWith('patient-history', {
      pageIndex: 0,
      pageSize: 25,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    await waitFor(() => {
      expect(mocks.patientApplication.listAssessmentsPage).toHaveBeenLastCalledWith('patient-history', {
        pageIndex: 1,
        pageSize: 25,
      });
    });
    expect(await screen.findByText('01/09/2026')).toBeInTheDocument();
  });

  it('loads and pages through the complete diet history', async () => {
    render(<PatientHistoryPage kind="dietas" />);

    expect(await screen.findByRole('table', { name: /Histórico de prescrições dietéticas/ })).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(mocks.dietApplication.listDietHistoryViewsPage).toHaveBeenCalledWith('patient-history', {
      pageIndex: 0,
      pageSize: 25,
    });
    expect(screen.getByRole('button', { name: 'Ver cardápio completo da dieta Plano mais recente' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    await waitFor(() => {
      expect(mocks.dietApplication.listDietHistoryViewsPage).toHaveBeenLastCalledWith('patient-history', {
        pageIndex: 1,
        pageSize: 25,
      });
    });
    expect(await screen.findByRole('button', { name: 'Ver cardápio completo da dieta Plano anterior' })).toBeInTheDocument();
  });
});
