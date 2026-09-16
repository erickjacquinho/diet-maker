import { describe, expect, it, vi } from 'vitest';
import { createPatientProfileReader } from '@/lib/application/patients/patient-profile-reader';
import type { Patient } from '@/lib/domain/patient';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import { makeClinicalAssessment } from '../fixtures/clinical';

function makePatient(id: string): Patient {
  return {
    id,
    accountId: 'account-performance',
    displayCode: id,
    name: `Paciente ${id}`,
    age: 30,
    gender: 'Feminino',
    birthDate: null,
    isPregnant: false,
    pregnancyDueDate: null,
    heightCm: 165,
    weightKg: 62,
    maritalStatus: null,
    phone: null,
    whatsapp: null,
    currentObjective: 'Saúde',
    defaultMacroTargets: { proteinG: 100, carbsG: 180, fatsG: 55, kcal: 1700 },
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    version: 1,
    archivedAt: null,
  };
}

describe('clinical profile projection performance', () => {
  it('keeps batch summaries for hundreds of patients and thousands of assessments under one second at p95', async () => {
    const patients = Array.from({ length: 300 }, (_, patientIndex) => makePatient(`patient-${patientIndex}`));
    const assessments = Object.fromEntries(patients.map((patient, patientIndex) => [
      patient.id,
      Array.from({ length: 20 }, (_, assessmentIndex) => makeClinicalAssessment({
        id: `${patient.id}-assessment-${assessmentIndex}`,
        accountId: patient.accountId,
        patientId: patient.id,
        clinicalDate: `2026-09-${String((assessmentIndex % 9) + 1).padStart(2, '0')}`,
        createdAt: `2026-09-${String((assessmentIndex % 9) + 1).padStart(2, '0')}T00:00:00.000Z`,
        updatedAt: `2026-09-${String((assessmentIndex % 9) + 1).padStart(2, '0')}T00:00:00.000Z`,
      })),
    ]));
    const repository: ClinicalRepository = {
      getAssessment: vi.fn(),
      listAssessments: vi.fn(),
      listAssessmentsByPatients: vi.fn(async (_accountId: string, patientIds: readonly string[]) => Object.fromEntries(patientIds.map((id: string) => [id, assessments[id] ?? []]))),
      createAssessment: vi.fn(), updateAssessment: vi.fn(), getNextFollowUp: vi.fn(),
      listNextFollowUps: vi.fn(async () => ({})), setNextFollowUp: vi.fn(), clearNextFollowUp: vi.fn(),
    };
    const reader = createPatientProfileReader(
      { create: vi.fn(), getById: vi.fn(), listActive: vi.fn(async () => patients), update: vi.fn(), archive: vi.fn(), restore: vi.fn() },
      { list: vi.fn(async () => []), addCustom: vi.fn(), archiveCustom: vi.fn() },
      async () => ({ dietCount: 0, assessmentCount: 0 }),
      { clinicalRepository: repository },
    );

    const durations: number[] = [];
    for (let run = 0; run < 5; run += 1) {
      const start = performance.now();
      const summaries = await reader.listActiveSummaries('account-performance');
      durations.push(performance.now() - start);
      expect(summaries).toHaveLength(300);
      expect(summaries[0]?.clinical?.assessmentCount).toBe(20);
    }
    durations.sort((left, right) => left - right);
    expect(durations[4]).toBeLessThan(1000);
  });
});
