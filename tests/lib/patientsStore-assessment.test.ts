import { describe, expect, it } from 'vitest';
import {
  getPatientAssessmentsFromStorage,
  savePatientAssessmentToStorage,
  savePatientToStorage,
} from '@/lib/patientsStore';

describe('physical assessment persistence', () => {
  it('persists Navy measurements and derived composition values', () => {
    const patient = savePatientToStorage({
      name: 'Paciente Composição',
      age: 41,
      gender: 'Masculino',
      heightCm: 180,
      weightKg: 86,
      targetKcal: 2300,
      targetProtein: 160,
      targetCarbs: 250,
      targetFats: 70,
      objective: 'Hipertrofia',
    });
    const assessment = {
      id: 'assessment-1',
      date: '2026-08-03',
      weightKg: 85,
      bodyFatPercent: 18.46,
      fatMassKg: 15.69,
      muscleMassKg: 69.31,
      waistCm: 84,
      neckCm: 40,
      abdomenCm: 90,
      hipCm: 95,
      scapulaCm: 100,
      bustCm: 95,
      leftArmCm: 35,
      rightArmCm: 35,
      leftProximalThighCm: 55,
      rightProximalThighCm: 55,
      leftDistalThighCm: 42,
      rightDistalThighCm: 42,
      leftCalfCm: 38,
      rightCalfCm: 38,
    };

    savePatientAssessmentToStorage(patient.id, assessment);

    expect(getPatientAssessmentsFromStorage(patient.id)).toEqual([assessment]);
  });

  it('continues reading legacy assessments without new measurement fields', () => {
    const legacy = {
      id: 'assessment-legacy',
      date: '2026-07-10',
      weightKg: 82,
      bodyFatPercent: 22,
      muscleMassKg: 63.96,
      waistCm: 86,
    };

    localStorage.setItem('nutridiet_assessments_legacy-patient', JSON.stringify([legacy]));

    expect(getPatientAssessmentsFromStorage('legacy-patient')).toEqual([legacy]);
  });
});
