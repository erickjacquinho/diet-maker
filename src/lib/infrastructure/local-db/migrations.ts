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
  {
    id: '0001_diet_draft_history',
    version: '2',
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS patients_account_id_id_idx
        ON patients(account_id, id);

      CREATE TABLE IF NOT EXISTS diet_plans (
        id text PRIMARY KEY,
        account_id text NOT NULL,
        patient_id text NOT NULL,
        name text NOT NULL,
        mode text NOT NULL CHECK (mode IN ('SIMPLE', 'CARB_CYCLING')),
        status text NOT NULL CHECK (status IN ('ACTIVE', 'SNAPSHOT')),
        weight_reference_kg numeric,
        version integer NOT NULL CHECK (version > 0),
        created_at text NOT NULL,
        updated_at text NOT NULL,
        activated_at text NOT NULL,
        superseded_at text,
        CONSTRAINT diet_plans_patient_scope_fk FOREIGN KEY (account_id, patient_id) REFERENCES patients(account_id, id)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS diet_plans_one_active_idx
        ON diet_plans(account_id, patient_id) WHERE status = 'ACTIVE';
      CREATE UNIQUE INDEX IF NOT EXISTS diet_plans_scope_identity_idx
        ON diet_plans(id, account_id, patient_id);

      CREATE TABLE IF NOT EXISTS diet_variations (
        id text PRIMARY KEY,
        diet_plan_id text NOT NULL,
        account_id text NOT NULL,
        patient_id text NOT NULL,
        position integer NOT NULL CHECK (position >= 0),
        kind text NOT NULL CHECK (kind IN ('SIMPLE', 'HIGH', 'MEDIUM', 'LOW', 'ZERO', 'CUSTOM')),
        name text NOT NULL,
        input_mode text NOT NULL CHECK (input_mode IN ('GRAMS', 'G_PER_KG', 'PERCENTAGE', 'DELTA_BASE')),
        target_protein numeric NOT NULL CHECK (target_protein >= 0),
        target_carbs numeric NOT NULL CHECK (target_carbs >= 0),
        target_fat numeric NOT NULL CHECK (target_fat >= 0),
        target_kcal numeric NOT NULL CHECK (target_kcal >= 0),
        g_per_kg_protein numeric,
        g_per_kg_carbs numeric,
        g_per_kg_fat numeric,
        CONSTRAINT diet_variations_plan_fk FOREIGN KEY (diet_plan_id, account_id, patient_id) REFERENCES diet_plans(id, account_id, patient_id) ON DELETE CASCADE,
        CONSTRAINT diet_variations_position_uk UNIQUE (diet_plan_id, position)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS diet_variations_scope_identity_idx
        ON diet_variations(id, diet_plan_id, account_id, patient_id);

      CREATE TABLE IF NOT EXISTS diet_variation_days (
        variation_id text NOT NULL,
        diet_plan_id text NOT NULL,
        account_id text NOT NULL,
        patient_id text NOT NULL,
        day_code text NOT NULL CHECK (day_code IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
        position integer NOT NULL CHECK (position >= 0),
        PRIMARY KEY (variation_id, day_code),
        CONSTRAINT diet_variation_days_variation_fk FOREIGN KEY (variation_id, diet_plan_id, account_id, patient_id) REFERENCES diet_variations(id, diet_plan_id, account_id, patient_id) ON DELETE CASCADE,
        CONSTRAINT diet_variation_days_one_plan_day_uk UNIQUE (diet_plan_id, day_code)
      );

      CREATE TABLE IF NOT EXISTS diet_meals (
        id text PRIMARY KEY,
        diet_plan_id text NOT NULL,
        variation_id text NOT NULL,
        account_id text NOT NULL,
        patient_id text NOT NULL,
        position integer NOT NULL CHECK (position >= 0),
        name text NOT NULL,
        time text,
        CONSTRAINT diet_meals_variation_fk FOREIGN KEY (variation_id, diet_plan_id, account_id, patient_id) REFERENCES diet_variations(id, diet_plan_id, account_id, patient_id) ON DELETE CASCADE,
        CONSTRAINT diet_meals_position_uk UNIQUE (variation_id, position)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS diet_meals_scope_identity_idx
        ON diet_meals(id, diet_plan_id, variation_id, account_id, patient_id);

      CREATE TABLE IF NOT EXISTS diet_meal_options (
        id text PRIMARY KEY,
        diet_meal_id text NOT NULL REFERENCES diet_meals(id) ON DELETE CASCADE,
        position integer NOT NULL CHECK (position >= 0),
        label text NOT NULL,
        counts_toward_totals boolean NOT NULL,
        CONSTRAINT diet_meal_options_position_uk UNIQUE (diet_meal_id, position)
      );

      CREATE TABLE IF NOT EXISTS diet_meal_items (
        id text PRIMARY KEY,
        diet_meal_option_id text NOT NULL REFERENCES diet_meal_options(id) ON DELETE CASCADE,
        position integer NOT NULL CHECK (position >= 0),
        role text NOT NULL CHECK (role IN ('PRIMARY', 'SUBSTITUTE')),
        parent_item_id text,
        name text NOT NULL,
        CONSTRAINT diet_meal_items_position_uk UNIQUE (diet_meal_option_id, position),
        CONSTRAINT diet_meal_items_parent_fk FOREIGN KEY (parent_item_id) REFERENCES diet_meal_items(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS diet_item_snapshots (
        diet_meal_item_id text PRIMARY KEY REFERENCES diet_meal_items(id) ON DELETE CASCADE,
        source_type text NOT NULL CHECK (source_type IN ('SYSTEM_TACO')),
        source_id text NOT NULL,
        source_version text NOT NULL,
        display_name text NOT NULL,
        description text NOT NULL,
        measurement_basis text NOT NULL CHECK (measurement_basis IN ('PER_100G', 'PER_100ML', 'PER_UNIT')),
        food_state text NOT NULL CHECK (food_state IN ('RAW', 'COOKED', 'PREPARED', 'AS_SOLD')),
        reference_quantity numeric NOT NULL CHECK (reference_quantity > 0),
        reference_unit text NOT NULL CHECK (reference_unit IN ('g', 'ml', 'unit')),
        reference_protein numeric NOT NULL CHECK (reference_protein >= 0),
        reference_carbs numeric NOT NULL CHECK (reference_carbs >= 0),
        reference_fat numeric NOT NULL CHECK (reference_fat >= 0),
        reference_fiber numeric NOT NULL CHECK (reference_fiber >= 0),
        reference_energy_kcal numeric CHECK (reference_energy_kcal IS NULL OR reference_energy_kcal >= 0),
        prescribed_quantity numeric NOT NULL CHECK (prescribed_quantity > 0),
        prescribed_unit text NOT NULL CHECK (prescribed_unit IN ('g', 'ml', 'unit')),
        prescribed_protein numeric NOT NULL CHECK (prescribed_protein >= 0),
        prescribed_carbs numeric NOT NULL CHECK (prescribed_carbs >= 0),
        prescribed_fat numeric NOT NULL CHECK (prescribed_fat >= 0),
        prescribed_fiber numeric NOT NULL CHECK (prescribed_fiber >= 0),
        prescribed_energy_kcal numeric CHECK (prescribed_energy_kcal IS NULL OR prescribed_energy_kcal >= 0),
        energy_source text NOT NULL CHECK (energy_source IN ('REFERENCE', 'CALCULATED_449')),
        calculation_version text NOT NULL,
        conversion_snapshot jsonb NOT NULL,
        composition_snapshot jsonb NOT NULL
      );
      CREATE INDEX IF NOT EXISTS diet_variations_plan_idx ON diet_variations(diet_plan_id, position);
      CREATE INDEX IF NOT EXISTS diet_meals_variation_idx ON diet_meals(variation_id, position);
      CREATE INDEX IF NOT EXISTS diet_plans_patient_history_idx ON diet_plans(account_id, patient_id, activated_at DESC);
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
