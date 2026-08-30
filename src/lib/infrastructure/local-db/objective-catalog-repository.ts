import { and, asc, eq, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { normalizeObjectiveLabel, type ObjectiveOption } from '@/lib/domain/objective-option';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import type { LocalDatabaseHandle } from './client';
import { objectiveOptions } from './schema';

type ObjectiveRow = typeof objectiveOptions.$inferSelect;

function toObjective(row: ObjectiveRow): ObjectiveOption {
  return {
    id: row.id,
    accountId: row.accountId,
    label: row.label,
    normalizedLabel: row.normalizedLabel,
    origin: row.origin as ObjectiveOption['origin'],
    archivedAt: row.archivedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class LocalObjectiveCatalogRepository {
  constructor(private readonly handle: LocalDatabaseHandle) {}

  async list(accountId: string): Promise<ObjectiveOption[]> {
    const rows = await this.handle.db.select().from(objectiveOptions)
      .where(and(eq(objectiveOptions.accountId, accountId), isNull(objectiveOptions.archivedAt)))
      .orderBy(asc(objectiveOptions.label));
    return rows.map(toObjective);
  }

  async addCustom(accountId: string, label: string): Promise<ObjectiveOption> {
    const normalized = normalizeObjectiveLabel(label);
    if (!normalized.label) throw new PatientApplicationError('INVALID_FIELD', 'Informe um objetivo.');
    const existing = await this.handle.db.select().from(objectiveOptions)
      .where(and(eq(objectiveOptions.accountId, accountId), eq(objectiveOptions.normalizedLabel, normalized.normalizedLabel)))
      .orderBy(asc(objectiveOptions.archivedAt));
    if (existing[0]?.archivedAt === null) return toObjective(existing[0]);

    const timestamp = new Date().toISOString();
    if (existing[0]) {
      const restored = await this.handle.db.update(objectiveOptions)
        .set({ label: normalized.label, archivedAt: null, updatedAt: timestamp })
        .where(and(eq(objectiveOptions.id, existing[0].id), eq(objectiveOptions.accountId, accountId)))
        .returning();
      if (restored[0]) return toObjective(restored[0]);
    }

    try {
      const inserted = await this.handle.db.transaction(async (tx) => tx.insert(objectiveOptions).values({
        id: nanoid(16),
        accountId,
        label: normalized.label,
        normalizedLabel: normalized.normalizedLabel,
        origin: 'CUSTOM',
        archivedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }).onConflictDoNothing().returning());
      if (inserted[0]) return toObjective(inserted[0]);
      const concurrent = await this.list(accountId);
      const match = concurrent.find((option) => option.normalizedLabel === normalized.normalizedLabel);
      if (match) return match;
      throw new Error('O objetivo não foi retornado após a criação.');
    } catch (cause) {
      if (cause instanceof PatientApplicationError) throw cause;
      throw new PatientApplicationError('PERSISTENCE_FAILURE', 'O objetivo não pôde ser salvo.', { cause });
    }
  }

  async archiveCustom(accountId: string, objectiveId: string): Promise<void> {
    const rows = await this.handle.db.select().from(objectiveOptions)
      .where(and(eq(objectiveOptions.id, objectiveId), eq(objectiveOptions.accountId, accountId)));
    const option = rows[0];
    if (!option) throw new PatientApplicationError('NOT_FOUND', 'Objetivo não encontrado nesta Conta.');
    if (option.origin !== 'CUSTOM') throw new PatientApplicationError('SCOPE_VIOLATION', 'Objetivos padrão não podem ser removidos.');
    await this.handle.db.update(objectiveOptions)
      .set({ archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(and(eq(objectiveOptions.id, objectiveId), eq(objectiveOptions.accountId, accountId)));
  }
}
