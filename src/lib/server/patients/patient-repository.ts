import 'server-only';

import { sql, type SQL } from 'drizzle-orm';
import type { Patient, PatientInput } from '@/lib/domain/patient';
import { getAgeFromBirthDate } from '@/lib/date-only';
import type { FieldSealer } from '../crypto/account-keys';
import { ApiError, NotFoundError, VersionConflictError } from '../api/api-errors';

/** Minimal executor so the repository runs on the pg transaction and on PGlite in tests. */
export interface SqlExecutor {
  execute(query: SQL): PromiseLike<{ rows: unknown[] }>;
}

interface SensitivePatient {
  name: string;
  birthDate: string | null;
  isPregnant: boolean;
  pregnancyDueDate: string | null;
  maritalStatus: string | null;
  phone: string | null;
  whatsapp: string | null;
}

type PatientRow = {
  id: string;
  display_code: string;
  sensitive: Uint8Array;
  gender: string;
  height_cm: string | null;
  weight_kg: string | null;
  current_objective: string | null;
  target_protein: string | null;
  target_carbs: string | null;
  target_fats: string | null;
  target_kcal: string | null;
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
  archived_at: Date | string | null;
};

export const SENSITIVE_COLUMN = 'patients.sensitive';
const COLUMNS = sql`id, display_code, sensitive, gender, height_cm, weight_kg, current_objective,
  target_protein, target_carbs, target_fats, target_kcal, version, created_at, updated_at, archived_at`;

const sensitiveSchema = {
  parse(value: unknown): SensitivePatient {
    const v = value as Record<string, unknown>;
    if (!v || typeof v.name !== 'string') throw new TypeError('Invalid sensitive payload.');
    return v as unknown as SensitivePatient;
  },
};

const num = (value: string | null): number | null => (value === null ? null : Number(value));
const iso = (value: Date | string): string => new Date(value).toISOString();

function toSensitive(input: PatientInput): SensitivePatient {
  return {
    name: input.name,
    birthDate: input.birthDate ?? null,
    isPregnant: input.isPregnant ?? false,
    pregnancyDueDate: input.pregnancyDueDate ?? null,
    maritalStatus: input.maritalStatus ?? null,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
  };
}

export function createServerPatientRepository(tx: SqlExecutor, sealer: FieldSealer, accountId: string) {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });

  async function toPatient(row: PatientRow): Promise<Patient> {
    const s = await sealer.open({ column: SENSITIVE_COLUMN, rowId: row.id }, Buffer.from(row.sensitive), sensitiveSchema);
    return {
      id: row.id,
      accountId,
      displayCode: row.display_code,
      name: s.name,
      age: getAgeFromBirthDate(s.birthDate),
      gender: row.gender,
      birthDate: s.birthDate,
      isPregnant: s.isPregnant,
      pregnancyDueDate: s.pregnancyDueDate,
      heightCm: num(row.height_cm),
      weightKg: num(row.weight_kg),
      maritalStatus: s.maritalStatus,
      phone: s.phone,
      whatsapp: s.whatsapp,
      currentObjective: row.current_objective,
      defaultMacroTargets: {
        proteinG: num(row.target_protein), carbsG: num(row.target_carbs),
        fatsG: num(row.target_fats), kcal: num(row.target_kcal),
      },
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
      version: row.version,
      archivedAt: row.archived_at === null ? null : iso(row.archived_at),
    };
  }

  async function select(id: string): Promise<PatientRow | undefined> {
    const { rows } = await run<PatientRow>(
      sql`SELECT ${COLUMNS} FROM app.patients WHERE account_id = ${accountId} AND id = ${id}`,
    );
    return rows[0];
  }

  async function getById(id: string): Promise<Patient | null> {
    const row = await select(id);
    return row ? toPatient(row) : null;
  }

  /** Idempotent: repeating a create with the same ID returns the stored patient unchanged. */
  async function create(id: string, input: PatientInput): Promise<{ patient: Patient; created: boolean }> {
    const existing = await select(id);
    if (existing) return { patient: await toPatient(existing), created: false };
    // Serializes display-code allocation per account inside the transaction.
    await run(sql`SELECT pg_advisory_xact_lock(hashtextextended(${accountId}, 0))`);
    const { rows: next } = await run<{ next: number }>(sql`
      SELECT coalesce(max(substring(display_code from 3)::int), 0) + 1 AS next
      FROM app.patients WHERE account_id = ${accountId}`);
    const displayCode = `P-${String(next[0].next).padStart(4, '0')}`;
    const blob = await sealer.seal({ column: SENSITIVE_COLUMN, rowId: id }, toSensitive(input));
    const keyVersion = blob.readUInt32BE(1);
    const m = input.defaultMacroTargets;
    const { rows } = await run<PatientRow>(sql`
      INSERT INTO app.patients (account_id, id, display_code, sensitive, sensitive_key_version, gender,
        height_cm, weight_kg, current_objective, target_protein, target_carbs, target_fats, target_kcal, version)
      VALUES (${accountId}, ${id}, ${displayCode}, ${blob}, ${keyVersion}, ${input.gender ?? ''},
        ${input.heightCm ?? null}, ${input.weightKg ?? null}, ${input.currentObjective ?? null},
        ${m?.proteinG ?? null}, ${m?.carbsG ?? null}, ${m?.fatsG ?? null}, ${m?.kcal ?? null}, 1)
      RETURNING ${COLUMNS}`);
    return { patient: await toPatient(rows[0]), created: true };
  }

  async function requireForMutation(id: string, expectedVersion: number): Promise<PatientRow> {
    const row = await select(id);
    if (!row) throw new NotFoundError();
    if (row.version !== expectedVersion) throw new VersionConflictError(row.version);
    return row;
  }

  async function update(id: string, expectedVersion: number, input: PatientInput): Promise<Patient> {
    const current = await requireForMutation(id, expectedVersion);
    if (current.archived_at !== null) throw new ApiError(422, 'UNPROCESSABLE');
    const blob = await sealer.seal({ column: SENSITIVE_COLUMN, rowId: id }, toSensitive(input));
    const m = input.defaultMacroTargets;
    const { rows } = await run<PatientRow>(sql`
      UPDATE app.patients SET sensitive = ${blob}, sensitive_key_version = ${blob.readUInt32BE(1)},
        gender = ${input.gender ?? ''}, height_cm = ${input.heightCm ?? null}, weight_kg = ${input.weightKg ?? null},
        current_objective = ${input.currentObjective ?? null}, target_protein = ${m?.proteinG ?? null},
        target_carbs = ${m?.carbsG ?? null}, target_fats = ${m?.fatsG ?? null}, target_kcal = ${m?.kcal ?? null},
        version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion} AND archived_at IS NULL
      RETURNING ${COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toPatient(rows[0]);
  }

  async function setArchived(id: string, expectedVersion: number, archive: boolean): Promise<Patient> {
    const current = await requireForMutation(id, expectedVersion);
    if ((current.archived_at !== null) === archive) throw new ApiError(422, 'UNPROCESSABLE');
    const { rows } = await run<PatientRow>(sql`
      UPDATE app.patients
      SET archived_at = ${archive ? sql`now()` : sql`NULL`}, version = version + 1, updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND version = ${expectedVersion}
      RETURNING ${COLUMNS}`);
    if (!rows[0]) throw new VersionConflictError(expectedVersion + 1);
    return toPatient(rows[0]);
  }

  /**
   * Names are encrypted, so search decrypts the account's active patients and filters in memory
   * (Decisão 15 §5.4). Ordering is by name; follow-up/activity ordering returns with those modules.
   */
  async function searchActive(query: string, pageIndex: number, pageSize: number) {
    const { rows } = await run<PatientRow>(sql`
      SELECT ${COLUMNS} FROM app.patients WHERE account_id = ${accountId} AND archived_at IS NULL`);
    const needle = query.trim().toLocaleLowerCase('pt-BR');
    const patients = await Promise.all(rows.map(toPatient));
    const matching = patients
      .filter((p) => !needle
        || p.name.toLocaleLowerCase('pt-BR').includes(needle)
        || (p.currentObjective ?? '').toLocaleLowerCase('pt-BR').includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id));
    return {
      items: matching.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
      total: matching.length,
      pageIndex,
      pageSize,
    };
  }

  return {
    getById,
    create,
    update,
    archive: (id: string, version: number) => setArchived(id, version, true),
    restore: (id: string, version: number) => setArchived(id, version, false),
    searchActive,
  };
}

export type ServerPatientRepository = ReturnType<typeof createServerPatientRepository>;
