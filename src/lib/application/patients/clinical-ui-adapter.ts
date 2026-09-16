import {
  getAssessmentType,
  type AssessmentInput,
  type BodyAssessment as ClinicalBodyAssessment,
  type NextFollowUp,
  type NextFollowUpInput,
} from '@/lib/domain/clinical';
import type { BodyAssessment, PatientLastActivity, PatientNextEvent } from '@/lib/patientsStoreTypes';

export type { BodyAssessment, HistoricalDiet, Patient, PatientLastActivity, PatientNextEvent, PatientNextEventType } from '@/lib/patientsStoreTypes';

function dateToLegacy(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
}

function numeric(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function toLegacyAssessment(assessment: ClinicalBodyAssessment): BodyAssessment {
  return {
    id: assessment.id,
    accountId: assessment.accountId,
    patientId: assessment.patientId,
    clinicalDate: assessment.clinicalDate,
    version: assessment.version,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt,
    date: dateToLegacy(assessment.clinicalDate),
    assessmentType: getAssessmentType(assessment),
    heightCm: assessment.calculationInputSnapshot.heightCm,
    weightKg: assessment.weightKg,
    bodyFatPercent: assessment.bodyFatPercent,
    fatMassKg: assessment.fatMassKg,
    muscleMassKg: assessment.leanMassKg,
    waistCm: assessment.waistCm,
    neckCm: assessment.neckCm,
    scapulaCm: assessment.scapulaCm,
    bustCm: assessment.bustCm,
    leftArmCm: assessment.leftArmCm,
    rightArmCm: assessment.rightArmCm,
    abdomenCm: assessment.abdomenCm,
    hipCm: assessment.hipCm,
    leftProximalThighCm: assessment.leftProximalThighCm,
    rightProximalThighCm: assessment.rightProximalThighCm,
    leftDistalThighCm: assessment.leftDistalThighCm,
    rightDistalThighCm: assessment.rightDistalThighCm,
    leftCalfCm: assessment.leftCalfCm,
    rightCalfCm: assessment.rightCalfCm,
    autoFilledFields: [...assessment.autoFilledFields],
    calculationMethod: assessment.calculationMethod,
    calculationVersion: assessment.calculationVersion,
    calculationInputSnapshot: assessment.calculationInputSnapshot,
  };
}

export function toAssessmentInput(assessment: BodyAssessment): AssessmentInput {
  return {
    clinicalDate: assessment.clinicalDate,
    date: assessment.date,
    assessmentType: getAssessmentType(assessment),
    heightCm: numeric(assessment.heightCm),
    weightKg: numeric(assessment.weightKg),
    waistCm: numeric(assessment.waistCm),
    scapulaCm: numeric(assessment.scapulaCm),
    bustCm: numeric(assessment.bustCm),
    abdomenCm: numeric(assessment.abdomenCm),
    hipCm: numeric(assessment.hipCm),
    leftProximalThighCm: numeric(assessment.leftProximalThighCm),
    rightProximalThighCm: numeric(assessment.rightProximalThighCm),
    neckCm: numeric(assessment.neckCm),
    leftArmCm: numeric(assessment.leftArmCm),
    rightArmCm: numeric(assessment.rightArmCm),
    leftDistalThighCm: numeric(assessment.leftDistalThighCm),
    rightDistalThighCm: numeric(assessment.rightDistalThighCm),
    leftCalfCm: numeric(assessment.leftCalfCm),
    rightCalfCm: numeric(assessment.rightCalfCm),
  };
}

export function toLegacyNextEvent(followUp: NextFollowUp | null): PatientNextEvent | null {
  if (!followUp) return null;
  return { date: dateToLegacy(followUp.dueDate), type: followUp.type === 'DIET_UPDATE' ? 'diet-update' : 'assessment-update', version: followUp.version };
}

export function toNextFollowUpInput(event: Pick<PatientNextEvent, 'date' | 'type'>): NextFollowUpInput {
  return { dueDate: event.date, type: event.type === 'diet-update' ? 'DIET_UPDATE' : 'ASSESSMENT_UPDATE' };
}

export function toLegacyLastActivity(activity: { eventDate: string; type: 'assessment' | 'diet' } | null | undefined): PatientLastActivity | null {
  if (!activity) return null;
  return { at: dateToLegacy(activity.eventDate), type: activity.type };
}

export function toClinicalConsultationDate(value: string): string {
  const match = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const iso = /^(\d{4})[/-](\d{2})[/-](\d{2})$/.exec(value);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : value;
}
