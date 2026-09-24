import { calculateBodyComposition, normalizeBodyFatSex, type BodyFatSex } from '@/lib/bodyFat';
import type { Patient } from '@/lib/domain/patient';
import type { DietPlan } from '@/lib/domain/diets/diet-model';

export type ClinicalErrorCode =
  | 'CLINICAL_CONTEXT_MISSING'
  | 'CLINICAL_PATIENT_NOT_FOUND'
  | 'CLINICAL_PATIENT_ARCHIVED'
  | 'CLINICAL_ASSESSMENT_NOT_FOUND'
  | 'CLINICAL_SCOPE_VIOLATION'
  | 'CLINICAL_VALIDATION_FAILED'
  | 'CLINICAL_VERSION_CONFLICT'
  | 'CLINICAL_TRANSACTION_FAILED'
  | 'CLINICAL_READ_FAILED';

export class ClinicalApplicationError extends Error {
  readonly code: ClinicalErrorCode;
  readonly fieldErrors?: Readonly<Record<string, string>>;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly cause?: unknown;

  constructor(
    code: ClinicalErrorCode,
    message: string,
    options?: {
      fieldErrors?: Readonly<Record<string, string>>;
      details?: Readonly<Record<string, unknown>>;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = 'ClinicalApplicationError';
    this.code = code;
    this.fieldErrors = options?.fieldErrors;
    this.details = options?.details;
    this.cause = options?.cause;
  }
}

export type FollowUpType = 'ASSESSMENT_UPDATE' | 'DIET_UPDATE';
export type FollowUpStatus = 'OVERDUE' | 'TODAY' | 'UPCOMING';
export type AssessmentType = 'complete' | 'simplified';
export type CalculationMethod = 'US_NAVY' | 'NONE';

export interface CalculationInputSnapshot {
  sex: BodyFatSex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  abdomenCm: number;
  hipCm: number;
  weightKg: number;
}

export interface SimplifiedAssessmentSnapshot {
  assessmentType: 'simplified';
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  abdomenCm?: number;
  hipCm?: number;
}

export type AssessmentInputSnapshot = CalculationInputSnapshot | SimplifiedAssessmentSnapshot;

export type AssessmentMeasurementKey =
  | 'weightKg'
  | 'neckCm'
  | 'scapulaCm'
  | 'bustCm'
  | 'leftArmCm'
  | 'rightArmCm'
  | 'waistCm'
  | 'abdomenCm'
  | 'hipCm'
  | 'leftProximalThighCm'
  | 'rightProximalThighCm'
  | 'leftDistalThighCm'
  | 'rightDistalThighCm'
  | 'leftCalfCm'
  | 'rightCalfCm';

export interface BodyAssessment {
  id: string;
  accountId: string;
  patientId: string;
  clinicalDate: string;
  assessmentType?: AssessmentType;
  weightKg: number;
  bodyFatPercent?: number;
  fatMassKg?: number;
  leanMassKg?: number;
  waistCm?: number;
  scapulaCm?: number;
  bustCm?: number;
  abdomenCm?: number;
  hipCm?: number;
  leftProximalThighCm?: number;
  rightProximalThighCm?: number;
  neckCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftDistalThighCm?: number;
  rightDistalThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
  autoFilledFields: string[];
  calculationMethod: CalculationMethod;
  calculationVersion: string;
  calculationInputSnapshot: AssessmentInputSnapshot;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export function getAssessmentType(assessment: {
  assessmentType?: AssessmentType;
  calculationMethod?: CalculationMethod;
}): AssessmentType {
  return assessment.assessmentType ?? (assessment.calculationMethod === 'NONE' ? 'simplified' : 'complete');
}

export type AssessmentInput = Partial<Pick<BodyAssessment,
  | 'clinicalDate'
  | 'assessmentType'
  | 'weightKg'
  | 'waistCm'
  | 'scapulaCm'
  | 'bustCm'
  | 'abdomenCm'
  | 'hipCm'
  | 'leftProximalThighCm'
  | 'rightProximalThighCm'
  | 'neckCm'
  | 'leftArmCm'
  | 'rightArmCm'
  | 'leftDistalThighCm'
  | 'rightDistalThighCm'
  | 'leftCalfCm'
  | 'rightCalfCm'
>> & {
  heightCm?: number;
  /** Compatibility with the existing form, which calls the field `date`. */
  date?: string;
};

export type AssessmentPersistenceInput = Omit<BodyAssessment, 'id' | 'accountId' | 'patientId' | 'version' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  accountId?: string;
  patientId?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
};

export interface NextFollowUp {
  accountId: string;
  patientId: string;
  dueDate: string;
  type: FollowUpType[];
  comments?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface NextFollowUpInput {
  dueDate?: string | null;
  type?: FollowUpType | FollowUpType[] | string | null;
  comments?: string | null;
}

export interface ConsultationView {
  patient: Patient;
  date: string;
  assessments: BodyAssessment[];
  diets: DietPlan[];
  notesState: 'EMPTY_NOT_PERSISTED';
  prescribedSupplements: string[];
}

export interface ClinicalPatientContext {
  id: string;
  accountId: string;
  gender: string;
  heightCm: number | null;
  archivedAt: string | null;
}

export interface BuildAssessmentOptions {
  accountId: string;
  patientId: string;
  patient: ClinicalPatientContext;
  previousAssessment?: BodyAssessment | null;
  id: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  now?: () => string;
  calculationVersion?: string;
}

const PAIRS: ReadonlyArray<readonly [AssessmentMeasurementKey, AssessmentMeasurementKey]> = [
  ['leftArmCm', 'rightArmCm'],
  ['leftProximalThighCm', 'rightProximalThighCm'],
  ['leftDistalThighCm', 'rightDistalThighCm'],
  ['leftCalfCm', 'rightCalfCm'],
];

const ASSISTABLE_FIELDS: readonly AssessmentMeasurementKey[] = [
  'neckCm',
  'leftArmCm',
  'rightArmCm',
  'leftDistalThighCm',
  'rightDistalThighCm',
  'leftCalfCm',
  'rightCalfCm',
];

const REQUIRED_FIELDS: readonly AssessmentMeasurementKey[] = [
  'weightKg',
  'scapulaCm',
  'bustCm',
  'waistCm',
  'abdomenCm',
  'hipCm',
];

function isPositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (typeof value === 'number' && (!Number.isFinite(value) || value <= 0));
}

function error(message: string, fieldErrors: Record<string, string> = {}): never {
  throw new ClinicalApplicationError('CLINICAL_VALIDATION_FAILED', message, { fieldErrors });
}

function readDateParts(value: string): [number, number, number] | null {
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) return [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  const pt = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(trimmed);
  if (pt) return [Number(pt[3]), Number(pt[2]), Number(pt[1])];
  return null;
}

export function normalizeClinicalDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parts = readDateParts(value);
  if (!parts) return null;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function numericInput(input: AssessmentInput, field: AssessmentMeasurementKey): number | undefined {
  const value = input[field];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function hasValue(value: unknown): value is number {
  return isPositive(value);
}

export function normalizePairedMeasurements<T extends Partial<Record<AssessmentMeasurementKey, number | null | undefined>>>(input: T): T {
  const normalized = { ...input } as T & Partial<Record<AssessmentMeasurementKey, number>>;
  for (const [leftKey, rightKey] of PAIRS) {
    const left = normalized[leftKey];
    const right = normalized[rightKey];
    if (hasValue(left) && !hasValue(right)) normalized[rightKey] = left;
    if (!hasValue(left) && hasValue(right)) normalized[leftKey] = right;
  }
  return normalized;
}

function autoFillInput(input: AssessmentInput, previous: BodyAssessment | null | undefined): { input: AssessmentInput; autoFilledFields: string[] } {
  const current = { ...input } as AssessmentInput & Partial<Record<AssessmentMeasurementKey, number>>;
  const autoFilledFields: string[] = [];

  if (previous) {
    for (const field of ASSISTABLE_FIELDS) {
      if (isMissing(current[field]) && isPositive(previous[field])) {
        current[field] = previous[field];
        autoFilledFields.push(field);
      }
    }
  }

  for (const [leftKey, rightKey] of PAIRS) {
    const leftMissing = isMissing(current[leftKey]);
    const rightMissing = isMissing(current[rightKey]);
    if (leftMissing && !rightMissing && hasValue(current[rightKey])) autoFilledFields.push(leftKey);
    if (rightMissing && !leftMissing && hasValue(current[leftKey])) autoFilledFields.push(rightKey);
  }

  return { input: normalizePairedMeasurements(current), autoFilledFields: Array.from(new Set(autoFilledFields)) };
}

export function buildBodyAssessment(input: AssessmentInput, options: BuildAssessmentOptions): BodyAssessment {
  if (options.accountId !== options.patient.accountId || options.patientId !== options.patient.id) {
    throw new ClinicalApplicationError('CLINICAL_SCOPE_VIOLATION', 'A avaliação não pertence ao escopo clínico informado.');
  }
  if (options.patient.archivedAt !== null) {
    throw new ClinicalApplicationError('CLINICAL_PATIENT_ARCHIVED', 'Paciente arquivado não pode receber mutações clínicas.');
  }

  const clinicalDate = normalizeClinicalDate(input.clinicalDate ?? input.date);
  if (!clinicalDate) error('Informe uma data clínica válida.', { clinicalDate: 'Use o formato DD/MM/AAAA ou AAAA-MM-DD.' });

  const now = options.now ?? (() => new Date().toISOString());
  const timestamp = options.updatedAt ?? now();
  const createdAt = options.createdAt ?? timestamp;

  if (input.assessmentType === 'simplified') {
    const fieldErrors: Record<string, string> = {};
    if (!isPositive(input.weightKg)) fieldErrors.weightKg = 'Informe um peso maior que zero.';
    if (!isPositive(input.heightCm)) fieldErrors.heightCm = 'Informe uma altura maior que zero.';
    for (const field of ['waistCm', 'abdomenCm', 'hipCm'] as const) {
      if (input[field] !== undefined && !isPositive(input[field])) {
        fieldErrors[field] = 'Informe um valor maior que zero ou deixe o campo vazio.';
      }
    }
    if (Object.keys(fieldErrors).length > 0) error('Preencha os campos obrigatórios da avaliação simplificada.', fieldErrors);

    return {
      id: options.id,
      accountId: options.accountId,
      patientId: options.patientId,
      clinicalDate,
      assessmentType: 'simplified',
      weightKg: input.weightKg!,
      waistCm: input.waistCm,
      abdomenCm: input.abdomenCm,
      hipCm: input.hipCm,
      autoFilledFields: [],
      calculationMethod: 'NONE',
      calculationVersion: options.calculationVersion ?? 'simplified-v1',
      calculationInputSnapshot: {
        assessmentType: 'simplified',
        heightCm: input.heightCm!,
        weightKg: input.weightKg!,
        waistCm: input.waistCm,
        abdomenCm: input.abdomenCm,
        hipCm: input.hipCm,
      },
      version: options.version ?? 1,
      createdAt,
      updatedAt: timestamp,
    };
  }

  const filled = autoFillInput(input, options.previousAssessment);
  const completed = filled.input;
  const fieldErrors: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    if (!isPositive(completed[field])) fieldErrors[field] = 'Informe um valor maior que zero.';
  }
  const hasProximalThigh = isPositive(completed.leftProximalThighCm) || isPositive(completed.rightProximalThighCm);
  if (!hasProximalThigh) fieldErrors.leftProximalThighCm = 'Informe ao menos uma medida de coxa proximal.';
  if (Object.keys(fieldErrors).length > 0) error('Preencha os campos obrigatórios da avaliação.', fieldErrors);

  const sex = normalizeBodyFatSex(options.patient.gender);
  if (!sex) error('O gênero do paciente deve ser Masculino ou Feminino.', { gender: 'Gênero inválido para a equação US Navy.' });
  if (!isPositive(options.patient.heightCm)) {
    error('Cadastre a altura do paciente antes de registrar uma avaliação.', { heightCm: 'Informe uma altura maior que zero.' });
  }

  const neckCm = isPositive(completed.neckCm)
    ? completed.neckCm
    : sex === 'female' ? 34 : 38;
  const calculation = calculateBodyComposition({
    sex,
    heightCm: options.patient.heightCm,
    neckCm,
    waistCm: completed.waistCm!,
    abdomenCm: completed.abdomenCm!,
    hipCm: completed.hipCm!,
    weightKg: completed.weightKg!,
  });
  if (!calculation.isValid || calculation.bodyFatPercent === null || calculation.fatMassKg === null || calculation.leanMassKg === null) {
    error(calculation.error ?? 'A composição corporal informada é inválida.');
  }

  const autoFilledFields = filled.autoFilledFields;
  const normalized = normalizePairedMeasurements(completed);

  return {
    id: options.id,
    accountId: options.accountId,
    patientId: options.patientId,
    clinicalDate,
    assessmentType: 'complete',
    weightKg: normalized.weightKg!,
    bodyFatPercent: calculation.bodyFatPercent,
    fatMassKg: calculation.fatMassKg,
    leanMassKg: calculation.leanMassKg,
    waistCm: normalized.waistCm!,
    scapulaCm: normalized.scapulaCm!,
    bustCm: normalized.bustCm!,
    abdomenCm: normalized.abdomenCm!,
    hipCm: normalized.hipCm!,
    leftProximalThighCm: normalized.leftProximalThighCm!,
    rightProximalThighCm: normalized.rightProximalThighCm!,
    neckCm,
    leftArmCm: normalized.leftArmCm,
    rightArmCm: normalized.rightArmCm,
    leftDistalThighCm: normalized.leftDistalThighCm,
    rightDistalThighCm: normalized.rightDistalThighCm,
    leftCalfCm: normalized.leftCalfCm,
    rightCalfCm: normalized.rightCalfCm,
    autoFilledFields,
    calculationMethod: 'US_NAVY',
    calculationVersion: options.calculationVersion ?? 'us-navy-v1',
    calculationInputSnapshot: {
      sex,
      heightCm: options.patient.heightCm,
      neckCm,
      waistCm: normalized.waistCm!,
      abdomenCm: normalized.abdomenCm!,
      hipCm: normalized.hipCm!,
      weightKg: normalized.weightKg!,
    },
    version: options.version ?? 1,
    createdAt,
    updatedAt: timestamp,
  };
}

export interface NextFollowUpValidationResult {
  valid: boolean;
  fieldErrors: Record<string, string>;
}

const FOLLOW_UP_TYPES: readonly FollowUpType[] = ['ASSESSMENT_UPDATE', 'DIET_UPDATE'];

function normalizeFollowUpTypes(value: NextFollowUpInput['type']): FollowUpType[] | null {
  const selected: unknown[] = value == null ? [] : Array.isArray(value) ? value : [value];
  if (selected.length === 0 || selected.some((type) => !FOLLOW_UP_TYPES.includes(type as FollowUpType))) return null;
  return FOLLOW_UP_TYPES.filter((type) => selected.includes(type));
}

export function validateNextFollowUpInput(input: NextFollowUpInput): NextFollowUpValidationResult {
  const fieldErrors: Record<string, string> = {};
  if (!normalizeClinicalDate(input.dueDate)) fieldErrors.dueDate = 'Informe uma data de acompanhamento válida.';
  if (!normalizeFollowUpTypes(input.type)) fieldErrors.type = 'Selecione ao menos um tipo de acompanhamento válido.';
  if (input.comments != null && typeof input.comments !== 'string') fieldErrors.comments = 'Informe comentários válidos.';
  return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

export function normalizeNextFollowUpInput(input: NextFollowUpInput): { dueDate: string; type: FollowUpType[]; comments: string } {
  const result = validateNextFollowUpInput(input);
  if (!result.valid) throw new ClinicalApplicationError('CLINICAL_VALIDATION_FAILED', 'O acompanhamento informado é inválido.', { fieldErrors: result.fieldErrors });
  return { dueDate: normalizeClinicalDate(input.dueDate)!, type: normalizeFollowUpTypes(input.type)!, comments: input.comments ?? '' };
}

export function getFollowUpStatus(dueDate: string, today = localToday()): FollowUpStatus {
  const normalizedDueDate = normalizeClinicalDate(dueDate);
  const normalizedToday = normalizeClinicalDate(today);
  if (!normalizedDueDate || !normalizedToday) throw new ClinicalApplicationError('CLINICAL_VALIDATION_FAILED', 'A data do acompanhamento é inválida.');
  if (normalizedDueDate < normalizedToday) return 'OVERDUE';
  if (normalizedDueDate === normalizedToday) return 'TODAY';
  return 'UPCOMING';
}

function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function sortAssessments(assessments: readonly BodyAssessment[]): BodyAssessment[] {
  return [...assessments].sort((left, right) =>
    right.clinicalDate.localeCompare(left.clinicalDate) ||
    right.createdAt.localeCompare(left.createdAt) ||
    left.id.localeCompare(right.id),
  );
}

export function latestAssessments(assessments: readonly BodyAssessment[]): { latestAssessment: BodyAssessment | null; previousAssessment: BodyAssessment | null } {
  const sorted = sortAssessments(assessments);
  return { latestAssessment: sorted[0] ?? null, previousAssessment: sorted[1] ?? null };
}
