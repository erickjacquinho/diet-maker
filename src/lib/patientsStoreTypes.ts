export interface Patient {
  id: string;
  code?: string;
  legacyId?: string;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  objective: string;
  birthDate?: string;
  isPregnant?: boolean;
  pregnancyDueDate?: string;
  maritalStatus?: string;
  phone?: string;
  whatsapp?: string;
  lastConsultation: string;
  initials: string;
  nextEvent?: PatientNextEvent | null;
  lastActivity?: PatientLastActivity | null;
  bodyAssessments?: BodyAssessment[];
}

export type PatientNextEventType = 'diet-update' | 'assessment-update';

export interface PatientNextEvent {
  date: string;
  type: PatientNextEventType | PatientNextEventType[];
  comments?: string;
  version?: number;
}

export type PatientLastActivityType = 'diet' | 'assessment';

export interface PatientLastActivity {
  at: string;
  type: PatientLastActivityType;
}

export const DEFAULT_OBJECTIVES = [
  'Cutting',
  'Bulking',
  'Recomposição Corporal',
  'Manutenção',
];

export const DEFAULT_MARITAL_STATUSES = [
  'Solteiro(a)',
  'Comprometido(a)',
];

export interface HistoricalDietMeal {
  name: string;
  time: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  itemsSummary?: string;
}

export type HistoricalDietVariationType = 'high' | 'medium' | 'low' | 'zero' | 'custom';

export interface HistoricalDietTargets {
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export interface HistoricalDietVariation {
  id: string;
  name: string;
  type: HistoricalDietVariationType;
  assignedDays?: string[];
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  mealsCount: number;
  dietTargets?: HistoricalDietTargets;
}

export interface HistoricalDiet {
  id: string;
  name: string;
  date: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  status: 'Ativa' | 'Histórica';
  mode?: 'simple' | 'carb_cycling';
  carbCyclingVariations?: HistoricalDietVariation[];
  dietTargets?: HistoricalDietTargets;
  meals?: HistoricalDietMeal[];
}

import type {
  AssessmentInputSnapshot,
  AssessmentType,
  CalculationMethod,
} from '@/lib/domain/clinical';

export interface BodyAssessment {
  id: string;
  accountId?: string;
  patientId?: string;
  clinicalDate?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  date: string;
  assessmentType?: AssessmentType;
  heightCm?: number;
  weightKg: number;
  bodyFatPercent?: number;
  fatMassKg?: number;
  muscleMassKg?: number;
  waistCm?: number;
  neckCm?: number;
  scapulaCm?: number;
  bustCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  abdomenCm?: number;
  hipCm?: number;
  leftProximalThighCm?: number;
  rightProximalThighCm?: number;
  leftDistalThighCm?: number;
  rightDistalThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
  autoFilledFields?: string[];
  calculationMethod?: CalculationMethod;
  calculationVersion?: string;
  calculationInputSnapshot?: AssessmentInputSnapshot;
}

export interface ConsultationRecord {
  date: string;
  assessment?: BodyAssessment;
  notes?: string;
  prescribedSupplements?: string[];
}

