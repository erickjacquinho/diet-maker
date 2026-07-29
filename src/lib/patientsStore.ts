'use client';

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

  const created: Patient = {
    ...newPatient,
    id: `pat-${Date.now()}`,
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

