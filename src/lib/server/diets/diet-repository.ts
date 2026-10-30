import 'server-only';

import { sql, type SQL } from 'drizzle-orm';
import { validateDietForConfirmation } from '@/lib/domain/diets/diet-validation';
import { isDietDomainError } from '@/lib/domain/diets/diet-errors';
import type {
  ConfirmActiveResult,
  DecimalString,
  DietDraft,
  DietEditableDocument,
  DietPlan,
  DietVariation,
} from '@/lib/domain/diets/diet-model';
import type { AutosaveResultDto, PutDietDraftRequest } from '@/lib/contracts/diets';
import { ApiError, NotFoundError, VersionConflictError } from '../api/api-errors';
import type { SqlExecutor } from '../patients/patient-repository';

type PlanRow = {
  id: string;
  patient_id: string;
  name: string;
  mode: DietPlan['mode'];
  status: DietPlan['status'];
  weight_reference_kg: string | null;
  variations: DietVariation[];
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
  activated_at: Date | string;
  superseded_at: Date | string | null;
};

type DraftRow = {
  patient_id: string;
  route_diet_id: string;
  draft_id: string;
  payload_schema_version: number;
  draft_revision: number;
  state: DietDraft['state'];
  base_diet_id: string | null;
  base_diet_version: number | null;
  target_diet_id: string | null;
  payload: DietEditableDocument;
  created_at: Date | string;
  updated_at: Date | string;
  discarded_at: Date | string | null;
};

const PLAN_COLUMNS = sql`id, patient_id, name, mode, status, weight_reference_kg, variations, version,
  created_at, updated_at, activated_at, superseded_at`;
const DRAFT_COLUMNS = sql`patient_id, route_diet_id, draft_id, payload_schema_version, draft_revision, state,
  base_diet_id, base_diet_version, target_diet_id, payload, created_at, updated_at, discarded_at`;

type Timestamp = Date | string;
const iso = (value: Timestamp): string => new Date(value).toISOString();
const json = (value: unknown) => sql`${JSON.stringify(value)}::jsonb`;

export function createServerDietRepository(tx: SqlExecutor, accountId: string) {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });

  async function patientState(patientId: string): Promise<{ archived: boolean }> {
    const { rows } = await run<{ archived_at: unknown }>(
      sql`SELECT archived_at FROM app.patients WHERE account_id = ${accountId} AND id = ${patientId}`,
    );
    if (!rows[0]) throw new NotFoundError();
    return { archived: rows[0].archived_at !== null };
  }

  async function requireActivePatient(patientId: string): Promise<void> {
    if ((await patientState(patientId)).archived) throw new ApiError(422, 'UNPROCESSABLE');
  }

  function toPlan(row: PlanRow): DietPlan {
    return {
      id: row.id,
      accountId,
      patientId: row.patient_id,
      name: row.name,
      mode: row.mode,
      status: row.status,
      version: row.version,
      ...(row.weight_reference_kg === null ? {} : { weightReferenceKg: row.weight_reference_kg as DecimalString }),
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
      activatedAt: iso(row.activated_at),
      supersededAt: row.superseded_at === null ? null : iso(row.superseded_at),
      variations: row.variations,
    };
  }

  async function selectPlan(patientId: string, id: string): Promise<PlanRow | undefined> {
    const { rows } = await run<PlanRow>(sql`
      SELECT ${PLAN_COLUMNS} FROM app.diet_plans
      WHERE account_id = ${accountId} AND patient_id = ${patientId} AND id = ${id}`);
    return rows[0];
  }

  async function getPlan(patientId: string, id: string): Promise<DietPlan> {
    const row = await selectPlan(patientId, id);
    if (!row) throw new NotFoundError();
    return toPlan(row);
  }

  /** Active plan first, then newest activation. */
  async function listPlans(patientId: string): Promise<DietPlan[]> {
    await patientState(patientId);
    const { rows } = await run<PlanRow>(sql`
      SELECT ${PLAN_COLUMNS} FROM app.diet_plans
      WHERE account_id = ${accountId} AND patient_id = ${patientId}
      ORDER BY (status = 'ACTIVE') DESC, activated_at DESC, updated_at DESC, id LIMIT 200`);
    return rows.map(toPlan);
  }

  /** Idempotent by `dietId`; with a base it replaces the active plan if its version still matches. */
  async function confirmActive(
    patientId: string,
    command: { dietId: string; baseDietId?: string; baseDietVersion?: number; draftRouteId?: string; document: DietEditableDocument },
  ): Promise<ConfirmActiveResult> {
    await requireActivePatient(patientId);
    try {
      validateDietForConfirmation(command.document);
    } catch (error) {
      if (isDietDomainError(error)) throw new ApiError(422, 'UNPROCESSABLE', { reason: error.code });
      throw error;
    }
    const { document } = command;
    const current = await selectPlan(patientId, command.dietId);

    let result: ConfirmActiveResult;
    if (!command.baseDietId) {
      if (current) return { status: 'ALREADY_COMMITTED', planId: current.id, version: current.version };
      await run(sql`
        UPDATE app.diet_plans SET status = 'SNAPSHOT', superseded_at = now(), updated_at = now()
        WHERE account_id = ${accountId} AND patient_id = ${patientId} AND status = 'ACTIVE'`);
      await run(sql`
        INSERT INTO app.diet_plans (account_id, id, patient_id, name, mode, status, weight_reference_kg, variations, version)
        VALUES (${accountId}, ${command.dietId}, ${patientId}, ${document.name}, ${document.mode}, 'ACTIVE',
          ${document.weightReferenceKg ?? null}, ${json(document.variations)}, 1)`);
      result = { status: 'COMMITTED_NEW', planId: command.dietId, version: 1 };
    } else {
      if (command.baseDietId !== command.dietId) throw new ApiError(422, 'UNPROCESSABLE');
      if (!current) throw new NotFoundError();
      if (current.status !== 'ACTIVE' || current.version !== command.baseDietVersion) throw new VersionConflictError(current.version);
      const { rows } = await run<{ version: number }>(sql`
        UPDATE app.diet_plans SET name = ${document.name}, mode = ${document.mode},
          weight_reference_kg = ${document.weightReferenceKg ?? null}, variations = ${json(document.variations)},
          version = version + 1, updated_at = now(), activated_at = now(), superseded_at = NULL
        WHERE account_id = ${accountId} AND patient_id = ${patientId} AND id = ${command.dietId}
          AND status = 'ACTIVE' AND version = ${command.baseDietVersion}
        RETURNING version`);
      if (!rows[0]) throw new VersionConflictError(current.version + 1);
      result = { status: 'COMMITTED_UPDATE', planId: command.dietId, version: rows[0].version };
    }
    if (command.draftRouteId) await discardDraft(patientId, command.draftRouteId);
    return result;
  }

  function toDraft(row: DraftRow): DietDraft {
    return {
      draftId: row.draft_id,
      contextKey: `${accountId}:${row.patient_id}:${row.route_diet_id}`,
      accountId,
      patientId: row.patient_id,
      routeDietId: row.route_diet_id,
      payloadSchemaVersion: row.payload_schema_version,
      draftRevision: row.draft_revision,
      state: row.state,
      ...(row.base_diet_id === null ? {} : { baseDietId: row.base_diet_id, baseDietVersion: row.base_diet_version ?? undefined }),
      ...(row.target_diet_id === null ? {} : { targetDietId: row.target_diet_id }),
      payload: row.payload,
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
    };
  }

  async function selectDraft(patientId: string, routeId: string): Promise<DraftRow | undefined> {
    const { rows } = await run<DraftRow>(sql`
      SELECT ${DRAFT_COLUMNS} FROM app.diet_drafts
      WHERE account_id = ${accountId} AND patient_id = ${patientId} AND route_diet_id = ${routeId}`);
    return rows[0];
  }

  async function getDraft(patientId: string, routeId: string): Promise<DietDraft | null> {
    await patientState(patientId);
    const row = await selectDraft(patientId, routeId);
    return row && row.discarded_at === null ? toDraft(row) : null;
  }

  /** A lower revision than the stored one is superseded; equal revisions are accepted so retries are idempotent. */
  async function putDraft(patientId: string, routeId: string, request: PutDietDraftRequest): Promise<AutosaveResultDto> {
    await requireActivePatient(patientId);
    const existing = await selectDraft(patientId, routeId);
    if (existing) {
      const discarded = existing.discarded_at !== null;
      if (!discarded && existing.state === 'INVALIDATED_BY_PATIENT_ARCHIVE') return { status: 'INVALIDATED' };
      // A discarded draft starts over, so its old revision no longer outranks the new one.
      if (!discarded && existing.draft_revision > request.draftRevision) return { status: 'SUPERSEDED', currentRevision: existing.draft_revision };
      const { rows } = await run<{ updated_at: Date | string }>(sql`
        UPDATE app.diet_drafts SET draft_id = ${request.draftId}, payload_schema_version = ${request.payloadSchemaVersion},
          draft_revision = ${request.draftRevision}, base_diet_id = ${request.baseDietId ?? null},
          base_diet_version = ${request.baseDietVersion ?? null}, target_diet_id = ${request.targetDietId ?? null},
          payload = ${json(request.payload)}, state = 'EDITABLE', discarded_at = NULL, updated_at = now()
        WHERE account_id = ${accountId} AND patient_id = ${patientId} AND route_diet_id = ${routeId}
        RETURNING updated_at`);
      return { status: 'SAVED', revision: request.draftRevision, updatedAt: iso(rows[0].updated_at) };
    }
    const { rows } = await run<{ updated_at: Date | string }>(sql`
      INSERT INTO app.diet_drafts (account_id, patient_id, route_diet_id, draft_id, payload_schema_version,
        draft_revision, base_diet_id, base_diet_version, target_diet_id, payload)
      VALUES (${accountId}, ${patientId}, ${routeId}, ${request.draftId}, ${request.payloadSchemaVersion},
        ${request.draftRevision}, ${request.baseDietId ?? null}, ${request.baseDietVersion ?? null},
        ${request.targetDietId ?? null}, ${json(request.payload)})
      RETURNING updated_at`);
    return { status: 'SAVED', revision: request.draftRevision, updatedAt: iso(rows[0].updated_at) };
  }

  /** Idempotent. Rows are never deleted: the draft is marked discarded and its payload wiped. */
  async function discardDraft(patientId: string, routeId: string): Promise<void> {
    await run(sql`
      UPDATE app.diet_drafts SET discarded_at = now(), payload = '{}'::jsonb, updated_at = now()
      WHERE account_id = ${accountId} AND patient_id = ${patientId} AND route_diet_id = ${routeId}
        AND discarded_at IS NULL`);
  }

  /** Editable drafts still worth recovering, newest first; one patient or the whole account. */
  async function listRecoverableDrafts(patientId?: string): Promise<DietDraft[]> {
    if (patientId) await patientState(patientId);
    const { rows } = await run<DraftRow>(sql`
      SELECT ${DRAFT_COLUMNS} FROM app.diet_drafts
      WHERE account_id = ${accountId} AND discarded_at IS NULL AND state = 'EDITABLE'
        ${patientId ? sql`AND patient_id = ${patientId}` : sql``}
      ORDER BY updated_at DESC, route_diet_id LIMIT 200`);
    return rows.map(toDraft);
  }

  /** Called when a patient is archived: open drafts can no longer be saved. Returns how many were invalidated. */
  async function invalidateDrafts(patientId: string): Promise<number> {
    const { rows } = await run<{ route_diet_id: string }>(sql`
      UPDATE app.diet_drafts SET state = 'INVALIDATED_BY_PATIENT_ARCHIVE', updated_at = now()
      WHERE account_id = ${accountId} AND patient_id = ${patientId} AND discarded_at IS NULL
        AND state = 'EDITABLE'
      RETURNING route_diet_id`);
    return rows.length;
  }

  /** Diet count and the most recently activated diet per patient, in one query. */
  async function summarize(patientIds: readonly string[]) {
    const result = new Map<string, { count: number; latest: { id: string; activatedAt: string; updatedAt: string } }>();
    if (patientIds.length === 0) return result;
    const ids = sql.join(patientIds.map((id) => sql`${id}::uuid`), sql`, `);
    const { rows } = await run<{ patient_id: string; id: string; activated_at: Timestamp; updated_at: Timestamp; total: number }>(sql`
      SELECT patient_id, id, activated_at, updated_at, total FROM (
        SELECT patient_id, id, activated_at, updated_at, count(*) OVER (PARTITION BY patient_id)::int AS total,
          row_number() OVER (PARTITION BY patient_id ORDER BY activated_at DESC, updated_at DESC, id) AS rank
        FROM app.diet_plans WHERE account_id = ${accountId} AND patient_id IN (${ids})
      ) ranked WHERE rank = 1`);
    for (const row of rows) {
      result.set(row.patient_id, { count: row.total, latest: { id: row.id, activatedAt: iso(row.activated_at), updatedAt: iso(row.updated_at) } });
    }
    return result;
  }

  return { listPlans, getPlan, confirmActive, getDraft, listRecoverableDrafts, putDraft, discardDraft, invalidateDrafts, summarize, patientState };
}

export type ServerDietRepository = ReturnType<typeof createServerDietRepository>;
