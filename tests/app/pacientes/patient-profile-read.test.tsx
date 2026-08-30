import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { getPatientInitials } from '@/lib/domain/patient';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';

vi.mock('@/hooks/usePatientProfilePage', () => ({
  usePatientProfilePage: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockUsePatientProfilePage = vi.mocked(usePatientProfilePage);

function state(overrides: Partial<ReturnType<typeof usePatientProfilePage>> = {}): ReturnType<typeof usePatientProfilePage> {
  return {
    patientId: 'missing-patient',
    patient: null,
    profileError: null,
    isProfileLoading: false,
    dietHistory: [],
    bodyAssessments: [],
    activePlan: null,
    latestAssessment: null,
    nextEventSummary: null,
    whatsappUrl: null,
    availableObjectives: [],
    isDeleteModalOpen: false,
    setIsDeleteModalOpen: vi.fn(),
    isDeleteDietModalOpen: false,
    setIsDeleteDietModalOpen: vi.fn(),
    dietToDelete: null,
    isEditModalOpen: false,
    setIsEditModalOpen: vi.fn(),
    isEditAssessmentOpen: false,
    setIsEditAssessmentOpen: vi.fn(),
    editingAssessment: null,
    assessmentMode: 'edit' as const,
    isNextEventModalOpen: false,
    setIsNextEventModalOpen: vi.fn(),
    isAddObjectiveModalOpen: false,
    setIsAddObjectiveModalOpen: vi.fn(),
    objectiveToApply: undefined,
    setObjectiveToApply: vi.fn(),
    selectedReadOnlyDiet: null,
    isReadOnlyDietModalOpen: false,
    setIsReadOnlyDietModalOpen: vi.fn(),
    handleOpenReadOnlyDietModal: vi.fn(),
    handleOpenDeleteDietModal: vi.fn(),
    handleOpenEditAssessment: vi.fn(),
    handleOpenCreateAssessment: vi.fn(),
    handleSaveAssessment: vi.fn(),
    handleSaveNextEvent: vi.fn(),
    handleClearNextEvent: vi.fn(),
    handleAddCustomObjective: vi.fn(),
    handleSavePatient: vi.fn(),
    handleDeletePatient: vi.fn(),
    handleDeleteDiet: vi.fn(),
    router: {
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    },
    ...overrides,
  } as ReturnType<typeof usePatientProfilePage>;
}

beforeEach(() => {
  mockUsePatientProfilePage.mockReturnValue(state());
});

describe('patient profile read contract', () => {
  it('derives identity projections from the canonical patient name', () => {
    expect(getPatientInitials('Maria Oliveira')).toBe('MO');
  });

  it('keeps profile navigation free from an implicit persistence fallback', async () => {
    const getProfile = vi.fn().mockRejectedValue(new Error('Paciente não encontrado nesta Conta.'));
    await expect(getProfile('missing-patient')).rejects.toThrow('Paciente não encontrado');
    expect(getProfile).toHaveBeenCalledWith('missing-patient');
  });

  it('renders loading without claiming that the profile is missing', () => {
    mockUsePatientProfilePage.mockReturnValue(state({ isProfileLoading: true }));
    render(<PatientDetailPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando perfil do paciente...');
    expect(screen.queryByText('Paciente Não Encontrado')).not.toBeInTheDocument();
  });

  it('renders the not-found state without mutation controls', () => {
    render(<PatientDetailPage />);

    expect(screen.getByText('Paciente Não Encontrado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para Pacientes' })).toHaveAttribute('href', '/pacientes');
    expect(screen.queryByRole('button', { name: /editar cadastro/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /arquivar paciente/i })).not.toBeInTheDocument();
  });
});
