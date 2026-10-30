import 'server-only';

import { sql, type SQL } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DEFAULT_OBJECTIVE_LABELS, normalizeObjectiveLabel, type ObjectiveOption } from '@/lib/domain/objective-option';
import { ApiError, NotFoundError } from '../api/api-errors';
import type { SqlExecutor } from '../patients/patient-repository';

type ObjectiveRow = {
  id: string;
  label: string;
  normalized_label: string;
  created_at: Date | string;
  updated_at: Date | string;
  archived_at: Date | string | null;
};

const COLUMNS = sql`id, label, normalized_label, created_at, updated_at, archived_at`;
const EPOCH = '1970-01-01T00:00:00.000Z';
const iso = (value: Date | string): string => new Date(value).toISOString();

/** Built-in objectives belong to no account: stable IDs, never archived. */
function systemObjectives(accountId: string): ObjectiveOption[] {
  return DEFAULT_OBJECTIVE_LABELS.map((label) => {
    const normalized = normalizeObjectiveLabel(label);
    return {
      id: `system-${normalized.normalizedLabel.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}`,
      accountId, label: normalized.label, normalizedLabel: normalized.normalizedLabel, origin: 'SYSTEM' as const,
      archivedAt: null, createdAt: EPOCH, updatedAt: EPOCH,
    };
  });
}

export function createServerObjectiveRepository(tx: SqlExecutor, accountId: string) {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });
  const toObjective = (row: ObjectiveRow): ObjectiveOption => ({
    id: row.id, accountId, label: row.label, normalizedLabel: row.normalized_label, origin: 'CUSTOM',
    archivedAt: row.archived_at === null ? null : iso(row.archived_at), createdAt: iso(row.created_at), updatedAt: iso(row.updated_at),
  });

  /** Active objectives: the built-in ones plus the account's own, sorted by label. */
  async function list(): Promise<ObjectiveOption[]> {
    const { rows } = await run<ObjectiveRow>(sql`
      SELECT ${COLUMNS} FROM app.objective_options WHERE account_id = ${accountId} AND archived_at IS NULL LIMIT 1000`);
    const custom = rows.map(toObjective);
    const taken = new Set(custom.map((option) => option.normalizedLabel));
    return [...systemObjectives(accountId).filter((option) => !taken.has(option.normalizedLabel)), ...custom]
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  }

  /** Idempotent by label: an existing active label is returned, an archived one is restored. */
  async function addCustom(label: string): Promise<ObjectiveOption> {
    const normalized = normalizeObjectiveLabel(label);
    if (!normalized.label || normalized.label.length > 100) throw new ApiError(422, 'UNPROCESSABLE', { field: 'label' });
    const builtIn = systemObjectives(accountId).find((option) => option.normalizedLabel === normalized.normalizedLabel);
    if (builtIn) return builtIn;
    const { rows } = await run<ObjectiveRow>(sql`
      INSERT INTO app.objective_options (account_id, id, label, normalized_label)
      VALUES (${accountId}, ${randomUUID()}, ${normalized.label}, ${normalized.normalizedLabel})
      ON CONFLICT (account_id, normalized_label) DO UPDATE
        SET label = CASE WHEN app.objective_options.archived_at IS NULL THEN app.objective_options.label ELSE EXCLUDED.label END,
            updated_at = CASE WHEN app.objective_options.archived_at IS NULL THEN app.objective_options.updated_at ELSE now() END,
            archived_at = NULL
      RETURNING ${COLUMNS}`);
    return toObjective(rows[0]);
  }

  async function archiveCustom(id: string): Promise<void> {
    if (id.startsWith('system-')) throw new ApiError(422, 'UNPROCESSABLE', { field: 'id' });
    const { rows } = await run<{ id: string }>(sql`
      UPDATE app.objective_options SET archived_at = COALESCE(archived_at, now()), updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} RETURNING id`);
    if (!rows[0]) throw new NotFoundError();
  }

  return { list, addCustom, archiveCustom };
}

export type ServerObjectiveRepository = ReturnType<typeof createServerObjectiveRepository>;
