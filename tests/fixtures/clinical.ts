import type { BodyAssessment, FollowUpType, NextFollowUp } from '@/lib/domain/clinical';

export const CLINICAL_FIXTURE_NOW = '2026-09-11T12:00:00.000Z';

export const CLINICAL_ACCOUNTS = ['account-alpha', 'account-beta'] as const;

export const CLINICAL_PATIENTS = {
  active: { accountId: 'account-alpha', patientId: 'patient-alpha-active' },
  archived: { accountId: 'account-alpha', patientId: 'patient-alpha-archived' },
  otherAccount: { accountId: 'account-beta', patientId: 'patient-beta-active' },
} as const;

export const CLINICAL_ASSESSMENT_INPUT = {
  clinicalDate: '2026-09-10',
  weightKg: 62,
  waistCm: 72,
  scapulaCm: 15,
  bustCm: 92,
  abdomenCm: 76,
  hipCm: 98,
  leftProximalThighCm: 55,
  neckCm: 34,
  leftArmCm: 28,
  leftDistalThighCm: 45,
  leftCalfCm: 34,
} as const;

export const CLINICAL_FOLLOW_UP_TYPES: readonly FollowUpType[] = [
  'ASSESSMENT_UPDATE',
  'DIET_UPDATE',
];

export function makeClinicalAssessment(overrides: Partial<BodyAssessment> = {}): BodyAssessment {
  return {
    id: 'assessment-alpha-1',
    accountId: CLINICAL_PATIENTS.active.accountId,
    patientId: CLINICAL_PATIENTS.active.patientId,
    clinicalDate: CLINICAL_ASSESSMENT_INPUT.clinicalDate,
    weightKg: CLINICAL_ASSESSMENT_INPUT.weightKg,
    bodyFatPercent: 24.11,
    fatMassKg: 14.95,
    leanMassKg: 47.05,
    waistCm: CLINICAL_ASSESSMENT_INPUT.waistCm,
    scapulaCm: CLINICAL_ASSESSMENT_INPUT.scapulaCm,
    bustCm: CLINICAL_ASSESSMENT_INPUT.bustCm,
    abdomenCm: CLINICAL_ASSESSMENT_INPUT.abdomenCm,
    hipCm: CLINICAL_ASSESSMENT_INPUT.hipCm,
    leftProximalThighCm: CLINICAL_ASSESSMENT_INPUT.leftProximalThighCm,
    rightProximalThighCm: CLINICAL_ASSESSMENT_INPUT.leftProximalThighCm,
    neckCm: CLINICAL_ASSESSMENT_INPUT.neckCm,
    leftArmCm: CLINICAL_ASSESSMENT_INPUT.leftArmCm,
    rightArmCm: CLINICAL_ASSESSMENT_INPUT.leftArmCm,
    leftDistalThighCm: CLINICAL_ASSESSMENT_INPUT.leftDistalThighCm,
    rightDistalThighCm: CLINICAL_ASSESSMENT_INPUT.leftDistalThighCm,
    leftCalfCm: CLINICAL_ASSESSMENT_INPUT.leftCalfCm,
    rightCalfCm: CLINICAL_ASSESSMENT_INPUT.leftCalfCm,
    autoFilledFields: [],
    calculationMethod: 'US_NAVY',
    calculationVersion: 'us-navy-v1',
    calculationInputSnapshot: {
      sex: 'female',
      heightCm: 165,
      neckCm: CLINICAL_ASSESSMENT_INPUT.neckCm,
      waistCm: CLINICAL_ASSESSMENT_INPUT.waistCm,
      abdomenCm: CLINICAL_ASSESSMENT_INPUT.abdomenCm,
      hipCm: CLINICAL_ASSESSMENT_INPUT.hipCm,
      weightKg: CLINICAL_ASSESSMENT_INPUT.weightKg,
    },
    version: 1,
    createdAt: CLINICAL_FIXTURE_NOW,
    updatedAt: CLINICAL_FIXTURE_NOW,
    ...overrides,
  };
}

export function makeClinicalFollowUp(overrides: Partial<NextFollowUp> = {}): NextFollowUp {
  return {
    accountId: CLINICAL_PATIENTS.active.accountId,
    patientId: CLINICAL_PATIENTS.active.patientId,
    dueDate: '2026-09-15',
    type: 'ASSESSMENT_UPDATE',
    version: 1,
    createdAt: CLINICAL_FIXTURE_NOW,
    updatedAt: CLINICAL_FIXTURE_NOW,
    ...overrides,
  };
}
