import type { PGlite, Transaction } from '@electric-sql/pglite';

export interface LocalMigration {
  id: string;
  version: string;
  sql: string;
}

const MIGRATIONS_TABLE = '__nutridiet_migrations';

export const migrationFiles: readonly LocalMigration[] = [
  {
    id: '0000_account_patient_initial',
    version: '1',
    sql: `
      CREATE TABLE IF NOT EXISTS accounts (
        id text PRIMARY KEY,
        display_name text NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS objective_options (
        id text PRIMARY KEY,
        account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        label text NOT NULL,
        normalized_label text NOT NULL,
        origin text NOT NULL CHECK (origin IN ('SYSTEM', 'CUSTOM')),
        archived_at text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS patients (
        id text PRIMARY KEY,
        account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        display_code text NOT NULL,
        name text NOT NULL,
        age integer NOT NULL CHECK (age >= 0),
        gender text NOT NULL,
        height_cm real NOT NULL CHECK (height_cm > 0),
        weight_kg real NOT NULL CHECK (weight_kg > 0),
        marital_status text,
        phone text,
        whatsapp text,
        current_objective text NOT NULL,
        target_protein real NOT NULL CHECK (target_protein >= 0),
        target_carbs real NOT NULL CHECK (target_carbs >= 0),
        target_fats real NOT NULL CHECK (target_fats >= 0),
        target_kcal real NOT NULL CHECK (target_kcal >= 0),
        created_at text NOT NULL,
        updated_at text NOT NULL,
        version integer NOT NULL CHECK (version > 0),
        archived_at text
      );
      CREATE UNIQUE INDEX IF NOT EXISTS objective_options_active_label_idx
        ON objective_options(account_id, normalized_label)
        WHERE archived_at IS NULL;
      CREATE INDEX IF NOT EXISTS objective_options_account_idx
        ON objective_options(account_id);
      CREATE INDEX IF NOT EXISTS patients_account_idx
        ON patients(account_id);
      CREATE UNIQUE INDEX IF NOT EXISTS patients_account_display_code_idx
        ON patients(account_id, display_code);
    `,
  },
];

type MigrationClient = Pick<PGlite, 'exec' | 'query' | 'transaction'>;

async function ensureMigrationTable(client: MigrationClient): Promise<void> {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id text PRIMARY KEY,
      version text NOT NULL,
      applied_at text NOT NULL
    );
  `);
}

async function applyMigration(client: MigrationClient, migration: LocalMigration): Promise<void> {
  await client.transaction(async (tx: Transaction) => {
    await tx.exec(migration.sql);
    await tx.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (id, version, applied_at) VALUES ($1, $2, $3)`,
      [migration.id, migration.version, new Date().toISOString()],
    );
  });
}

export async function applyMigrations(
  client: MigrationClient,
  migrations: readonly LocalMigration[] = migrationFiles,
): Promise<string> {
  await ensureMigrationTable(client);
  const result = await client.query<{ id: string }>(`SELECT id FROM ${MIGRATIONS_TABLE}`);
  const appliedIds = new Set(result.rows.map((row) => row.id));

  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) await applyMigration(client, migration);
  }

  return migrations.at(-1)?.version ?? '1';
}
