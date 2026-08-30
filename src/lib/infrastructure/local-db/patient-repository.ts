import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Patient, PatientInput } from '@/lib/domain/patient';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
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
    age: row.age,
    gender: row.gender,
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
    age: input.age,
    gender: input.gender,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    maritalStatus: input.maritalStatus ?? null,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    currentObjective: input.currentObjective,
    targetProtein: input.defaultMacroTargets.proteinG,
    targetCarbs: input.defaultMacroTargets.carbsG,
    targetFats: input.defaultMacroTargets.fatsG,
    targetKcal: input.defaultMacroTargets.kcal,
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
