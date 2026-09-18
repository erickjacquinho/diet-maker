import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Patient, PatientInput } from '@/lib/domain/patient';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { getAgeFromBirthDate } from '@/lib/date-only';
import { normalizePageRequest, type PageResult } from '@/lib/persistence/page';
import type { PatientPageQuery } from '@/lib/persistence/patient-repository';
import type { LocalDatabaseHandle } from './client';
import { patients } from './schema';

type PatientRow = typeof patients.$inferSelect;

function now(): string {
  return new Date().toISOString();
}

function toPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    accountId: row.accountId,
    displayCode: row.displayCode,
    name: row.name,
    age: getAgeFromBirthDate(row.birthDate),
    gender: row.gender,
    birthDate: row.birthDate,
    isPregnant: row.isPregnant,
    pregnancyDueDate: row.pregnancyDueDate,
    heightCm: row.heightCm,
    weightKg: row.weightKg,
    maritalStatus: row.maritalStatus,
    phone: row.phone,
    whatsapp: row.whatsapp,
    currentObjective: row.currentObjective,
    defaultMacroTargets: {
      proteinG: row.targetProtein,
      carbsG: row.targetCarbs,
      fatsG: row.targetFats,
      kcal: row.targetKcal,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    version: row.version,
    archivedAt: row.archivedAt,
  };
}

function valuesForInput(input: PatientInput) {
  return {
    name: input.name,
    age: input.age ?? null,
    gender: input.gender ?? '',
    birthDate: input.birthDate ?? null,
    isPregnant: input.isPregnant ?? false,
    pregnancyDueDate: input.pregnancyDueDate ?? null,
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    maritalStatus: input.maritalStatus ?? null,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    currentObjective: input.currentObjective ?? null,
    targetProtein: input.defaultMacroTargets?.proteinG ?? null,
    targetCarbs: input.defaultMacroTargets?.carbsG ?? null,
    targetFats: input.defaultMacroTargets?.fatsG ?? null,
    targetKcal: input.defaultMacroTargets?.kcal ?? null,
  };
}

async function findPatient(handle: LocalDatabaseHandle, accountId: string, patientId: string): Promise<PatientRow | null> {
  const rows = await handle.db.select().from(patients).where(and(eq(patients.accountId, accountId), eq(patients.id, patientId)));
  return rows[0] ?? null;
}

function assertExpectedVersion(row: PatientRow, expectedVersion: number): void {
  if (row.version !== expectedVersion) {
    throw new PatientApplicationError('STALE_VERSION', 'O cadastro foi alterado por outra operação. Recarregue antes de salvar.');
  }
}

export class LocalPatientRepository {
  constructor(private readonly handle: LocalDatabaseHandle) {}

  async create(accountId: string, input: PatientInput): Promise<Patient> {
    const rows = await this.handle.db.select({ displayCode: patients.displayCode }).from(patients).where(eq(patients.accountId, accountId)).orderBy(desc(patients.createdAt));
    const displayCode = `P-${String(rows.length + 1).padStart(4, '0')}`;
    const timestamp = now();
    const row = {
      id: nanoid(16),
      accountId,
      displayCode,
      ...valuesForInput(input),
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1,
      archivedAt: null,
    } satisfies typeof patients.$inferInsert;

    try {
      const inserted = await this.handle.db.transaction(async (tx) => tx.insert(patients).values(row).returning());
      if (!inserted[0]) throw new Error('O paciente não foi retornado após a criação.');
      return toPatient(inserted[0]);
    } catch (cause) {
      if (cause instanceof PatientApplicationError) throw cause;
      throw new PatientApplicationError('PERSISTENCE_FAILURE', 'O paciente não pôde ser criado.', { cause });
    }
  }

  async getById(accountId: string, patientId: string): Promise<Patient | null> {
    const row = await findPatient(this.handle, accountId, patientId);
    return row ? toPatient(row) : null;
  }

  async listActive(accountId: string): Promise<Patient[]> {
    const rows = await this.handle.db.select().from(patients)
      .where(and(eq(patients.accountId, accountId), isNull(patients.archivedAt)))
      .orderBy(asc(patients.name));
    return rows.map(toPatient);
  }

  async listActivePage(accountId: string, query: PatientPageQuery): Promise<PageResult<Patient>> {
    const { pageIndex, pageSize } = normalizePageRequest(query);
    const search = query.query.trim().toLocaleLowerCase('pt-BR');
    const selected = await this.handle.client.query<{
      id: string | null;
      total: number;
    }>(`
      WITH matching_patients AS (
        SELECT p.id, p.name
        FROM patients p
        WHERE p.account_id = $1
          AND p.archived_at IS NULL
          AND (
            $2 = ''
            OR strpos(lower(p.name), $2) > 0
            OR strpos(lower(coalesce(p.current_objective, '')), $2) > 0
          )
      ),
      activity_candidates AS (
        SELECT a.patient_id, a.clinical_date AS event_date, a.updated_at AS confirmed_at,
          'assessment'::text AS activity_type, a.id AS source_id
        FROM body_assessments a
        INNER JOIN matching_patients p ON p.id = a.patient_id
        WHERE a.account_id = $1
        UNION ALL
        SELECT d.patient_id, left(d.activated_at, 10) AS event_date, d.updated_at AS confirmed_at,
          'diet'::text AS activity_type, d.id AS source_id
        FROM diet_plans d
        INNER JOIN matching_patients p ON p.id = d.patient_id
        WHERE d.account_id = $1
      ),
      ranked_activities AS (
        SELECT patient_id, event_date,
          row_number() OVER (
            PARTITION BY patient_id
            ORDER BY event_date DESC, confirmed_at DESC, activity_type ASC, source_id ASC
          ) AS activity_rank
        FROM activity_candidates
      ),
      ordered_patients AS (
        SELECT p.id, p.name, f.due_date, a.event_date AS last_activity_date,
          CASE
            WHEN f.due_date IS NULL THEN 3
            WHEN f.due_date < $3 THEN 0
            WHEN f.due_date = $3 THEN 1
            ELSE 2
          END AS group_order,
          CASE
            WHEN f.due_date IS NULL THEN coalesce(a.event_date, '')
            WHEN f.due_date = $3 THEN ''
            ELSE f.due_date
          END AS sort_date
        FROM matching_patients p
        LEFT JOIN next_follow_ups f ON f.account_id = $1 AND f.patient_id = p.id
        LEFT JOIN ranked_activities a ON a.patient_id = p.id AND a.activity_rank = 1
      ),
      page AS (
        SELECT * FROM ordered_patients
        ORDER BY group_order, sort_date, name COLLATE nutridiet_pt_br_base, id
        LIMIT $4 OFFSET $5
      )
      SELECT page.id, (SELECT count(*)::int FROM matching_patients) AS total,
        page.group_order, page.sort_date, page.name
      FROM (SELECT 1) AS anchor
      LEFT JOIN page ON TRUE
      ORDER BY page.group_order NULLS LAST, page.sort_date NULLS LAST,
        page.name COLLATE nutridiet_pt_br_base NULLS LAST, page.id NULLS LAST
    `, [accountId, search, query.today, pageSize, pageIndex * pageSize]);
    const total = Number(selected.rows[0]?.total ?? 0);
    const patientIds = selected.rows.flatMap(({ id }) => id === null ? [] : [id]);
    if (patientIds.length === 0) return { items: [], total, pageIndex, pageSize };

    const rows = await this.handle.db.select().from(patients)
      .where(and(eq(patients.accountId, accountId), inArray(patients.id, patientIds)));
    const byId = new Map(rows.map((row) => [row.id, toPatient(row)]));
    return {
      items: patientIds.flatMap((id) => {
        const patient = byId.get(id);
        return patient ? [patient] : [];
      }),
      total,
      pageIndex,
      pageSize,
    };
  }

  async update(accountId: string, patientId: string, expectedVersion: number, input: PatientInput): Promise<Patient> {
    const current = await findPatient(this.handle, accountId, patientId);
    if (!current) throw new PatientApplicationError('NOT_FOUND', 'Paciente não encontrado nesta Conta.');
    assertExpectedVersion(current, expectedVersion);
    if (current.archivedAt !== null) throw new PatientApplicationError('ARCHIVED_PATIENT', 'Paciente arquivado não pode ser editado.');

    const updatedAt = now();
    const updated = await this.handle.db.transaction(async (tx) => tx.update(patients)
      .set({ ...valuesForInput(input), updatedAt, version: expectedVersion + 1 })
      .where(and(eq(patients.accountId, accountId), eq(patients.id, patientId), eq(patients.version, expectedVersion), isNull(patients.archivedAt)))
      .returning());
    if (!updated[0]) throw new PatientApplicationError('STALE_VERSION', 'O cadastro foi alterado por outra operação. Recarregue antes de salvar.');
    return toPatient(updated[0]);
  }

  async archive(accountId: string, patientId: string, expectedVersion: number): Promise<Patient> {
    const current = await findPatient(this.handle, accountId, patientId);
    if (!current) throw new PatientApplicationError('NOT_FOUND', 'Paciente não encontrado nesta Conta.');
    assertExpectedVersion(current, expectedVersion);
    if (current.archivedAt !== null) throw new PatientApplicationError('ALREADY_ARCHIVED', 'O paciente já está arquivado.');
    const updated = await this.handle.db.transaction(async (tx) => tx.update(patients)
      .set({ archivedAt: now(), updatedAt: now(), version: expectedVersion + 1 })
      .where(and(eq(patients.accountId, accountId), eq(patients.id, patientId), eq(patients.version, expectedVersion), isNull(patients.archivedAt)))
      .returning());
    if (!updated[0]) throw new PatientApplicationError('STALE_VERSION', 'O paciente foi alterado antes do arquivamento.');
    return toPatient(updated[0]);
  }

  async restore(accountId: string, patientId: string, expectedVersion: number): Promise<Patient> {
    const current = await findPatient(this.handle, accountId, patientId);
    if (!current) throw new PatientApplicationError('NOT_FOUND', 'Paciente não encontrado nesta Conta.');
    assertExpectedVersion(current, expectedVersion);
    if (current.archivedAt === null) throw new PatientApplicationError('ALREADY_ACTIVE', 'O paciente já está ativo.');
    const updated = await this.handle.db.transaction(async (tx) => tx.update(patients)
      .set({ archivedAt: null, updatedAt: now(), version: expectedVersion + 1 })
      .where(and(eq(patients.accountId, accountId), eq(patients.id, patientId), eq(patients.version, expectedVersion)))
      .returning());
    if (!updated[0]) throw new PatientApplicationError('STALE_VERSION', 'O paciente foi alterado antes da restauração.');
    return toPatient(updated[0]);
  }
}
