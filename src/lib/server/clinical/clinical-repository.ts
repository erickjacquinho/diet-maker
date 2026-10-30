import 'server-only';

import { sql, type SQL } from 'drizzle-orm';
import {
  buildBodyAssessment,
  ClinicalApplicationError,
  normalizeNextFollowUpInput,
  sortAssessments,
  type AssessmentInput,
  type BodyAssessment,
  type CalculationMethod,
  type FollowUpType,
  type NextFollowUp,
  type NextFollowUpInput,
} from '@/lib/domain/clinical';
import type { FieldSealer } from '../crypto/account-keys';
import { ApiError, NotFoundError, VersionConflictError } from '../api/api-errors';
import type { SqlExecutor } from '../patients/patient-repository';

type AssessmentRow = {
  id: string;
  patient_id: string;
  clinical_date: string;
  assessment_type: 'complete' | 'simplified';
  weight_kg: string;
  body_fat_percent: string | null;
  fat_mass_kg: string | null;
  lean_mass_kg: string | null;
  waist_cm: string | null;
  scapula_cm: string | null;
  bust_cm: string | null;
  abdomen_cm: string | null;
  hip_cm: string | null;
  left_proximal_thigh_cm: string | null;
  right_proximal_thigh_cm: string | null;
  neck_cm: string | null;
  left_arm_cm: string | null;
  right_arm_cm: string | null;
  left_distal_thigh_cm: string | null;
  right_distal_thigh_cm: string | null;
  left_calf_cm: string | null;
  right_calf_cm: string | null;
  auto_filled_fields: string[];
  calculation_method: CalculationMethod;
  calculation_version: string;
  calculation_input: BodyAssessment['calculationInputSnapshot'];
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
};

type FollowUpRow = {
  patient_id: string;
  assessment_due_date: string | null;
  diet_due_date: string | null;
  comments: Uint8Array;
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
  cancelled_at: Date | string | null;
};

type PatientContextRow = { gender: string; height_cm: string | null; archived_at: Date | string | null };

const ASSESSMENT_COLUMNS = sql`id, patient_id, clinical_date::text AS clinical_date, assessment_type, weight_kg,
  body_fat_percent, fat_mass_kg, lean_mass_kg, waist_cm, scapula_cm, bust_cm, abdomen_cm, hip_cm,
  left_proximal_thigh_cm, right_proximal_thigh_cm, neck_cm, left_arm_cm, right_arm_cm, left_distal_thigh_cm,
  right_distal_thigh_cm, left_calf_cm, right_calf_cm, auto_filled_fields, calculation_method, calculation_version,
  calculation_input, version, created_at, updated_at`;
const FOLLOW_UP_COLUMNS = sql`patient_id, assessment_due_date::text AS assessment_due_date,
  diet_due_date::text AS diet_due_date, comments, version, created_at, updated_at, cancelled_at`;
const COMMENTS_COLUMN = 'next_follow_ups.comments';

const commentsSchema = {
  parse(value: unknown): string {
    if (typeof value !== 'string') throw new TypeError('Invalid comments payload.');
    return value;
  },
};

const num = (value: string | null): number | undefined => (value === null ? undefined : Number(value));
const iso = (value: Date | string): string => new Date(value).toISOString();

function toAssessment(row: AssessmentRow, accountId: string): BodyAssessment {
  return {
    id: row.id,
    accountId,
    patientId: row.patient_id,
    clinicalDate: row.clinical_date,
    assessmentType: row.assessment_type,
    weightKg: Number(row.weight_kg),
    bodyFatPercent: num(row.body_fat_percent),
    fatMassKg: num(row.fat_mass_kg),
    leanMassKg: num(row.lean_mass_kg),
    waistCm: num(row.waist_cm),
    scapulaCm: num(row.scapula_cm),
    bustCm: num(row.bust_cm),
    abdomenCm: num(row.abdomen_cm),
    hipCm: num(row.hip_cm),
    leftProximalThighCm: num(row.left_proximal_thigh_cm),
    rightProximalThighCm: num(row.right_proximal_thigh_cm),
    neckCm: num(row.neck_cm),
    leftArmCm: num(row.left_arm_cm),
    rightArmCm: num(row.right_arm_cm),
    leftDistalThighCm: num(row.left_distal_thigh_cm),
    rightDistalThighCm: num(row.right_distal_thigh_cm),
    leftCalfCm: num(row.left_calf_cm),
    rightCalfCm: num(row.right_calf_cm),
    autoFilledFields: row.auto_filled_fields,
    calculationMethod: row.calculation_method,
    calculationVersion: row.calculation_version,
    calculationInputSnapshot: row.calculation_input,
    version: row.version,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

/** Domain validation failures are client errors; the field names (never values) are echoed back. */
function asApiError(error: unknown): unknown {
  if (!(error instanceof ClinicalApplicationError)) return error;
  if (error.code === 'CLINICAL_SCOPE_VIOLATION') return new NotFoundError();
  const fields = Object.keys(error.fieldErrors ?? {}).join(',');
  return new ApiError(422, 'UNPROCESSABLE', fields ? { fields } : {});
}

export function createServerClinicalRepository(tx: SqlExecutor, sealer: FieldSealer, accountId: string) {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });

  async function patientContext(patientId: string) {
    const { rows } = await run<PatientContextRow>(
      sql`SELECT gender, height_cm, archived_at FROM app.patients WHERE account_id = ${accountId} AND id = ${patientId}`,
    );
    const row = rows[0];
    if (!row) throw new NotFoundError();
    return {
      id: patientId,
      accountId,
      gender: row.gender,
      heightCm: row.height_cm === null ? null : Number(row.height_cm),
      archivedAt: row.archived_at === null ? null : iso(row.archived_at),
    };
  }

  async function selectAssessment(patientId: string, id: string): Promise<BodyAssessment | null> {
    const { rows } = await run<AssessmentRow>(sql`
      SELECT ${ASSESSMENT_COLUMNS} FROM app.body_assessments
      WHERE account_id = ${accountId} AND patient_id = ${patientId} AND id = ${id}`);
    return rows[0] ? toAssessment(rows[0], accountId) : null;
  }

  async function listAssessments(patientId: string): Promise<BodyAssessment[]> {
    await patientContext(patientId);
    const { rows } = await run<AssessmentRow>(sql`
      SELECT ${ASSESSMENT_COLUMNS} FROM app.body_assessments
      WHERE account_id = ${accountId} AND patient_id = ${patientId}
      ORDER BY clinical_date DESC, created_at DESC, id LIMIT 500`);
    return rows.map((row) => toAssessment(row, accountId));
  }

  async function getAssessment(patientId: string, id: string): Promise<BodyAssessment> {
    const found = await selectAssessment(patientId, id);
    if (!found) throw new NotFoundError();
    return found;
  }

  function assessmentValues(a: BodyAssessment) {
    return sql`${a.clinicalDate}, ${a.assessmentType ?? 'complete'}, ${a.weightKg}, ${a.bodyFatPercent ?? null},
      ${a.fatMassKg ?? null}, ${a.leanMassKg ?? null}, ${a.waistCm ?? null}, ${a.scapulaCm ?? null}, ${a.bustCm ?? null},
      ${a.abdomenCm ?? null}, ${a.hipCm ?? null}, ${a.leftProximalThighCm ?? null}, ${a.rightProximalThighCm ?? null},
      ${a.neckCm ?? null}, ${a.leftArmCm ?? null}, ${a.rightArmCm ?? null}, ${a.leftDistalThighCm ?? null},
      ${a.rightDistalThighCm ?? null}, ${a.leftCalfCm ?? null}, ${a.rightCalfCm ?? null},
      ${JSON.stringify(a.autoFilledFields)}::jsonb, ${a.calculationMethod}, ${a.calculationVersion},
      ${JSON.stringify(a.calculationInputSnapshot)}::jsonb`;
  }

  async function buildAssessment(patientId: string, id: string, input: AssessmentInput, previous: BodyAssessment | null, extra: { version?: number; createdAt?: string }) {
    const patient = await patientContext(patientId);
    try {
      return buildBodyAssessment(input, { accountId, patientId, patient, previousAssessment: previous, id, ...extra });
    } catch (error) {
      throw asApiError(error);
    }
  }

  /** Idempotent: repeating a create with the same ID returns the stored assessment unchanged. */
  async function createAssessment(patientId: string, id: string, input: AssessmentInput) {
    const existing = await run<{ patient_id: string }>(
      sql`SELECT patient_id FROM app.body_assessments WHERE account_id = ${accountId} AND id = ${id}`,
    );
    if (existing.rows[0]) {
      if (existing.rows[0].patient_id !== patientId) throw new ApiError(409, 'CONFLICT');
      return { assessment: await getAssessment(patientId, id), created: false };
    }
    const previous = sortAssessments(await listAssessments(patientId))[0] ?? null;
    const built = await buildAssessment(patientId, id, input, previous, {});
    const { rows } = await run<AssessmentRow>(sql`
      INSERT INTO app.body_assessments (account_id, id, patient_id, clinical_date, assessment_type, weight_kg,
        body_fat_percent, fat_mass_kg, lean_mass_kg, waist_cm, scapula_cm, bust_cm, abdomen_cm, hip_cm,
        left_proximal_thigh_cm, right_proximal_thigh_cm, neck_cm, left_arm_cm, right_arm_cm, left_distal_thigh_cm,
        right_distal_thigh_cm, left_calf_cm, right_calf_cm, auto_filled_fields, calculation_method,
        calculation_version, calculation_input, version)
      VALUES (${accountId}, ${id}, ${patientId}, ${assessmentValues(built)}, 1)
      RETURNING ${ASSESSMENT_COLUMNS}`);
    return { assessment: toAssessment(rows[0], accountId), created: true };
  }

  async function updateAssessment(patientId: string, id: string, expectedVersion: number, input: AssessmentInput) {
    const current = await getAssessment(patientId, id);
    if (current.version !== expectedVersion) throw new VersionConflictError(current.version);
    const others = (await listAssessments(patientId)).filter((assessment) => assessment.id !== id);
    const built = await buildAssessment(patientId, id, input, sortAssessments(others)[0] ?? null, {
      version: expectedVersion + 1,
      createdAt: current.createdAt,
    });
    const { rows } = await run<AssessmentRow>(sql`
      UPDATE app.body_assessments SET (clinical_date, assessment_type, weight_kg, body_fat_percent, fat_mass_kg,
        lean_mass_kg, waist_cm, scapula_cm, bust_cm, abdomen_cm, hip_cm, left_proximal_thigh_cm,
        right_proximal_thigh_cm, neck_cm, left_arm_cm, right_arm_cm, left_distal_thigh_cm, right_distal_thigh_cm,
        left_calf_cm, right_calf_cm, auto_filled_fields, calculation_method, calculation_version, calculation_input)
        = (${assessmentValues(built)}),
        version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND patient_id = ${patientId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${ASSESSMENT_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toAssessment(rows[0], accountId);
  }

  async function toFollowUp(row: FollowUpRow): Promise<NextFollowUp> {
    const comments = await sealer.open({ column: COMMENTS_COLUMN, rowId: row.patient_id }, Buffer.from(row.comments), commentsSchema);
    const dueDates: Partial<Record<FollowUpType, string>> = {};
    if (row.assessment_due_date) dueDates.ASSESSMENT_UPDATE = row.assessment_due_date;
    if (row.diet_due_date) dueDates.DIET_UPDATE = row.diet_due_date;
    return {
      accountId,
      patientId: row.patient_id,
      dueDate: Object.values(dueDates).sort()[0]!,
      dueDates,
      type: (['ASSESSMENT_UPDATE', 'DIET_UPDATE'] as const).filter((type) => dueDates[type] !== undefined),
      comments,
      version: row.version,
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
    };
  }

  async function selectFollowUp(patientId: string): Promise<FollowUpRow | undefined> {
    const { rows } = await run<FollowUpRow>(sql`
      SELECT ${FOLLOW_UP_COLUMNS} FROM app.next_follow_ups
      WHERE account_id = ${accountId} AND patient_id = ${patientId}`);
    return rows[0];
  }

  async function getFollowUp(patientId: string): Promise<NextFollowUp | null> {
    await patientContext(patientId);
    const row = await selectFollowUp(patientId);
    return row && row.cancelled_at === null ? toFollowUp(row) : null;
  }

  /** Without `expectedVersion` this creates; with it, it replaces the confirmed follow-up. */
  async function setFollowUp(patientId: string, expectedVersion: number | undefined, input: NextFollowUpInput): Promise<NextFollowUp> {
    const patient = await patientContext(patientId);
    if (patient.archivedAt !== null) throw new ApiError(422, 'UNPROCESSABLE');
    let normalized: ReturnType<typeof normalizeNextFollowUpInput>;
    try {
      normalized = normalizeNextFollowUpInput(input);
    } catch (error) {
      throw asApiError(error);
    }
    const row = await selectFollowUp(patientId);
    const active = row !== undefined && row.cancelled_at === null;
    if (expectedVersion === undefined && active) throw new VersionConflictError(row.version);
    if (expectedVersion !== undefined && !active) throw new NotFoundError();
    if (active && row.version !== expectedVersion) throw new VersionConflictError(row.version);
    const blob = await sealer.seal({ column: COMMENTS_COLUMN, rowId: patientId }, normalized.comments);
    const keyVersion = blob.readUInt32BE(1);
    const assessmentDue = normalized.dueDates.ASSESSMENT_UPDATE ?? null;
    const dietDue = normalized.dueDates.DIET_UPDATE ?? null;
    // A cancelled follow-up is reactivated in place (rows are never deleted), continuing its version.
    const { rows } = row
      ? await run<FollowUpRow>(sql`
          UPDATE app.next_follow_ups SET assessment_due_date = ${assessmentDue}, diet_due_date = ${dietDue},
            comments = ${blob}, comments_key_version = ${keyVersion}, cancelled_at = NULL,
            version = version + 1, updated_at = now()
          WHERE account_id = ${accountId} AND patient_id = ${patientId} AND version = ${row.version}
          RETURNING ${FOLLOW_UP_COLUMNS}`)
      : await run<FollowUpRow>(sql`
          INSERT INTO app.next_follow_ups (account_id, patient_id, assessment_due_date, diet_due_date, comments,
            comments_key_version, version)
          VALUES (${accountId}, ${patientId}, ${assessmentDue}, ${dietDue}, ${blob}, ${keyVersion}, 1)
          RETURNING ${FOLLOW_UP_COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError((row?.version ?? 0) + 1);
    return toFollowUp(rows[0]);
  }

  /** Cancels the confirmed follow-up: the row is kept with `cancelled_at` and its comments are wiped. */
  async function clearFollowUp(patientId: string, expectedVersion: number): Promise<void> {
    await patientContext(patientId);
    const current = await selectFollowUp(patientId);
    if (!current || current.cancelled_at !== null) throw new NotFoundError();
    if (current.version !== expectedVersion) throw new VersionConflictError(current.version);
    const blob = await sealer.seal({ column: COMMENTS_COLUMN, rowId: patientId }, '');
    await run(sql`
      UPDATE app.next_follow_ups SET cancelled_at = now(), comments = ${blob}, comments_key_version = ${blob.readUInt32BE(1)},
        version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND patient_id = ${patientId} AND version = ${expectedVersion}`);
  }

  return { listAssessments, getAssessment, createAssessment, updateAssessment, getFollowUp, setFollowUp, clearFollowUp };
}

export type ServerClinicalRepository = ReturnType<typeof createServerClinicalRepository>;
