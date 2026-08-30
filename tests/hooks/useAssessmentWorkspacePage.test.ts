import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssessmentWorkspacePage } from '@/hooks/useAssessmentWorkspacePage';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
const patient = {
  id: 'patient-1',
  name: 'Paciente Teste',
  gender: 'Masculino',
  heightCm: 180,
  age: 30,
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/patientsStore', () => ({
  getPatientById: vi.fn(() => patient),
  getPatientAssessmentsFromStorage: vi.fn(() => [assessment]),
  savePatientAssessmentToStorage: vi.fn(),
  normalizePairedBodyMeasurements: vi.fn((value) => value),
}));

describe('useAssessmentWorkspacePage leave confirmation', () => {
  beforeEach(() => {
    push.mockClear();
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
});
