'use client';

import { nanoid } from 'nanoid';
import {
  normalizeDateKey,
  normalizePairedBodyMeasurements,
  getConsultationRecordHelper,
} from './consultationStorageUtils';
import type {
  Patient,
  PatientNextEvent,
  PatientNextEventType,
  PatientLastActivity,
  PatientLastActivityType,
  HistoricalDiet,
  BodyAssessment,
  ConsultationRecord,
  StoredDietRecord,
  PatientRecordHistory,
} from './patientsStoreTypes';

import { DEFAULT_OBJECTIVES } from './patientsStoreTypes';

export type {
  Patient,
  PatientNextEvent,
  PatientNextEventType,
  PatientLastActivity,
  PatientLastActivityType,
  HistoricalDiet,
  BodyAssessment,
  ConsultationRecord,
  StoredDietRecord,
  PatientRecordHistory,
};
export { DEFAULT_OBJECTIVES, normalizeDateKey, normalizePairedBodyMeasurements };

const PATIENTS_KEY = 'nutridiet_patients';
const PATIENT_ASSESSMENTS_KEY_PREFIX = 'nutridiet_assessments_';
const PATIENT_DIETS_KEY_PREFIX = 'nutridiet_diets_';

export function formatPatientCode(index: number): string {
  return `P-${String(index).padStart(4, '0')}`;
}

function normalizePatient(patient: Patient, index: number): Patient {
  let id = patient.id;
  let legacyId = patient.legacyId;

  if (id && id.startsWith('pat-')) {
    legacyId = id;
    id = nanoid(8);
  }

  const code = patient.code ?? formatPatientCode(index + 1);

  return {
    ...patient,
    id,
    code,
    legacyId,
    nextEvent: patient.nextEvent ?? null,
    lastActivity: patient.lastActivity ?? null,
  };
}

function writePatients(patients: Patient[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  }
}

export function getPatientsFromStorage(): Patient[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PATIENTS_KEY);
    return saved ? (JSON.parse(saved) as Patient[]).map((p, idx) => normalizePatient(p, idx)) : [];
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
  const patientId = nanoid(8);
  const code = newPatient.code ?? formatPatientCode(current.length + 1);

  const created: Patient = {
    ...newPatient,
    id: patientId,
    code,
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
  return patients.find((p) => p.id === id || p.legacyId === id) || null;
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
  const normalizedAssessment = normalizePairedBodyMeasurements(assessment);
  const current = getPatientAssessmentsFromStorage(patientId);
  const existingIndex = current.findIndex((item) => item.id === normalizedAssessment.id);
  const updated = [...current];

  if (existingIndex >= 0) {
    updated[existingIndex] = normalizedAssessment;
  } else {
    updated.unshift(normalizedAssessment);
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
  return getConsultationRecordHelper(patientId, rawDateParam, getPatientAssessmentsFromStorage);
}
