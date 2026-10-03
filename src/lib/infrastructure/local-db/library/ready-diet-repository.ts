import { asc, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { ReadyDietRepository } from '@/lib/persistence/library-repository';
import type { ReadyDiet, ReadyDietInput } from '@/lib/domain/library/library-model';
import type { LocalDatabaseHandle } from '../client';
import { readyDiets } from '../schema';

type ReadyDietRow = typeof readyDiets.$inferSelect;

function mapReadyDiet(row: ReadyDietRow): ReadyDiet {
  return { ...row, document: structuredClone(row.document) };
}

export interface ReadyDietRepositoryOptions {
  now?: () => string;
  idFactory?: () => string;
}

export class PGliteReadyDietRepository implements ReadyDietRepository {
  private readonly now: () => string;
  private readonly idFactory: () => string;

  constructor(private readonly handle: LocalDatabaseHandle, options: ReadyDietRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.idFactory = options.idFactory ?? (() => nanoid(16));
  }

  async create(accountId: string, input: ReadyDietInput): Promise<ReadyDiet> {
    const now = this.now();
    const row = {
      id: this.idFactory(),
      accountId,
      name: input.name.trim(),
      document: structuredClone(input.document),
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    const saved = await this.handle.db.insert(readyDiets).values(row).returning();
    if (!saved[0]) throw new Error('A dieta pronta foi salva, mas não pôde ser relida.');
    return mapReadyDiet(saved[0]);
  }

  async list(accountId: string): Promise<ReadyDiet[]> {
    const rows = await this.handle.db.select().from(readyDiets)
      .where(eq(readyDiets.accountId, accountId))
      .orderBy(desc(readyDiets.updatedAt), asc(readyDiets.name));
    return rows.map(mapReadyDiet);
  }
}
