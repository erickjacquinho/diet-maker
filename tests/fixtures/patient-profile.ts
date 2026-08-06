import type { BodyAssessment, HistoricalDiet, Patient } from '@/lib/patientsStore';

export const PATIENT_PROFILE_FIXTURES = {
  patient: {
    id: 'patient-profile-1',
    name: 'Hanna Perfil',
    age: 29,
    gender: 'Feminino',
    heightCm: 165,
    weightKg: 48.5,
    targetKcal: 2020,
    targetProtein: 150,
    targetCarbs: 220,
    targetFats: 60,
    objective: 'Cutting',
    lastConsultation: '04/08/2026',
    initials: 'HP',
    nextEvent: null,
    lastActivity: null,
  } satisfies Patient,
  manualOnlyPatient: {
    id: 'patient-profile-manual-only',
    name: 'Manual Only',
    age: 31,
    gender: 'Masculino',
    heightCm: 178,
    weightKg: 82,
    targetKcal: 2400,
    targetProtein: 180,
    targetCarbs: 250,
    targetFats: 70,
    objective: 'Bulking',
    lastConsultation: '01/08/2026',
    initials: 'MO',
    nextEvent: null,
    lastActivity: null,
  } satisfies Patient,
} as const;

export const PATIENT_PROFILE_ASSESSMENTS: BodyAssessment[] = [
  {
    id: 'assessment-old',
    date: '2026-07-20',
    weightKg: 50,
    bodyFatPercent: 24,
    muscleMassKg: 24,
    waistCm: 70,
  },
  {
    id: 'assessment-latest',
    date: '04/08/2026',
    weightKg: 48.5,
    bodyFatPercent: 22,
    muscleMassKg: 25,
    waistCm: 68,
  },
];

export const PATIENT_PROFILE_DIETS: HistoricalDiet[] = [
  {
    id: 'diet-old',
    name: 'Plano anterior',
    date: '2026-07-20',
    targetKcal: 1900,
    proteinG: 130,
    carbsG: 210,
    fatsG: 55,
    status: 'Histórica',
  },
  {
    id: 'diet-current',
    name: 'Plano cutting agosto',
    date: '04/08/2026',
    targetKcal: 2020,
    proteinG: 150,
    carbsG: 220,
    fatsG: 60,
    status: 'Ativa',
  },
];

export const PATIENT_PROFILE_MULTIPLE_ACTIVE_DIETS: HistoricalDiet[] = [
  {
    ...PATIENT_PROFILE_DIETS[1],
    id: 'diet-active-old',
    date: '2026-08-03',
  },
  {
    ...PATIENT_PROFILE_DIETS[1],
    id: 'diet-active-new',
    date: '2026-08-04',
  },
];
