import { and, asc, count, desc, eq, getTableColumns, inArray, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type {
  AssessmentPersistenceInput,
  AssessmentInputSnapshot,
  BodyAssessment,
  CalculationInputSnapshot,
  CalculationMethod,
  FollowUpType,
  NextFollowUp,
  NextFollowUpDateChange,
  NextFollowUpDateMove,
  NextFollowUpInput,
} from '@/lib/domain/clinical';
import {
  ClinicalApplicationError,
  normalizeClinicalDate,
  normalizeNextFollowUpInput,
} from '@/lib/domain/clinical';
import type { ClinicalRepository } from '@/lib/persistence/clinical-repository';
import { normalizePageRequest, type PageRequest, type PageResult } from '@/lib/persistence/page';
import type { LocalDatabaseHandle } from './client';
import { bodyAssessments, nextFollowUps, patients } from './schema';

export type ClinicalFailurePoint = 'assessment-after-write' | 'follow-up-after-write';

export interface ClinicalRepositoryOptions {
  now?: () => string;
  idFactory?: () => string;
  failAt?: ClinicalFailurePoint;
}

type AssessmentRow = typeof bodyAssessments.$inferSelect;
type FollowUpRow = typeof nextFollowUps.$inferSelect;

function followUpTypesFromStorage(value: string): FollowUpType[] {
  if (value === 'BOTH') return ['ASSESSMENT_UPDATE', 'DIET_UPDATE'];
  if (value === 'ASSESSMENT_UPDATE' || value === 'DIET_UPDATE') return [value];
  throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'O tipo do acompanhamento salvo é inválido.');
}

function followUpTypesToStorage(types: FollowUpType[]): string {
  return types.length === 1 ? types[0] : 'BOTH';
}

function numberValue(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function jsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function snapshot(value: unknown, calculationMethod: CalculationMethod): AssessmentInputSnapshot {
  const source = (value && typeof value === 'object' ? value : {}) as Partial<CalculationInputSnapshot>;
  if (calculationMethod === 'NONE') {
    return {
      assessmentType: 'simplified',
      heightCm: requiredNumber(source.heightCm, 'heightCm'),
      weightKg: requiredNumber(source.weightKg, 'weightKg'),
      waistCm: numberValue(source.waistCm),
      abdomenCm: numberValue(source.abdomenCm),
      hipCm: numberValue(source.hipCm),
    };
  }
  return {
    sex: source.sex === 'male' ? 'male' : 'female',
    heightCm: Number(source.heightCm),
    neckCm: Number(source.neckCm),
    waistCm: Number(source.waistCm),
    abdomenCm: Number(source.abdomenCm),
    hipCm: Number(source.hipCm),
    weightKg: Number(source.weightKg),
  };
}

function requiredNumber(value: string | number | null | undefined, field: string): number {
  const parsed = numberValue(value);
  if (parsed === undefined) throw new Error(`Valor clínico ausente: ${field}`);
  return parsed;
}

function toAssessment(row: AssessmentRow): BodyAssessment {
  const calculationMethod = row.calculationMethod as CalculationMethod;
  return {
    id: row.id,
    accountId: row.accountId,
    patientId: row.patientId,
    clinicalDate: row.clinicalDate,
    assessmentType: calculationMethod === 'NONE' ? 'simplified' : 'complete',
    weightKg: requiredNumber(row.weightKg, 'weightKg'),
    bodyFatPercent: numberValue(row.bodyFatPercent),
    fatMassKg: numberValue(row.fatMassKg),
    leanMassKg: numberValue(row.leanMassKg),
    waistCm: numberValue(row.waistCm),
    scapulaCm: numberValue(row.scapulaCm),
    bustCm: numberValue(row.bustCm),
    abdomenCm: numberValue(row.abdomenCm),
    hipCm: numberValue(row.hipCm),
    leftProximalThighCm: numberValue(row.leftProximalThighCm),
    rightProximalThighCm: numberValue(row.rightProximalThighCm),
    neckCm: numberValue(row.neckCm),
    leftArmCm: numberValue(row.leftArmCm),
    rightArmCm: numberValue(row.rightArmCm),
    leftDistalThighCm: numberValue(row.leftDistalThighCm),
    rightDistalThighCm: numberValue(row.rightDistalThighCm),
    leftCalfCm: numberValue(row.leftCalfCm),
    rightCalfCm: numberValue(row.rightCalfCm),
    autoFilledFields: jsonArray(row.autoFilledFields),
    calculationMethod,
    calculationVersion: row.calculationVersion,
    calculationInputSnapshot: snapshot(row.calculationInputSnapshot, calculationMethod),
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toFollowUp(row: FollowUpRow): NextFollowUp {
  const storedTypes = followUpTypesFromStorage(row.type);
  const dueDates = {
    ...(row.assessmentDueDate ?? (storedTypes.includes('ASSESSMENT_UPDATE') ? row.dueDate : null)
      ? { ASSESSMENT_UPDATE: row.assessmentDueDate ?? row.dueDate }
      : {}),
    ...(row.dietDueDate ?? (storedTypes.includes('DIET_UPDATE') ? row.dueDate : null)
      ? { DIET_UPDATE: row.dietDueDate ?? row.dueDate }
      : {}),
  };
  const type = (['ASSESSMENT_UPDATE', 'DIET_UPDATE'] as const).filter((item) => item in dueDates);
  const dueDate = Object.values(dueDates).sort()[0] ?? row.dueDate;
  return {
    accountId: row.accountId,
    patientId: row.patientId,
    dueDate,
    dueDates,
    type,
    comments: row.comments,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function assessmentValues(assessment: BodyAssessment | AssessmentPersistenceInput, now: string): typeof bodyAssessments.$inferInsert {
  const source = assessment as BodyAssessment;
  const nullableNumber = (value: number | undefined) => value == null || !Number.isFinite(value) ? null : String(value);
  const calculationMethod = source.calculationMethod ?? (source.assessmentType === 'simplified' ? 'NONE' : 'US_NAVY');
  return {
    id: source.id ?? nanoid(16),
    accountId: source.accountId!,
    patientId: source.patientId!,
    clinicalDate: source.clinicalDate,
    weightKg: String(source.weightKg),
    bodyFatPercent: nullableNumber(source.bodyFatPercent),
    fatMassKg: nullableNumber(source.fatMassKg),
    leanMassKg: nullableNumber(source.leanMassKg),
    waistCm: nullableNumber(source.waistCm),
    scapulaCm: nullableNumber(source.scapulaCm),
    bustCm: nullableNumber(source.bustCm),
    abdomenCm: nullableNumber(source.abdomenCm),
    hipCm: nullableNumber(source.hipCm),
    leftProximalThighCm: nullableNumber(source.leftProximalThighCm),
    rightProximalThighCm: nullableNumber(source.rightProximalThighCm),
    neckCm: source.neckCm == null ? null : String(source.neckCm),
    leftArmCm: source.leftArmCm == null ? null : String(source.leftArmCm),
    rightArmCm: source.rightArmCm == null ? null : String(source.rightArmCm),
    leftDistalThighCm: source.leftDistalThighCm == null ? null : String(source.leftDistalThighCm),
    rightDistalThighCm: source.rightDistalThighCm == null ? null : String(source.rightDistalThighCm),
    leftCalfCm: source.leftCalfCm == null ? null : String(source.leftCalfCm),
    rightCalfCm: source.rightCalfCm == null ? null : String(source.rightCalfCm),
    autoFilledFields: source.autoFilledFields ?? [],
    calculationMethod,
    calculationVersion: source.calculationVersion ?? 'us-navy-v1',
    calculationInputSnapshot: source.calculationInputSnapshot,
    version: source.version ?? 1,
    createdAt: source.createdAt ?? now,
    updatedAt: source.updatedAt ?? now,
  };
}

function asClinicalFailure(cause: unknown, message: string): ClinicalApplicationError {
  if (cause instanceof ClinicalApplicationError) return cause;
  return new ClinicalApplicationError('CLINICAL_TRANSACTION_FAILED', message, { cause });
}

export class PGliteClinicalRepository implements ClinicalRepository {
  private readonly now: () => string;
  private readonly idFactory: () => string;

  constructor(private readonly handle: LocalDatabaseHandle, private readonly options: ClinicalRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.idFactory = options.idFactory ?? (() => nanoid(16));
  }

  private async assertPatientScope(accountId: string, patientId: string, requireActive: boolean): Promise<void> {
    const rows = await this.handle.db.select({ id: patients.id, archivedAt: patients.archivedAt })
      .from(patients)
      .where(and(eq(patients.accountId, accountId), eq(patients.id, patientId)));
    const patient = rows[0];
    if (!patient) throw new ClinicalApplicationError('CLINICAL_PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
    if (requireActive && patient.archivedAt !== null) throw new ClinicalApplicationError('CLINICAL_PATIENT_ARCHIVED', 'Paciente arquivado não pode receber mutações clínicas.');
  }

  private maybeFail(point: ClinicalFailurePoint): void {
    if (this.options.failAt === point) throw new Error(`Falha clínica injetada em ${point}.`);
  }

  async getAssessment(accountId: string, patientId: string, assessmentId: string): Promise<BodyAssessment | null> {
    try {
      const rows = await this.handle.db.select().from(bodyAssessments).where(and(
        eq(bodyAssessments.accountId, accountId),
        eq(bodyAssessments.patientId, patientId),
        eq(bodyAssessments.id, assessmentId),
      ));
      return rows[0] ? toAssessment(rows[0]) : null;
    } catch (cause) {
      throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'A avaliação não pôde ser carregada.', { cause });
    }
  }

  async listAssessments(accountId: string, patientId: string): Promise<BodyAssessment[]> {
    try {
      const rows = await this.handle.db.select().from(bodyAssessments).where(and(
        eq(bodyAssessments.accountId, accountId),
        eq(bodyAssessments.patientId, patientId),
      )).orderBy(desc(bodyAssessments.clinicalDate), desc(bodyAssessments.createdAt), asc(bodyAssessments.id));
      return rows.map(toAssessment);
    } catch (cause) {
      throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'O histórico de avaliações não pôde ser carregado.', { cause });
    }
  }

  async listAssessmentsByPatients(accountId: string, patientIds: readonly string[]): Promise<Record<string, BodyAssessment[]>> {
    const result: Record<string, BodyAssessment[]> = Object.fromEntries(patientIds.map((patientId) => [patientId, []]));
    if (patientIds.length === 0) return result;
    try {
      const rows = await this.handle.db.select().from(bodyAssessments).where(and(
        eq(bodyAssessments.accountId, accountId),
        inArray(bodyAssessments.patientId, [...patientIds]),
      )).orderBy(desc(bodyAssessments.clinicalDate), desc(bodyAssessments.createdAt), asc(bodyAssessments.id));
      for (const row of rows) {
        (result[row.patientId] ??= []).push(toAssessment(row));
      }
      return result;
    } catch (cause) {
      throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'O histórico clínico dos pacientes não pôde ser carregado.', { cause });
    }
  }

  async listAssessmentsPage(accountId: string, patientId: string, request: PageRequest = {}): Promise<PageResult<BodyAssessment>> {
    const page = normalizePageRequest(request);
    try {
      const scope = and(eq(bodyAssessments.accountId, accountId), eq(bodyAssessments.patientId, patientId));
      const [rows, totals] = await Promise.all([
        this.handle.db.select().from(bodyAssessments).where(scope)
          .orderBy(desc(bodyAssessments.clinicalDate), desc(bodyAssessments.createdAt), asc(bodyAssessments.id))
          .limit(page.pageSize).offset(page.pageIndex * page.pageSize),
        this.handle.db.select({ total: count() }).from(bodyAssessments).where(scope),
      ]);
      return { ...page, total: Number(totals[0]?.total ?? 0), items: rows.map(toAssessment) };
    } catch (cause) {
      throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'A página do histórico de avaliações não pôde ser carregada.', { cause });
    }
  }

  async listAssessmentSummaries(accountId: string, patientIds: readonly string[]): Promise<Record<string, { assessments: BodyAssessment[]; count: number }>> {
    const result: Record<string, { assessments: BodyAssessment[]; count: number }> = Object.fromEntries(patientIds.map((id) => [id, { assessments: [], count: 0 }]));
    if (!patientIds.length) return result;
    try {
      const ranked = this.handle.db.select({
        ...getTableColumns(bodyAssessments),
        count: sql<number>`count(*) OVER (PARTITION BY ${bodyAssessments.patientId})::int`.as('assessment_count'),
        rank: sql<number>`row_number() OVER (PARTITION BY ${bodyAssessments.patientId} ORDER BY ${bodyAssessments.clinicalDate} DESC, ${bodyAssessments.createdAt} DESC, ${bodyAssessments.id} ASC)`.as('assessment_rank'),
      }).from(bodyAssessments).where(and(eq(bodyAssessments.accountId, accountId), inArray(bodyAssessments.patientId, [...patientIds]))).as('ranked_assessments');
      const rows = await this.handle.db.select().from(ranked).where(lte(ranked.rank, 2)).orderBy(asc(ranked.patientId), asc(ranked.rank));
      for (const row of rows) {
        result[row.patientId].assessments.push(toAssessment(row));
        result[row.patientId].count = Number(row.count);
      }
      return result;
    } catch (cause) {
      throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'Os resumos clínicos não puderam ser carregados.', { cause });
    }
  }

  async createAssessment(accountId: string, patientId: string, assessment: BodyAssessment | AssessmentPersistenceInput): Promise<BodyAssessment> {
    if (assessment.accountId && assessment.accountId !== accountId || assessment.patientId && assessment.patientId !== patientId) {
      throw new ClinicalApplicationError('CLINICAL_SCOPE_VIOLATION', 'A avaliação não pertence à Conta e ao paciente informados.');
    }
    const now = this.now();
    const row = assessmentValues({ ...assessment, id: (assessment as BodyAssessment).id ?? this.idFactory(), accountId, patientId, version: 1 }, now);
    try {
      await this.handle.db.transaction(async (tx) => {
        const patientRows = await tx.select({ id: patients.id, archivedAt: patients.archivedAt }).from(patients).where(and(eq(patients.accountId, accountId), eq(patients.id, patientId)));
        const patient = patientRows[0];
        if (!patient) throw new ClinicalApplicationError('CLINICAL_PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
        if (patient.archivedAt !== null) throw new ClinicalApplicationError('CLINICAL_PATIENT_ARCHIVED', 'Paciente arquivado não pode receber mutações clínicas.');
        await tx.insert(bodyAssessments).values(row);
        this.maybeFail('assessment-after-write');
      });
      const created = await this.getAssessment(accountId, patientId, row.id!);
      if (!created) throw new Error('A avaliação não foi retornada após a criação.');
      return created;
    } catch (cause) {
      throw asClinicalFailure(cause, 'A avaliação não pôde ser confirmada; nenhuma alteração foi persistida.');
    }
  }

  async updateAssessment(accountId: string, patientId: string, assessmentId: string, expectedVersion: number, assessment: BodyAssessment | AssessmentPersistenceInput): Promise<BodyAssessment> {
    if (assessment.id && assessment.id !== assessmentId || assessment.accountId && assessment.accountId !== accountId || assessment.patientId && assessment.patientId !== patientId) {
      throw new ClinicalApplicationError('CLINICAL_SCOPE_VIOLATION', 'A avaliação não pertence à Conta e ao paciente informados.');
    }
    const current = await this.getAssessment(accountId, patientId, assessmentId);
    if (!current) throw new ClinicalApplicationError('CLINICAL_ASSESSMENT_NOT_FOUND', 'Avaliação não encontrada neste paciente.');
    if (current.version !== expectedVersion) throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'A avaliação foi atualizada antes desta confirmação.');
    await this.assertPatientScope(accountId, patientId, true);
    const updatedAt = this.now();
    const row = assessmentValues({ ...current, ...assessment, id: assessmentId, accountId, patientId, version: expectedVersion + 1, createdAt: current.createdAt, updatedAt }, updatedAt);
    try {
      await this.handle.db.transaction(async (tx) => {
        const updated = await tx.update(bodyAssessments).set(row).where(and(
          eq(bodyAssessments.id, assessmentId),
          eq(bodyAssessments.accountId, accountId),
          eq(bodyAssessments.patientId, patientId),
          eq(bodyAssessments.version, expectedVersion),
        )).returning();
        if (!updated[0]) throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'A avaliação foi atualizada antes desta confirmação.');
      });
      const saved = await this.getAssessment(accountId, patientId, assessmentId);
      if (!saved) throw new Error('A avaliação não foi retornada após a atualização.');
      return saved;
    } catch (cause) {
      throw asClinicalFailure(cause, 'A avaliação não pôde ser atualizada; o valor confirmado foi preservado.');
    }
  }

  async getNextFollowUp(accountId: string, patientId: string): Promise<NextFollowUp | null> {
    try {
      const rows = await this.handle.db.select().from(nextFollowUps).where(and(eq(nextFollowUps.accountId, accountId), eq(nextFollowUps.patientId, patientId)));
      return rows[0] ? toFollowUp(rows[0]) : null;
    } catch (cause) {
      throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'O acompanhamento não pôde ser carregado.', { cause });
    }
  }

  async listNextFollowUps(accountId: string, patientIds: readonly string[]): Promise<Record<string, NextFollowUp>> {
    if (patientIds.length === 0) return {};
    try {
      const rows = await this.handle.db.select().from(nextFollowUps).where(and(eq(nextFollowUps.accountId, accountId), inArray(nextFollowUps.patientId, [...patientIds])));
      return Object.fromEntries(rows.map((row) => [row.patientId, toFollowUp(row)]));
    } catch (cause) {
      throw new ClinicalApplicationError('CLINICAL_READ_FAILED', 'Os acompanhamentos não puderam ser carregados.', { cause });
    }
  }

  async moveNextFollowUps(accountId: string, changes: readonly NextFollowUpDateChange[]): Promise<NextFollowUpDateMove[]> {
    if (changes.length === 0) return [];
    if (new Set(changes.map((change) => change.patientId)).size !== changes.length) {
      throw new ClinicalApplicationError('CLINICAL_VALIDATION_FAILED', 'O mesmo paciente apareceu mais de uma vez na movimentação.');
    }
    const normalizedChanges = changes.map((change) => {
      const dueDate = normalizeClinicalDate(change.dueDate);
      const hasTypes = Array.isArray(change.types);
      const types = hasTypes
        ? (['ASSESSMENT_UPDATE', 'DIET_UPDATE'] as const).filter((type) => change.types.includes(type))
        : [];
      if (!dueDate || !Number.isInteger(change.expectedVersion) || change.expectedVersion < 1 || types.length === 0 || !hasTypes || types.length !== change.types.length) {
        throw new ClinicalApplicationError('CLINICAL_VALIDATION_FAILED', 'A movimentação contém data ou versão inválida.');
      }
      return { ...change, dueDate, types };
    });

    try {
      return await this.handle.db.transaction(async (tx) => {
        const patientIds = normalizedChanges.map((change) => change.patientId);
        const patientRows = await tx.select({ id: patients.id, archivedAt: patients.archivedAt })
          .from(patients)
          .where(and(eq(patients.accountId, accountId), inArray(patients.id, patientIds)));
        const patientsById = new Map(patientRows.map((patient) => [patient.id, patient]));
        const followUpRows = await tx.select().from(nextFollowUps)
          .where(and(eq(nextFollowUps.accountId, accountId), inArray(nextFollowUps.patientId, patientIds)));
        const followUpsByPatient = new Map(followUpRows.map((followUp) => [followUp.patientId, followUp]));

        for (const change of normalizedChanges) {
          const patient = patientsById.get(change.patientId);
          if (!patient) throw new ClinicalApplicationError('CLINICAL_PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
          if (patient.archivedAt !== null) throw new ClinicalApplicationError('CLINICAL_PATIENT_ARCHIVED', 'Paciente arquivado não pode receber mutações clínicas.');
          const current = followUpsByPatient.get(change.patientId);
          if (!current || current.version !== change.expectedVersion) {
            throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'Um acompanhamento foi atualizado antes desta movimentação. Recarregue a agenda.');
          }
          const currentFollowUp = toFollowUp(current);
          if (change.types.some((type) => currentFollowUp.dueDates?.[type] === undefined)) {
            throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'Um acompanhamento foi atualizado antes desta movimentação. Recarregue a agenda.');
          }
        }

        const timestamp = this.now();
        const moved: NextFollowUpDateMove[] = [];
        for (const change of normalizedChanges) {
          const currentRow = followUpsByPatient.get(change.patientId)!;
          const current = toFollowUp(currentRow);
          if (change.types.every((type) => current.dueDates?.[type] === change.dueDate)) {
            const unchanged = current;
            moved.push({ before: unchanged, after: unchanged });
            continue;
          }
          const dueDates = { ...(current.dueDates ?? {}) };
          for (const type of change.types) dueDates[type] = change.dueDate;
          const nextTypes = (['ASSESSMENT_UPDATE', 'DIET_UPDATE'] as const).filter((type) => dueDates[type] !== undefined);
          const nextDueDate = Object.values(dueDates).sort()[0]!;
          const updatedRows = await tx.update(nextFollowUps)
            .set({
              dueDate: nextDueDate,
              assessmentDueDate: dueDates.ASSESSMENT_UPDATE ?? null,
              dietDueDate: dueDates.DIET_UPDATE ?? null,
              type: followUpTypesToStorage(nextTypes),
              version: current.version + 1,
              updatedAt: timestamp,
            })
            .where(and(
              eq(nextFollowUps.accountId, accountId),
              eq(nextFollowUps.patientId, change.patientId),
              eq(nextFollowUps.version, change.expectedVersion),
            ))
            .returning();
          const updated = updatedRows[0];
          if (!updated) throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'Um acompanhamento foi atualizado antes desta movimentação. Recarregue a agenda.');
          this.maybeFail('follow-up-after-write');
          moved.push({ before: current, after: toFollowUp(updated) });
        }
        return moved;
      });
    } catch (cause) {
      throw asClinicalFailure(cause, 'Os acompanhamentos não puderam ser movidos; as datas anteriores foram preservadas.');
    }
  }

  async setNextFollowUp(accountId: string, patientId: string, expectedVersion: number | null, input: NextFollowUpInput): Promise<NextFollowUp> {
    const normalized = normalizeNextFollowUpInput(input);
    try {
      const saved = await this.handle.db.transaction(async (tx) => {
        const patientRows = await tx.select({ id: patients.id, archivedAt: patients.archivedAt }).from(patients).where(and(eq(patients.accountId, accountId), eq(patients.id, patientId)));
        const patient = patientRows[0];
        if (!patient) throw new ClinicalApplicationError('CLINICAL_PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
        if (patient.archivedAt !== null) throw new ClinicalApplicationError('CLINICAL_PATIENT_ARCHIVED', 'Paciente arquivado não pode receber mutações clínicas.');
        const currentRows = await tx.select().from(nextFollowUps).where(and(eq(nextFollowUps.accountId, accountId), eq(nextFollowUps.patientId, patientId)));
        const current = currentRows[0];
        const timestamp = this.now();
        if (expectedVersion === null) {
          if (current) throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'Já existe um acompanhamento confirmado para este paciente.');
          const inserted = await tx.insert(nextFollowUps).values({
            accountId,
            patientId,
            dueDate: normalized.dueDate,
            assessmentDueDate: normalized.dueDates.ASSESSMENT_UPDATE ?? null,
            dietDueDate: normalized.dueDates.DIET_UPDATE ?? null,
            type: followUpTypesToStorage(normalized.type),
            comments: normalized.comments,
            version: 1,
            createdAt: timestamp,
            updatedAt: timestamp,
          }).returning();
          this.maybeFail('follow-up-after-write');
          return inserted[0];
        }
        if (!current || current.version !== expectedVersion) throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'O acompanhamento foi atualizado antes desta confirmação.');
        const updated = await tx.update(nextFollowUps).set({
          dueDate: normalized.dueDate,
          assessmentDueDate: normalized.dueDates.ASSESSMENT_UPDATE ?? null,
          dietDueDate: normalized.dueDates.DIET_UPDATE ?? null,
          type: followUpTypesToStorage(normalized.type),
          comments: normalized.comments,
          version: expectedVersion + 1,
          updatedAt: timestamp,
        }).where(and(eq(nextFollowUps.accountId, accountId), eq(nextFollowUps.patientId, patientId), eq(nextFollowUps.version, expectedVersion))).returning();
        this.maybeFail('follow-up-after-write');
        return updated[0];
      });
      if (!saved) throw new Error('O acompanhamento não foi retornado após a confirmação.');
      return toFollowUp(saved);
    } catch (cause) {
      throw asClinicalFailure(cause, 'O acompanhamento não pôde ser confirmado; o valor anterior foi preservado.');
    }
  }

  async clearNextFollowUp(accountId: string, patientId: string, expectedVersion: number): Promise<void> {
    try {
      await this.handle.db.transaction(async (tx) => {
        const patientRows = await tx.select({ id: patients.id, archivedAt: patients.archivedAt }).from(patients).where(and(eq(patients.accountId, accountId), eq(patients.id, patientId)));
        const patient = patientRows[0];
        if (!patient) throw new ClinicalApplicationError('CLINICAL_PATIENT_NOT_FOUND', 'Paciente não encontrado nesta Conta.');
        if (patient.archivedAt !== null) throw new ClinicalApplicationError('CLINICAL_PATIENT_ARCHIVED', 'Paciente arquivado não pode receber mutações clínicas.');
        const currentRows = await tx.select().from(nextFollowUps).where(and(eq(nextFollowUps.accountId, accountId), eq(nextFollowUps.patientId, patientId)));
        const current = currentRows[0];
        if (!current) return;
        if (current.version !== expectedVersion) throw new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'O acompanhamento foi atualizado antes da remoção.');
        await tx.delete(nextFollowUps).where(and(eq(nextFollowUps.accountId, accountId), eq(nextFollowUps.patientId, patientId), eq(nextFollowUps.version, expectedVersion)));
        this.maybeFail('follow-up-after-write');
      });
    } catch (cause) {
      throw asClinicalFailure(cause, 'O acompanhamento não pôde ser removido; o valor confirmado foi preservado.');
    }
  }
}
