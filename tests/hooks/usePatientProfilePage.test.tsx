import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { makeClinicalAssessment } from '../fixtures/clinical';
import { PATIENT_PROFILE_DIETS } from '../fixtures/patient-profile';

const mocks = vi.hoisted(() => ({
  patientApplication: {
    getPatientProfile: vi.fn(),
    listAssessmentsPage: vi.fn(),
    updateAssessment: vi.fn(),
    createAssessment: vi.fn(),
  },
  dietApplication: {
    listDietHistoryViewsPage: vi.fn(),
    getDietSnapshot: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'patient-profile' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: async () => mocks.patientApplication,
  getBrowserDietApplication: async () => mocks.dietApplication,
}));

const patient = {
  id: 'patient-profile', accountId: 'account-profile', displayCode: 'P-0001', name: 'Ana Lima', age: 32, gender: 'Feminino',
  birthDate: '1994-06-12', isPregnant: false, pregnancyDueDate: null, heightCm: 165, weightKg: 62,
  maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Manutenção',
  defaultMacroTargets: { proteinG: 110, carbsG: 200, fatsG: 55, kcal: 1755 },
  createdAt: '2026-09-17T10:00:00.000Z', updatedAt: '2026-09-17T10:00:00.000Z', version: 1, archivedAt: null,
};
const assessment = makeClinicalAssessment({ id: 'assessment-profile', accountId: patient.accountId, patientId: patient.id });
const diet = { ...PATIENT_PROFILE_DIETS[0], id: 'diet-profile', name: 'Plano histórico' };
const assessments = Array.from({ length: 30 }, (_, index) => makeClinicalAssessment({
  id: `assessment-${index}`,
  accountId: patient.accountId,
  patientId: patient.id,
}));
const diets = Array.from({ length: 30 }, (_, index) => ({ ...diet, id: `diet-${index}`, name: `Plano ${index}` }));
const profile = {
  patient,
  initials: 'AL',
  availableObjectives: ['Manutenção'],
  related: { dietCount: 1, assessmentCount: 1 },
  clinical: {
    assessmentCount: 1,
    latestAssessment: assessment,
    previousAssessment: null,
    nextFollowUp: null,
    lastActivity: null,
    hasDiet: true,
    dietCount: 1,
    assessments: [assessment],
  },
};

describe('usePatientProfilePage history', () => {
  beforeEach(() => {
    mocks.patientApplication.getPatientProfile.mockReset().mockResolvedValue(profile);
    mocks.patientApplication.listAssessmentsPage.mockReset().mockResolvedValue({
      items: assessments.slice(0, 10), total: assessments.length, pageIndex: 0, pageSize: 10,
    });
    mocks.patientApplication.updateAssessment.mockReset().mockResolvedValue(assessment);
    mocks.patientApplication.createAssessment.mockReset().mockResolvedValue(assessment);
    mocks.dietApplication.listDietHistoryViewsPage.mockReset().mockResolvedValue({
      items: diets.slice(0, 10), total: diets.length, pageIndex: 0, pageSize: 10,
    });
    mocks.dietApplication.getDietSnapshot.mockReset().mockResolvedValue({ id: diet.id, variations: [{ meals: [{ options: [{ items: [{ name: 'Arroz' }] }] }] }] });
  });

  it('loads only the 10 newest assessment and diet rows while retaining full totals', async () => {
    const { result } = renderHook(() => usePatientProfilePage());
    await waitFor(() => {
      expect(mocks.patientApplication.listAssessmentsPage).toHaveBeenCalledWith('patient-profile', { pageIndex: 0, pageSize: 10 });
      expect(mocks.dietApplication.listDietHistoryViewsPage).toHaveBeenCalledWith('patient-profile', { pageIndex: 0, pageSize: 10 });
    });
    expect(result.current.bodyAssessments).toHaveLength(10);
    expect(result.current.confirmedPlans).toHaveLength(10);
    expect(result.current).toMatchObject({ assessmentTotal: 30, dietTotal: 30 });
  });

  it('refreshes assessments after save without reloading diets and fetches a diet only when opened', async () => {
    const { result } = renderHook(() => usePatientProfilePage());
    await waitFor(() => expect(mocks.dietApplication.listDietHistoryViewsPage).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.handleSaveAssessment({ ...result.current.bodyAssessments[0], version: 1 });
    });
    await waitFor(() => expect(mocks.patientApplication.listAssessmentsPage).toHaveBeenCalledTimes(2));
    expect(mocks.dietApplication.listDietHistoryViewsPage).toHaveBeenCalledTimes(1);
    expect(mocks.dietApplication.getDietSnapshot).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.handleOpenReadOnlyDietModal(diet);
    });
    expect(mocks.dietApplication.getDietSnapshot).toHaveBeenCalledWith('patient-profile', diet.id);
    expect(result.current.selectedReadOnlyDiet).toMatchObject({ id: diet.id });
    expect(result.current.isReadOnlyDietModalOpen).toBe(true);
  });
});
