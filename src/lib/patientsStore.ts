'use client';

import { nanoid } from 'nanoid';
import {
  normalizeDateKey,
  normalizePairedBodyMeasurements,
  getConsultationRecordHelper,
} from './consultationStorageUtils';
import { getStorageItem, setStorageItem, removeStorageItem } from './storage';
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

import { DEFAULT_OBJECTIVES, DEFAULT_MARITAL_STATUSES } from './patientsStoreTypes';

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
export { DEFAULT_OBJECTIVES, DEFAULT_MARITAL_STATUSES, normalizeDateKey, normalizePairedBodyMeasurements };

const PATIENTS_KEY = 'nutridiet_patients';
const PATIENT_ASSESSMENTS_KEY_PREFIX = 'nutridiet_assessments_';
const PATIENT_DIETS_KEY_PREFIX = 'nutridiet_diets_';

export function formatPatientCode(index: number): string {
  return `P-${String(index).padStart(4, '0')}`;
}

function normalizePatient(patient: Patient, index: number = 0): Patient {
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
  setStorageItem(PATIENTS_KEY, patients);
}

export function getPatientsFromStorage(): Patient[] {
  const saved = getStorageItem<Patient[]>(PATIENTS_KEY, []);
  return saved.map((p, idx) => normalizePatient(p, idx));
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
  const saved = getStorageItem<BodyAssessment[]>(`${PATIENT_ASSESSMENTS_KEY_PREFIX}${patientId}`, []);
  return Array.isArray(saved) ? saved : [];
}

export function getPatientDietsFromStorage(patientId: string): StoredDietRecord[] {
  const saved = getStorageItem<StoredDietRecord[]>(`${PATIENT_DIETS_KEY_PREFIX}${patientId}`, []);
  return Array.isArray(saved) ? saved : [];
}

export function getPatientRecordHistory(patientId: string): PatientRecordHistory {
  const storedAssessments = getPatientAssessmentsFromStorage(patientId);
  const storedDiets = getPatientDietsFromStorage(patientId);
  const patient = getPatientById(patientId);

  const mergedAssessments = [...storedAssessments];
  if (patient?.bodyAssessments) {
    patient.bodyAssessments.forEach((item) => {
      if (!mergedAssessments.some((existing) => existing.id === item.id)) {
        mergedAssessments.push(item);
      }
    });
  }

  const hasDiet = storedDiets.length > 0 || Boolean(patient?.dietHistory?.length);

  return {
    assessments: mergedAssessments,
    hasDiet,
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

  setStorageItem(`${PATIENT_ASSESSMENTS_KEY_PREFIX}${patientId}`, updated);
  recordPatientActivity(patientId, 'assessment');
  return updated;
}

export function deletePatientFromStorage(id: string): void {
  const current = getPatientsFromStorage();
  const updatedList = current.filter((p) => p.id !== id);
  writePatients(updatedList);
  removeStorageItem(`${PATIENT_ASSESSMENTS_KEY_PREFIX}${id}`);
  removeStorageItem(`nutridiet_diets_${id}`);
}

export function deletePatientDietFromStorage(patientId: string, dietId: string): void {
  const currentDiets = getPatientDietsFromStorage(patientId);
  const updatedDiets = currentDiets.filter((d) => d.id !== dietId);
  setStorageItem(`${PATIENT_DIETS_KEY_PREFIX}${patientId}`, updatedDiets);

  const patient = getPatientById(patientId);
  if (patient && patient.dietHistory) {
    const updatedDietHistory = patient.dietHistory.filter((d) => d.id !== dietId);
    updatePatientInStorage({
      ...patient,
      dietHistory: updatedDietHistory,
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nutridiet-diet-sync', { detail: { patientId, dietId } }),
    );
  }
}

export function getConsultationRecord(patientId: string, rawDateParam: string): ConsultationRecord {
  return getConsultationRecordHelper(patientId, rawDateParam, getPatientAssessmentsFromStorage);
}
