/**
 * Boundary for clinical records owned by later SDDs.
 *
 * This module intentionally has no adapter implementation in the patient
 * stage: legacy test storage is not a source of truth for the new flow.
 */
import type {
  BodyAssessment,
  HistoricalDiet,
  PatientNextEvent,
  StoredDietRecord,
} from './patientsStoreTypes';

export type { BodyAssessment, HistoricalDiet, PatientNextEvent, StoredDietRecord };

export interface PatientRelatedRecordsReader {
  listAssessments(patientId: string): Promise<BodyAssessment[]>;
  listDiets(patientId: string): Promise<StoredDietRecord[]>;
}
