import type { PGlite, Transaction } from '@electric-sql/pglite';
import { reusableLibraryMigration } from './migrations/0002_reusable_library';

export interface LocalMigration {
  id: string;
  version: string;
  sql: string;
}

const MIGRATIONS_TABLE = '__nutridiet_migrations';

const legacyMigrationFiles: readonly LocalMigration[] = [
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
  {
    id: '0002_reusable_library',
    version: '3',
    sql: [
      "CREATE TABLE IF NOT EXISTS food_catalog_items (",
      "  id text PRIMARY KEY, account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,",
      "  name text NOT NULL, description text NOT NULL, brand text,",
      "  measurement_basis text NOT NULL CHECK (measurement_basis IN ('PER_100G', 'PER_100ML', 'PER_UNIT')),",
      "  food_state text NOT NULL CHECK (food_state IN ('RAW', 'COOKED', 'PREPARED', 'AS_SOLD')),",
      "  serving_reference numeric, serving_unit text CHECK (serving_unit IS NULL OR serving_unit IN ('g', 'ml', 'unit')),",
      "  reference_protein numeric NOT NULL CHECK (reference_protein >= 0), reference_carbs numeric NOT NULL CHECK (reference_carbs >= 0),",
      "  reference_fat numeric NOT NULL CHECK (reference_fat >= 0), reference_fiber numeric NOT NULL CHECK (reference_fiber >= 0),",
      "  reference_energy_kcal numeric CHECK (reference_energy_kcal IS NULL OR reference_energy_kcal >= 0),",
      "  energy_source text NOT NULL CHECK (energy_source IN ('REFERENCE', 'CALCULATED_449')), calculation_version text NOT NULL,",
      "  status text NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')), version integer NOT NULL CHECK (version > 0),",
      "  created_at text NOT NULL, updated_at text NOT NULL, archived_at text,",
      "  CHECK (serving_reference IS NULL OR serving_reference > 0),",
      "  CHECK ((serving_reference IS NULL AND serving_unit IS NULL) OR (serving_reference IS NOT NULL AND serving_unit IS NOT NULL))",
      ");",
      "CREATE INDEX IF NOT EXISTS food_catalog_items_account_idx ON food_catalog_items(account_id);",
      "CREATE INDEX IF NOT EXISTS food_catalog_items_account_status_idx ON food_catalog_items(account_id, status);",
      "CREATE TABLE IF NOT EXISTS recipes (",
      "  id text PRIMARY KEY, account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,",
      "  name text NOT NULL, category text NOT NULL, instructions text NOT NULL, prep_time_minutes integer,",
      "  yield_portions numeric NOT NULL CHECK (yield_portions > 0), prepared_weight_grams numeric CHECK (prepared_weight_grams IS NULL OR prepared_weight_grams > 0),",
      "  total_protein numeric NOT NULL CHECK (total_protein >= 0), total_carbs numeric NOT NULL CHECK (total_carbs >= 0), total_fat numeric NOT NULL CHECK (total_fat >= 0), total_fiber numeric NOT NULL CHECK (total_fiber >= 0), total_energy_kcal numeric CHECK (total_energy_kcal IS NULL OR total_energy_kcal >= 0),",
      "  per_portion_protein numeric NOT NULL CHECK (per_portion_protein >= 0), per_portion_carbs numeric NOT NULL CHECK (per_portion_carbs >= 0), per_portion_fat numeric NOT NULL CHECK (per_portion_fat >= 0), per_portion_fiber numeric NOT NULL CHECK (per_portion_fiber >= 0), per_portion_energy_kcal numeric CHECK (per_portion_energy_kcal IS NULL OR per_portion_energy_kcal >= 0),",
      "  status text NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')), version integer NOT NULL CHECK (version > 0),",
      "  created_at text NOT NULL, updated_at text NOT NULL, archived_at text,",
      "  CHECK (prep_time_minutes IS NULL OR prep_time_minutes >= 0)",
      ");",
      "CREATE UNIQUE INDEX IF NOT EXISTS recipes_id_account_idx ON recipes(id, account_id);",
      "CREATE INDEX IF NOT EXISTS recipes_account_idx ON recipes(account_id);",
      "CREATE INDEX IF NOT EXISTS recipes_account_status_idx ON recipes(account_id, status);",
      "CREATE TABLE IF NOT EXISTS recipe_ingredients (",
      "  id text PRIMARY KEY, recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE, account_id text NOT NULL,",
      "  position integer NOT NULL CHECK (position >= 0), source_type text NOT NULL CHECK (source_type IN ('SYSTEM_TACO', 'ACCOUNT_CUSTOM')), source_id text NOT NULL, source_version text NOT NULL,",
      "  quantity numeric NOT NULL CHECK (quantity > 0), unit text NOT NULL CHECK (unit IN ('g', 'ml', 'unit')), ingredient_snapshot jsonb NOT NULL,",
      "  CONSTRAINT recipe_ingredients_recipe_scope_fk FOREIGN KEY (recipe_id, account_id) REFERENCES recipes(id, account_id) ON DELETE CASCADE,",
      "  CONSTRAINT recipe_ingredients_position_uk UNIQUE (recipe_id, position)",
      ");",
      "CREATE INDEX IF NOT EXISTS recipe_ingredients_account_source_idx ON recipe_ingredients(account_id, source_type, source_id);",
      "CREATE TABLE IF NOT EXISTS ready_meals (",
      "  id text PRIMARY KEY, account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, name text NOT NULL, description text NOT NULL, suggested_time text,",
      "  status text NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')), version integer NOT NULL CHECK (version > 0), created_at text NOT NULL, updated_at text NOT NULL, archived_at text",
      ");",
      "CREATE UNIQUE INDEX IF NOT EXISTS ready_meals_id_account_idx ON ready_meals(id, account_id);",
      "CREATE INDEX IF NOT EXISTS ready_meals_account_idx ON ready_meals(account_id);",
      "CREATE INDEX IF NOT EXISTS ready_meals_account_status_idx ON ready_meals(account_id, status);",
      "CREATE TABLE IF NOT EXISTS ready_meal_items (",
      "  id text PRIMARY KEY, ready_meal_id text NOT NULL REFERENCES ready_meals(id) ON DELETE CASCADE, account_id text NOT NULL,",
      "  position integer NOT NULL CHECK (position >= 0), source_type text NOT NULL CHECK (source_type IN ('FOOD', 'RECIPE')), source_id text NOT NULL, source_version text NOT NULL,",
      "  quantity numeric, unit text CHECK (unit IS NULL OR unit IN ('g', 'ml', 'unit')), recipe_portions numeric, item_snapshot jsonb NOT NULL,",
      "  CONSTRAINT ready_meal_items_scope_fk FOREIGN KEY (ready_meal_id, account_id) REFERENCES ready_meals(id, account_id) ON DELETE CASCADE,",
      "  CONSTRAINT ready_meal_items_position_uk UNIQUE (ready_meal_id, position),",
      "  CONSTRAINT ready_meal_items_quantity_or_portions_ck CHECK ((source_type = 'FOOD' AND quantity > 0 AND unit IS NOT NULL AND recipe_portions IS NULL) OR (source_type = 'RECIPE' AND recipe_portions > 0 AND quantity IS NULL AND unit IS NULL))",
      ");",
      "CREATE INDEX IF NOT EXISTS ready_meal_items_account_source_idx ON ready_meal_items(account_id, source_type, source_id);",
      "ALTER TABLE diet_item_snapshots DROP CONSTRAINT IF EXISTS diet_item_snapshots_source_type_check;",
      "ALTER TABLE diet_item_snapshots ADD CONSTRAINT diet_item_snapshots_source_type_check CHECK (source_type IN ('SYSTEM_TACO', 'ACCOUNT_CUSTOM', 'RECIPE', 'READY_MEAL'));",
    ].join('\n'),
  },
];

export const clinicalPersistenceMigration: LocalMigration = {
  id: '0003_clinical_persistence',
  version: '4',
  sql: `
    CREATE TABLE IF NOT EXISTS body_assessments (
      id text PRIMARY KEY,
      account_id text NOT NULL,
      patient_id text NOT NULL,
      clinical_date text NOT NULL,
      weight_kg numeric NOT NULL,
      body_fat_percent numeric NOT NULL,
      fat_mass_kg numeric NOT NULL,
      lean_mass_kg numeric NOT NULL,
      waist_cm numeric NOT NULL,
      scapula_cm numeric NOT NULL,
      bust_cm numeric NOT NULL,
      abdomen_cm numeric NOT NULL,
      hip_cm numeric NOT NULL,
      left_proximal_thigh_cm numeric NOT NULL,
      right_proximal_thigh_cm numeric NOT NULL,
      neck_cm numeric,
      left_arm_cm numeric,
      right_arm_cm numeric,
      left_distal_thigh_cm numeric,
      right_distal_thigh_cm numeric,
      left_calf_cm numeric,
      right_calf_cm numeric,
      auto_filled_fields jsonb NOT NULL,
      calculation_method text NOT NULL CHECK (calculation_method IN ('US_NAVY')),
      calculation_version text NOT NULL,
      calculation_input_snapshot jsonb NOT NULL,
      version integer NOT NULL CHECK (version > 0),
      created_at text NOT NULL,
      updated_at text NOT NULL,
      CONSTRAINT body_assessments_patient_scope_fk FOREIGN KEY (account_id, patient_id) REFERENCES patients(account_id, id) ON DELETE RESTRICT,
      CONSTRAINT body_assessments_body_fat_range CHECK (body_fat_percent >= 0 AND body_fat_percent <= 100),
      CONSTRAINT body_assessments_results_non_negative CHECK (fat_mass_kg >= 0 AND lean_mass_kg >= 0),
      CONSTRAINT body_assessments_required_measurements_positive CHECK (
        weight_kg > 0 AND waist_cm > 0 AND scapula_cm > 0 AND bust_cm > 0 AND abdomen_cm > 0 AND hip_cm > 0
        AND left_proximal_thigh_cm > 0 AND right_proximal_thigh_cm > 0
      ),
      CONSTRAINT body_assessments_optional_measurements_positive CHECK (
        (neck_cm IS NULL OR neck_cm > 0) AND
        (left_arm_cm IS NULL OR left_arm_cm > 0) AND (right_arm_cm IS NULL OR right_arm_cm > 0) AND
        (left_distal_thigh_cm IS NULL OR left_distal_thigh_cm > 0) AND (right_distal_thigh_cm IS NULL OR right_distal_thigh_cm > 0) AND
        (left_calf_cm IS NULL OR left_calf_cm > 0) AND (right_calf_cm IS NULL OR right_calf_cm > 0)
      )
    );
    CREATE UNIQUE INDEX IF NOT EXISTS body_assessments_scope_identity_idx
      ON body_assessments(id, account_id, patient_id);
    CREATE INDEX IF NOT EXISTS body_assessments_patient_date_idx
      ON body_assessments(account_id, patient_id, clinical_date DESC, created_at DESC, id);

    CREATE TABLE IF NOT EXISTS next_follow_ups (
      account_id text NOT NULL,
      patient_id text NOT NULL,
      due_date text NOT NULL,
      type text NOT NULL CHECK (type IN ('ASSESSMENT_UPDATE', 'DIET_UPDATE')),
      version integer NOT NULL CHECK (version > 0),
      created_at text NOT NULL,
      updated_at text NOT NULL,
      PRIMARY KEY (account_id, patient_id),
      CONSTRAINT next_follow_ups_patient_scope_fk FOREIGN KEY (account_id, patient_id) REFERENCES patients(account_id, id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS next_follow_ups_due_date_idx
      ON next_follow_ups(account_id, due_date, patient_id);
  `,
};

export const migrationFiles: readonly LocalMigration[] = [
  ...legacyMigrationFiles.slice(0, 2),
  reusableLibraryMigration,
  clinicalPersistenceMigration,
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
