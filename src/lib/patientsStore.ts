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

export function getPatientsFromStorage(): Patient[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PATIENTS_KEY);
    return saved ? JSON.parse(saved) : [];
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
  };

  const updated = [created, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(updated));
  }
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
    ...updatedPatient,
    initials,
  };

  const updatedList = current.map((p) => (p.id === updatedPatient.id ? patientToSave : p));
  // If the patient was not found in storage (e.g. mock fallback patient), add it
  const exists = current.some((p) => p.id === updatedPatient.id);
  const finalList = exists ? updatedList : [patientToSave, ...current];

  if (typeof window !== 'undefined') {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(finalList));
  }
  return patientToSave;
}

export function deletePatientFromStorage(id: string): void {
  const current = getPatientsFromStorage();
  const updatedList = current.filter((p) => p.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(updatedList));
  }
}

export function getConsultationRecord(patientId: string, rawDateParam: string): ConsultationRecord {
  const normalizedDate = decodeURIComponent(rawDateParam).replace(/-/g, '/');
  
  let diet: HistoricalDiet | undefined = undefined;
  let assessment: BodyAssessment | undefined = undefined;

  // Retrieve saved patient diets if available
  if (typeof window !== 'undefined') {
    try {
      const savedDietsRaw = localStorage.getItem(`nutridiet_diets_${patientId}`);
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

