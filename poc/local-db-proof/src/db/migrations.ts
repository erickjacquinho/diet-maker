import type { PGlite, Transaction } from '@electric-sql/pglite';
import { INITIAL_SCHEMA_VERSION, PocError, SUPPORTED_SCHEMA_VERSION } from '../contracts';
import initialMigrationSql from '../../drizzle/0000_initial.sql?raw';
import metadataMigrationSql from '../../drizzle/0001_add_fixture_metadata.sql?raw';

export interface MigrationFile {
  id: string;
  schemaVersion: string;
  sql: string;
}

export const migrationFiles: MigrationFile[] = [
  {
    id: '0000_initial',
    schemaVersion: INITIAL_SCHEMA_VERSION,
    sql: initialMigrationSql,
  },
  {
    id: '0001_add_fixture_metadata',
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    sql: metadataMigrationSql,
  },
];

const MIGRATIONS_TABLE = '__poc_migrations';

type MigrationClient = Pick<PGlite, 'exec' | 'query' | 'transaction'>;

function statementsFor(sql: string): string[] {
  return sql
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureMigrationTable(client: MigrationClient): Promise<void> {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id text PRIMARY KEY,
      schema_version text NOT NULL,
      applied_at text NOT NULL
    );
  `);
}

async function applyMigration(client: MigrationClient, migration: MigrationFile): Promise<void> {
  await client.transaction(async (tx: Transaction) => {
    for (const statement of statementsFor(migration.sql)) {
      await tx.exec(statement);
    }

    await tx.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (id, schema_version, applied_at) VALUES ($1, $2, $3)`,
      [migration.id, migration.schemaVersion, new Date().toISOString()],
    );
  });
}

export async function applyMigrations(
  client: MigrationClient,
  migrations: readonly MigrationFile[] = migrationFiles,
): Promise<string> {
  try {
    await ensureMigrationTable(client);
    const applied = await client.query<{ id: string; schema_version: string }>(
      `SELECT id, schema_version FROM ${MIGRATIONS_TABLE} ORDER BY id`,
    );
    const appliedIds = new Set(applied.rows.map((row) => row.id));

    for (const migration of migrations) {
      if (!appliedIds.has(migration.id)) {
        await applyMigration(client, migration);
      }
    }

    return migrations.at(-1)?.schemaVersion ?? SUPPORTED_SCHEMA_VERSION;
  } catch (cause) {
    throw new PocError(
      'MIGRATION_FAILED',
      'apply-migrations',
      'Não foi possível aplicar as migrations versionadas da PoC.',
      { migrationIds: migrations.map((migration) => migration.id) },
      { cause },
    );
  }
}

export function assertSupportedSchemaVersion(version: string): void {
  if (version !== SUPPORTED_SCHEMA_VERSION) {
    throw new PocError(
      'MIGRATION_FAILED',
      'validate-schema-version',
      'A versão do schema não é suportada pela PoC.',
      { received: version, supported: SUPPORTED_SCHEMA_VERSION },
    );
  }
}

export function splitMigrationStatements(sql: string): string[] {
  return statementsFor(sql);
}
