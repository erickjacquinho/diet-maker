'use client';

import { calculatePresetCalories } from './presetUtils';

export interface Patient {
  id: string;
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
  lastConsultation: string;
  initials: string;
  nextEvent?: PatientNextEvent | null;
  lastActivity?: PatientLastActivity | null;
}

export type PatientNextEventType = 'diet-update' | 'assessment-update';

export interface PatientNextEvent {
  date: string;
  type: PatientNextEventType;
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


export interface HistoricalDiet {
  id: string;
  name: string;
  date: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  status: 'Ativa' | 'Histórica';
  meals?: Array<{
    name: string;
    time: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
    itemsSummary?: string;
  }>;
}

export interface BodyAssessment {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercent: number;
  muscleMassKg: number;
  waistCm: number;
}

export interface ConsultationRecord {
  date: string;
  diet?: HistoricalDiet;
  assessment?: BodyAssessment;
  notes?: string;
  prescribedSupplements?: string[];
}

const PATIENTS_KEY = 'nutridiet_patients';
const PATIENT_ASSESSMENTS_KEY_PREFIX = 'nutridiet_assessments_';
const PATIENT_DIETS_KEY_PREFIX = 'nutridiet_diets_';

export interface StoredDietRecord {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PatientRecordHistory {
  assessments: BodyAssessment[];
  hasDiet: boolean;
}

function normalizePatient(patient: Patient): Patient {
  return {
    ...patient,
    nextEvent: patient.nextEvent ?? null,
    lastActivity: patient.lastActivity ?? null,
  };
}

function writePatients(patients: Patient[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  }
}

function normalizeDateKey(value: string): string {
  const decoded = decodeURIComponent(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(decoded)) return decoded;

  const parts = decoded.split(/[/-]/).map((part) => part.trim());
  if (parts.length !== 3) return decoded;

  const [first, second, third] = parts;
  if (third.length === 4) {
    return `${third}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
  }

  return decoded;
}

export function getPatientsFromStorage(): Patient[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PATIENTS_KEY);
    return saved ? (JSON.parse(saved) as Patient[]).map(normalizePatient) : [];
  } catch {
    return [];
  }
}

export function savePatientToStorage(newPatient: Omit<Patient, 'id' | 'initials' | 'lastConsultation'>): Patient {
  const current = getPatientsFromStorage();
  const nameParts = newPatient.name.trim().split(' ');
  const initials = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() 
    : nameParts[0].slice(0, 2).toUpperCase();

  const today = new Date().toLocaleDateString('pt-BR');

  const uniqueSuffix = Math.random().toString(36).substring(2, 7);
  const created: Patient = {
    ...newPatient,
    id: `pat-${Date.now()}-${uniqueSuffix}`,
    initials,
    lastConsultation: today,
    nextEvent: newPatient.nextEvent ?? null,
    lastActivity: newPatient.lastActivity ?? null,
  };

  const updated = [created, ...current];
  writePatients(updated);
  return created;
}

export function getPatientById(id: string): Patient | null {
  const patients = getPatientsFromStorage();
  return patients.find((p) => p.id === id) || null;
}

export function updatePatientInStorage(updatedPatient: Patient): Patient {
  const current = getPatientsFromStorage();
  const nameParts = updatedPatient.name.trim().split(' ');
  const initials = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() 
    : nameParts[0].slice(0, 2).toUpperCase();

  const patientToSave: Patient = {
    ...normalizePatient(updatedPatient),
    initials,
  };

  const updatedList = current.map((p) => (p.id === updatedPatient.id ? patientToSave : p));
  // If the patient was not found in storage (e.g. mock fallback patient), add it
  const exists = current.some((p) => p.id === updatedPatient.id);
  const finalList = exists ? updatedList : [patientToSave, ...current];

  writePatients(finalList);
  return patientToSave;
}

export function recordPatientActivity(
  patientId: string,
  type: PatientLastActivityType,
  at = new Date().toISOString(),
): Patient | null {
  const current = getPatientsFromStorage();
  const index = current.findIndex((patient) => patient.id === patientId);
  if (index < 0) return null;

  const updatedPatient = {
    ...current[index],
    lastActivity: { at, type },
  };
  const updated = [...current];
  updated[index] = updatedPatient;
  writePatients(updated);
  return updatedPatient;
}

export function getPatientAssessmentsFromStorage(patientId: string): BodyAssessment[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(`${PATIENT_ASSESSMENTS_KEY_PREFIX}${patientId}`);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? (parsed as BodyAssessment[]) : [];
  } catch {
    return [];
  }
}

export function getPatientDietsFromStorage(patientId: string): StoredDietRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(`${PATIENT_DIETS_KEY_PREFIX}${patientId}`);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? (parsed as StoredDietRecord[]) : [];
  } catch {
    return [];
  }
}

export function getPatientRecordHistory(patientId: string): PatientRecordHistory {
  const assessments = getPatientAssessmentsFromStorage(patientId);
  const diets = getPatientDietsFromStorage(patientId);

  return {
    assessments,
    hasDiet: diets.length > 0,
  };
}

export function savePatientAssessmentToStorage(
  patientId: string,
  assessment: BodyAssessment,
): BodyAssessment[] {
  const current = getPatientAssessmentsFromStorage(patientId);
  const existingIndex = current.findIndex((item) => item.id === assessment.id);
  const updated = [...current];

  if (existingIndex >= 0) {
    updated[existingIndex] = assessment;
  } else {
    updated.unshift(assessment);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${PATIENT_ASSESSMENTS_KEY_PREFIX}${patientId}`, JSON.stringify(updated));
  }
  recordPatientActivity(patientId, 'assessment');
  return updated;
}

export function deletePatientFromStorage(id: string): void {
  const current = getPatientsFromStorage();
  const updatedList = current.filter((p) => p.id !== id);
  writePatients(updatedList);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${PATIENT_ASSESSMENTS_KEY_PREFIX}${id}`);
  }
}

export function getConsultationRecord(patientId: string, rawDateParam: string): ConsultationRecord {
  const normalizedDate = decodeURIComponent(rawDateParam).replace(/-/g, '/');
  
  let diet: HistoricalDiet | undefined = undefined;
  let assessment: BodyAssessment | undefined = undefined;

  // Retrieve saved patient diets if available
  if (typeof window !== 'undefined') {
    try {
      const savedDietsRaw = localStorage.getItem(`${PATIENT_DIETS_KEY_PREFIX}${patientId}`);
      if (savedDietsRaw) {
        const savedDiets = JSON.parse(savedDietsRaw);
        const match = savedDiets.find((d: any) => d.createdAt === normalizedDate || d.updatedAt === normalizedDate);
        if (match) {
          const simpleMeals = match.simpleMeals || [];
          const meals = simpleMeals.map((m: any) => {
            const items = m.items || [];
            const p = Math.round(items.reduce((a: number, i: any) => a + (Number(i.protein) || 0), 0) * 10) / 10;
            const c = Math.round(items.reduce((a: number, i: any) => a + (Number(i.carbs) || 0), 0) * 10) / 10;
            const f = Math.round(items.reduce((a: number, i: any) => a + (Number(i.fats) || 0), 0) * 10) / 10;
            const kcal = calculatePresetCalories(p, c, f);
            const itemsSummary = items.length > 0
              ? items.map((i: any) => `${i.name} (${i.quantityGrams}g)`).join(', ')
              : undefined;

            return {
              name: m.name || 'Refeição',
              time: m.time || '00:00',
              kcal,
              proteinG: p,
              carbsG: c,
              fatsG: f,
              itemsSummary,
            };
          });

          const totalProteinG = Math.round(meals.reduce((acc: number, m: any) => acc + m.proteinG, 0) * 10) / 10;
          const totalCarbsG = Math.round(meals.reduce((acc: number, m: any) => acc + m.carbsG, 0) * 10) / 10;
          const totalFatsG = Math.round(meals.reduce((acc: number, m: any) => acc + m.fatsG, 0) * 10) / 10;
          const totalKcal = calculatePresetCalories(totalProteinG, totalCarbsG, totalFatsG);

          diet = {
            id: match.id,
            name: match.name || 'Prescrição Alimentar',
            date: normalizedDate,
            targetKcal: totalKcal || Number(match.simpleTargetKcal) || 0,
            proteinG: totalProteinG || Number(match.simpleTargetProtein) || 0,
            carbsG: totalCarbsG || Number(match.simpleTargetCarbs) || 0,
            fatsG: totalFatsG || Number(match.simpleTargetFats) || 0,
            status: 'Ativa',
            meals,
          };
        }
      }

      const savedAssessments = getPatientAssessmentsFromStorage(patientId);
      assessment = savedAssessments.find(
        (item) => normalizeDateKey(item.date) === normalizeDateKey(rawDateParam),
      );
    } catch {
      // Ignore JSON parse errors
    }
  }

  return {
    date: normalizedDate,
    diet,
    assessment,
    notes: 'Sem observações registradas para esta consulta.',
    prescribedSupplements: [],
  };
}
