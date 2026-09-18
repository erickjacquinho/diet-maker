import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import { NextEventModal } from '@/components/molecules/NextEventModal';
import { PATIENT_PROFILE_FIXTURES } from '../../fixtures/patient-profile';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import type { PatientViewModel } from '@/lib/patientViewModel';

const push = vi.fn();
const router = {
  push,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

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
const patient = {
  ...PATIENT_PROFILE_FIXTURES.patient,
  accountId: 'local-account',
  version: 1,
  archivedAt: null,
  birthDate: '1997-04-05',
  isPregnant: true,
  pregnancyDueDate: '2026-12-10',
} satisfies PatientViewModel;

function profileState() {
  return {
    patientId: patient.id,
    patient,
    profileError: null,
    isProfileLoading: false,
    confirmedPlans: [],
    dietTotal: 0,
    isDietsLoading: false,
    dietsError: null,
    bodyAssessments: [],
    assessmentTotal: 0,
    isAssessmentsLoading: false,
    assessmentsError: null,
    activePlan: null,
    latestAssessment: null,
    nextEventSummary: null,
    whatsappUrl: null,
    availableObjectives: ['Cutting'],
    isDeleteModalOpen: false,
    setIsDeleteModalOpen: vi.fn(),
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
    handleOpenEditAssessment: vi.fn(),
    handleOpenCreateAssessment: vi.fn(),
    handleSaveAssessment: vi.fn(),
    handleSaveNextEvent: vi.fn(),
    handleClearNextEvent: vi.fn(),
    handleAddCustomObjective: vi.fn(),
    handleSavePatient: vi.fn(),
    handleDeletePatient: vi.fn(),
    router,
  } as ReturnType<typeof usePatientProfilePage>;
}

describe('PatientDetailPage accessibility', () => {
  beforeEach(() => {
    push.mockClear();
    mockUsePatientProfilePage.mockReturnValue(profileState());
  });

  it('exposes the new profile regions and the moved follow-up action accessibly', async () => {
    render(<PatientDetailPage />);

    const progress = await screen.findByRole('region', { name: 'Progresso Atual' });
    expect(progress).toHaveClass('col-span-2');
    expect(within(progress).getByRole('combobox', { name: 'Período' })).toHaveTextContent('30 dias');
    expect(screen.getByRole('region', { name: 'Última dieta' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Última avaliação' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Próximo acompanhamento' })).not.toBeInTheDocument();
    const followUpButton = screen.getByRole('button', { name: 'Definir acompanhamento' });
    expect(followUpButton).toHaveClass('focus-visible:ring-2');
    expect(screen.getByRole('link', { name: 'Nova Dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/nova',
    );
    expect(screen.getByRole('button', { name: 'Editar Cadastro' })).toHaveClass(
      'border-border-control',
      'bg-surface',
      'text-text-primary',
    );
    expect(screen.getByRole('button', { name: 'Arquivar Paciente' })).toHaveClass(
      'border-error-border',
      'bg-surface',
      'text-error',
      'hover:bg-error',
      'hover:text-white',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ver dados pessoais' }));
    expect(screen.getByRole('heading', { name: 'Dados pessoais' })).toBeInTheDocument();
    expect(screen.getByText('Idade')).toBeInTheDocument();
    expect(screen.getByText(/^\d+a \d+m$/)).toBeInTheDocument();
    expect(screen.queryByText('05/04/1997')).not.toBeInTheDocument();
    expect(screen.getByText('10/12/2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Histórico de avaliações físicas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Histórico de prescrições dietéticas' })).toBeInTheDocument();
    fireEvent.click(followUpButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });



  it('keeps the follow-up dialog fields labelled and keyboard-addressable', async () => {
    render(<NextEventModal open nextEvent={null} onOpenChange={vi.fn()} onSave={vi.fn()} onClear={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('z-modal', 'rounded-surface', 'bg-surface');
    expect(screen.getByRole('heading', { name: /Definir pr/ })).toHaveClass('text-style-dialog-title');
    expect(screen.getByText(/Escolha a data/)).toHaveClass('text-style-body', 'text-text-secondary');
    expect(screen.getByRole('button', { name: 'Abrir calendário para Data' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'next-event-type');
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    const saveButton = screen.getByRole('button', { name: 'Salvar (Ctrl+S)' });
    expect(saveButton).toHaveAttribute('aria-keyshortcuts', 'Control+s Meta+s');
    expect(cancelButton).toHaveClass('h-control-standard');
    expect(saveButton).toHaveClass('h-control-standard');
    expect(cancelButton.parentElement).toHaveClass('gap-2');
    expect(cancelButton.parentElement).not.toHaveClass('space-x-2');

    await waitFor(() => expect(document.activeElement).toBeTruthy());
  });

  it('removes mutation and new-clinical-record controls for an archived patient', () => {
    mockUsePatientProfilePage.mockReturnValue({
      ...profileState(),
      patient: { ...patient, archivedAt: '2026-08-30T10:00:00.000Z' },
    } as ReturnType<typeof usePatientProfilePage>);
    render(<PatientDetailPage />);

    expect(screen.getByText(/Este paciente está arquivado/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar Cadastro' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Arquivar Paciente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Definir acompanhamento' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Nova Dieta' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Nova Avaliação' })).not.toBeInTheDocument();
  });

  it('shows a fallback badge when the patient has no objective', () => {
    mockUsePatientProfilePage.mockReturnValue({
      ...profileState(),
      patient: { ...patient, objective: '' },
    } as ReturnType<typeof usePatientProfilePage>);

    render(<PatientDetailPage />);

    expect(screen.getByText('sem objetivo')).toBeInTheDocument();
  });
});
