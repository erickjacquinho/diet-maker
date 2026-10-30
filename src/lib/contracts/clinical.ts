import type {
  AssessmentInput,
  AssessmentInputSnapshot,
  AssessmentType,
  BodyAssessment,
  CalculationMethod,
  FollowUpType,
  NextFollowUp,
  NextFollowUpInput,
} from '@/lib/domain/clinical';

/** Wire contracts for assessments and next follow-up. Shared by browser and server; no database types. */

export type AssessmentDto = Omit<BodyAssessment, 'accountId'>;

export type FollowUpDto = Omit<NextFollowUp, 'accountId'>;

export interface CreateAssessmentRequest {
  /** Client-generated stable ID; repeating the request returns the same assessment. */
  id: string;
  assessment: AssessmentInput;
}

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const measurementKeys = [
  'weightKg', 'waistCm', 'scapulaCm', 'bustCm', 'abdomenCm', 'hipCm', 'leftProximalThighCm', 'rightProximalThighCm',
  'neckCm', 'leftArmCm', 'rightArmCm', 'leftDistalThighCm', 'rightDistalThighCm', 'leftCalfCm', 'rightCalfCm', 'heightCm',
] as const;
const assessmentKeys = [...measurementKeys, 'clinicalDate', 'date', 'assessmentType'] as const;
const followUpTypes: readonly FollowUpType[] = ['ASSESSMENT_UPDATE', 'DIET_UPDATE'];

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object.');
  return value as Record<string, unknown>;
}

function assertKeys(value: Record<string, unknown>, allowed: readonly string[]): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError('Unknown field.');
}

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('Invalid number.');
  return value;
}

function optionalDate(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.length > 10) throw new TypeError('Invalid date.');
  return value;
}

/** Strict parser: accountId, patientId, version, results and timestamps are rejected. */
export function parseAssessmentInput(value: unknown): AssessmentInput {
  const input = record(value);
  assertKeys(input, assessmentKeys);
  const parsed: Record<string, unknown> = {};
  for (const key of measurementKeys) {
    const number = optionalNumber(input[key]);
    if (number !== undefined) parsed[key] = number;
  }
  const clinicalDate = optionalDate(input.clinicalDate);
  const date = optionalDate(input.date);
  if (clinicalDate !== undefined) parsed.clinicalDate = clinicalDate;
  if (date !== undefined) parsed.date = date;
  if (input.assessmentType !== undefined) {
    if (input.assessmentType !== 'complete' && input.assessmentType !== 'simplified') throw new TypeError('Invalid type.');
    parsed.assessmentType = input.assessmentType;
  }
  return parsed as AssessmentInput;
}

export function parseCreateAssessmentRequest(value: unknown): CreateAssessmentRequest {
  const body = record(value);
  assertKeys(body, ['id', 'assessment']);
  if (typeof body.id !== 'string' || !uuidPattern.test(body.id)) throw new TypeError('Invalid id.');
  return { id: body.id.toLowerCase(), assessment: parseAssessmentInput(body.assessment) };
}

export function parseUpdateAssessmentRequest(value: unknown): AssessmentInput {
  const body = record(value);
  assertKeys(body, ['assessment']);
  return parseAssessmentInput(body.assessment);
}

export function parseFollowUpInput(value: unknown): NextFollowUpInput {
  const body = record(value);
  assertKeys(body, ['followUp']);
  const input = record(body.followUp);
  assertKeys(input, ['dueDate', 'dueDates', 'type', 'comments']);
  const parsed: NextFollowUpInput = {};
  if (input.dueDate !== undefined) parsed.dueDate = input.dueDate === null ? null : optionalDate(input.dueDate);
  if (input.dueDates !== undefined) {
    const raw = record(input.dueDates);
    assertKeys(raw, followUpTypes);
    parsed.dueDates = {};
    for (const type of followUpTypes) {
      if (raw[type] !== undefined) parsed.dueDates[type] = raw[type] === null ? null : optionalDate(raw[type]);
    }
  }
  if (input.type !== undefined) {
    const types = input.type === null ? [] : Array.isArray(input.type) ? input.type : [input.type];
    if (!types.every((type) => typeof type === 'string' && followUpTypes.includes(type as FollowUpType))) throw new TypeError('Invalid type.');
    parsed.type = types as FollowUpType[];
  }
  if (input.comments !== undefined) {
    if (input.comments !== null && (typeof input.comments !== 'string' || input.comments.length > 2000)) throw new TypeError('Invalid comments.');
    parsed.comments = input.comments as string | null;
  }
  return parsed;
}

/** Output allowlist: copies only the public fields, whatever the handler returned. */
export function parseAssessmentDto(value: unknown): AssessmentDto {
  const a = record(value);
  const dto: Record<string, unknown> = {
    id: String(a.id), patientId: String(a.patientId), clinicalDate: String(a.clinicalDate),
    assessmentType: a.assessmentType as AssessmentType, weightKg: Number(a.weightKg),
    autoFilledFields: Array.isArray(a.autoFilledFields) ? a.autoFilledFields.map(String) : [],
    calculationMethod: a.calculationMethod as CalculationMethod, calculationVersion: String(a.calculationVersion),
    calculationInputSnapshot: a.calculationInputSnapshot as AssessmentInputSnapshot,
    version: Number(a.version), createdAt: String(a.createdAt), updatedAt: String(a.updatedAt),
  };
  for (const key of [
    'bodyFatPercent', 'fatMassKg', 'leanMassKg', 'waistCm', 'scapulaCm', 'bustCm', 'abdomenCm', 'hipCm',
    'leftProximalThighCm', 'rightProximalThighCm', 'neckCm', 'leftArmCm', 'rightArmCm',
    'leftDistalThighCm', 'rightDistalThighCm', 'leftCalfCm', 'rightCalfCm',
  ]) {
    if (typeof a[key] === 'number') dto[key] = a[key];
  }
  return dto as unknown as AssessmentDto;
}

export function parseAssessmentListDto(value: unknown): { items: AssessmentDto[] } {
  const list = record(value);
  if (!Array.isArray(list.items)) throw new TypeError('Invalid list.');
  return { items: list.items.map(parseAssessmentDto) };
}

export function parseFollowUpDto(value: unknown): FollowUpDto {
  const f = record(value);
  const dueDates: Partial<Record<FollowUpType, string>> = {};
  const rawDates = record(f.dueDates ?? {});
  for (const type of followUpTypes) if (typeof rawDates[type] === 'string') dueDates[type] = rawDates[type] as string;
  return {
    patientId: String(f.patientId), dueDate: String(f.dueDate), dueDates,
    type: followUpTypes.filter((type) => dueDates[type] !== undefined),
    comments: typeof f.comments === 'string' ? f.comments : '',
    version: Number(f.version), createdAt: String(f.createdAt), updatedAt: String(f.updatedAt),
  };
}

/** `null` means the patient has no confirmed follow-up. */
export function parseOptionalFollowUpDto(value: unknown): { followUp: FollowUpDto | null } {
  const body = record(value);
  return { followUp: body.followUp === null ? null : parseFollowUpDto(body.followUp) };
}

export function parseEmptyDto(): Record<string, never> {
  return {};
}
