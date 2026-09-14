import { vi } from 'vitest';
import type { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { PATIENT_PROFILE_FIXTURES } from '../../fixtures/patient-profile';

export type PatientProfileState = ReturnType<typeof usePatientProfilePage>;

type PopulatedPatientProfileState = PatientProfileState & {
  patient: NonNullable<PatientProfileState['patient']>;
};

export function makePatientProfileState(
  overrides?: Omit<Partial<PatientProfileState>, 'patient'> & {
    patient?: NonNullable<PatientProfileState['patient']>;
  },
): PopulatedPatientProfileState;
export function makePatientProfileState(
  overrides: Partial<PatientProfileState>,
): PatientProfileState;
export function makePatientProfileState(
  overrides: Partial<PatientProfileState> = {},
): PatientProfileState {
  const patient = {
    ...PATIENT_PROFILE_FIXTURES.patient,
    accountId: 'local-account',
    version: 1,
    archivedAt: null,
  } satisfies NonNullable<PatientProfileState['patient']>;

  const state: PatientProfileState = {
    patientId: patient.id,
    patient,
    profileError: null,
    isProfileLoading: false,
    confirmedPlans: [],
    bodyAssessments: [],
    activePlan: null,
    latestAssessment: null,
    nextEventSummary: null,
    whatsappUrl: null,
    availableObjectives: ['Cutting', 'Bulking', 'Recomposição Corporal', 'Manutenção'],
    isDeleteModalOpen: false,
    setIsDeleteModalOpen: vi.fn(),
    isEditModalOpen: false,
    setIsEditModalOpen: vi.fn(),
    isEditAssessmentOpen: false,
    setIsEditAssessmentOpen: vi.fn(),
    editingAssessment: null,
    assessmentMode: 'edit',
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
    router: {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    },
  };

  return { ...state, ...overrides };
}
