import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssessmentWorkspacePage } from '@/hooks/useAssessmentWorkspacePage';
import { ClinicalApplicationError } from '@/lib/domain/clinical';

const { push, application } = vi.hoisted(() => ({
  push: vi.fn(),
  application: {
    getPatientProfile: vi.fn(),
    listAssessments: vi.fn(),
    createAssessment: vi.fn(),
    updateAssessment: vi.fn(),
  },
}));
const patient = {
  id: 'patient-1',
  accountId: 'account-1',
  displayCode: 'P-0001',
  name: 'Paciente Teste',
  gender: 'Masculino',
  heightCm: 180,
  age: 30,
  weightKg: 80,
  maritalStatus: null,
  phone: null,
  whatsapp: null,
  currentObjective: 'Saúde',
  defaultMacroTargets: { proteinG: 150, carbsG: 200, fatsG: 60, kcal: 2140 },
  createdAt: '2026-08-20T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
  version: 1,
  archivedAt: null,
};
const assessment = {
  id: 'assessment-1',
  date: '20/08/2026',
  weightKg: 80,
  bodyFatPercent: 18,
  muscleMassKg: 65.6,
  fatMassKg: 14.4,
  waistCm: 85,
  neckCm: 40,
  scapulaCm: 100,
  bustCm: 95,
  leftArmCm: 35,
  rightArmCm: 35,
  abdomenCm: 90,
  hipCm: 95,
  leftProximalThighCm: 55,
  rightProximalThighCm: 55,
  leftDistalThighCm: 42,
  rightDistalThighCm: 42,
  leftCalfCm: 38,
  rightCalfCm: 38,
};

const canonicalAssessment = {
  id: assessment.id,
  accountId: patient.accountId,
  patientId: patient.id,
  clinicalDate: '2026-08-20',
  weightKg: assessment.weightKg,
  bodyFatPercent: assessment.bodyFatPercent,
  fatMassKg: assessment.fatMassKg,
  leanMassKg: assessment.muscleMassKg,
  waistCm: assessment.waistCm,
  neckCm: assessment.neckCm,
  scapulaCm: assessment.scapulaCm,
  bustCm: assessment.bustCm,
  leftArmCm: assessment.leftArmCm,
  rightArmCm: assessment.rightArmCm,
  abdomenCm: assessment.abdomenCm,
  hipCm: assessment.hipCm,
  leftProximalThighCm: assessment.leftProximalThighCm,
  rightProximalThighCm: assessment.rightProximalThighCm,
  leftDistalThighCm: assessment.leftDistalThighCm,
  rightDistalThighCm: assessment.rightDistalThighCm,
  leftCalfCm: assessment.leftCalfCm,
  rightCalfCm: assessment.rightCalfCm,
  autoFilledFields: [],
  calculationMethod: 'US_NAVY' as const,
  calculationVersion: 'us-navy-v1',
  calculationInputSnapshot: { sex: 'male' as const, heightCm: 180, neckCm: 40, waistCm: 85, abdomenCm: 90, hipCm: 95, weightKg: 80 },
  version: 1,
  createdAt: '2026-08-20T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: vi.fn(async () => application),
}));

describe('useAssessmentWorkspacePage leave confirmation', () => {
  beforeEach(() => {
    push.mockClear();
    application.getPatientProfile.mockResolvedValue({
      patient,
      initials: 'PT',
      availableObjectives: ['Saúde'],
      related: { dietCount: 0, assessmentCount: 1 },
      clinical: {
        assessments: [canonicalAssessment],
        assessmentCount: 1,
        latestAssessment: canonicalAssessment,
        previousAssessment: null,
        nextFollowUp: null,
        lastActivity: { eventDate: '2026-08-20', confirmedAt: canonicalAssessment.updatedAt, type: 'assessment', sourceId: canonicalAssessment.id },
        hasDiet: false,
        dietCount: 0,
      },
    });
    application.createAssessment.mockResolvedValue(canonicalAssessment);
    application.updateAssessment.mockResolvedValue(canonicalAssessment);
  });

  it('opens the confirmation when dirty and navigates only after confirmation', async () => {
    const { result } = renderHook(() => useAssessmentWorkspacePage('patient-1', 'assessment-1'));

    await waitFor(() => expect(result.current.patient).not.toBeNull());

    act(() => result.current.updateNumericField('weightKg', '81'));
    act(() => result.current.handleCancel());

    expect(result.current.isLeaveConfirmationOpen).toBe(true);
    expect(push).not.toHaveBeenCalled();

    act(() => result.current.handleCancelLeaveConfirmation());

    expect(result.current.isLeaveConfirmationOpen).toBe(false);
    expect(push).not.toHaveBeenCalled();

    act(() => result.current.handleCancel());
    act(() => result.current.handleConfirmLeave());

    expect(push).toHaveBeenCalledWith('/pacientes/patient-1');
    expect(result.current.isLeaveConfirmationOpen).toBe(false);
  });

  it('persists through PatientApplication and navigates only after a confirmed save', async () => {
    const { result } = renderHook(() => useAssessmentWorkspacePage('patient-1', 'assessment-1'));
    await waitFor(() => expect(result.current.draft).not.toBeNull());

    let resolveSave: ((value: typeof canonicalAssessment) => void) | undefined;
    application.updateAssessment.mockImplementationOnce(() => new Promise((resolve) => { resolveSave = resolve; }));
    let savePromise: Promise<void> | undefined;
    act(() => { savePromise = result.current.handleSave(); });
    await waitFor(() => expect(result.current.isSaving).toBe(true));
    expect(application.updateAssessment).toHaveBeenCalledWith('patient-1', 'assessment-1', 1, expect.objectContaining({ clinicalDate: '2026-08-20' }));
    expect(push).not.toHaveBeenCalled();

    await act(async () => {
      resolveSave?.(canonicalAssessment);
      await savePromise;
    });
    expect(push).toHaveBeenCalledWith('/pacientes/patient-1');
    expect(result.current.isDirty).toBe(false);
  });

  it('keeps the form open and populated when a canonical save fails', async () => {
    const { result } = renderHook(() => useAssessmentWorkspacePage('patient-1', 'assessment-1'));
    await waitFor(() => expect(result.current.draft).not.toBeNull());
    const originalWeight = result.current.draft?.weightKg;
    application.updateAssessment.mockRejectedValueOnce(new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'Conflito de versão.'));

    await act(async () => { await result.current.handleSave(); });

    expect(result.current.submitError).toBe('Conflito de versão.');
    expect(result.current.draft?.weightKg).toBe(originalWeight);
    expect(push).not.toHaveBeenCalled();
  });

  it('coalesces rapid duplicate submissions into one canonical write', async () => {
    const { result } = renderHook(() => useAssessmentWorkspacePage('patient-1', 'assessment-1'));
    await waitFor(() => expect(result.current.draft).not.toBeNull());

    let resolveSave: ((value: typeof canonicalAssessment) => void) | undefined;
    application.updateAssessment.mockClear();
    application.updateAssessment.mockImplementationOnce(() => new Promise((resolve) => { resolveSave = resolve; }));
    let firstSave: Promise<void> | undefined;
    let secondSave: Promise<void> | undefined;
    act(() => {
      firstSave = result.current.handleSave();
      secondSave = result.current.handleSave();
    });

    await waitFor(() => expect(application.updateAssessment).toHaveBeenCalledTimes(1));
    await act(async () => {
      resolveSave?.(canonicalAssessment);
      await firstSave;
      await secondSave;
    });
  });
});
