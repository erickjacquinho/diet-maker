import type { LocalMigration } from '../migrations';

/** Incremental relational migration for the account-scoped reusable library. */
export const reusableLibraryMigration: LocalMigration = {
  id: '0002_reusable_library',
  version: '3',
  sql: `
    CREATE TABLE IF NOT EXISTS food_catalog_items (
      id text PRIMARY KEY, account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name text NOT NULL, description text NOT NULL, brand text,
      measurement_basis text NOT NULL CHECK (measurement_basis IN ('PER_100G', 'PER_100ML', 'PER_UNIT')),
      food_state text NOT NULL CHECK (food_state IN ('RAW', 'COOKED', 'PREPARED', 'AS_SOLD')),
      serving_reference numeric, serving_unit text CHECK (serving_unit IS NULL OR serving_unit IN ('g', 'ml', 'unit')),
      reference_protein numeric NOT NULL CHECK (reference_protein >= 0), reference_carbs numeric NOT NULL CHECK (reference_carbs >= 0),
      reference_fat numeric NOT NULL CHECK (reference_fat >= 0), reference_fiber numeric NOT NULL CHECK (reference_fiber >= 0),
      reference_energy_kcal numeric CHECK (reference_energy_kcal IS NULL OR reference_energy_kcal >= 0),
      energy_source text NOT NULL CHECK (energy_source IN ('REFERENCE', 'CALCULATED_449')), calculation_version text NOT NULL,
      status text NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')), version integer NOT NULL CHECK (version > 0),
      created_at text NOT NULL, updated_at text NOT NULL, archived_at text,
      CHECK (serving_reference IS NULL OR serving_reference > 0),
      CHECK ((serving_reference IS NULL AND serving_unit IS NULL) OR (serving_reference IS NOT NULL AND serving_unit IS NOT NULL))
    );
    CREATE INDEX IF NOT EXISTS food_catalog_items_account_idx ON food_catalog_items(account_id);
    CREATE INDEX IF NOT EXISTS food_catalog_items_account_status_idx ON food_catalog_items(account_id, status);
    CREATE TABLE IF NOT EXISTS recipes (
      id text PRIMARY KEY, account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name text NOT NULL, category text NOT NULL, instructions text NOT NULL, prep_time_minutes integer,
      yield_portions numeric NOT NULL CHECK (yield_portions > 0), prepared_weight_grams numeric CHECK (prepared_weight_grams IS NULL OR prepared_weight_grams > 0),
      total_protein numeric NOT NULL CHECK (total_protein >= 0), total_carbs numeric NOT NULL CHECK (total_carbs >= 0), total_fat numeric NOT NULL CHECK (total_fat >= 0), total_fiber numeric NOT NULL CHECK (total_fiber >= 0), total_energy_kcal numeric CHECK (total_energy_kcal IS NULL OR total_energy_kcal >= 0),
      per_portion_protein numeric NOT NULL CHECK (per_portion_protein >= 0), per_portion_carbs numeric NOT NULL CHECK (per_portion_carbs >= 0), per_portion_fat numeric NOT NULL CHECK (per_portion_fat >= 0), per_portion_fiber numeric NOT NULL CHECK (per_portion_fiber >= 0), per_portion_energy_kcal numeric CHECK (per_portion_energy_kcal IS NULL OR per_portion_energy_kcal >= 0),
      status text NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')), version integer NOT NULL CHECK (version > 0),
      created_at text NOT NULL, updated_at text NOT NULL, archived_at text,
      CHECK (prep_time_minutes IS NULL OR prep_time_minutes >= 0)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS recipes_id_account_idx ON recipes(id, account_id);
    CREATE INDEX IF NOT EXISTS recipes_account_idx ON recipes(account_id);
    CREATE INDEX IF NOT EXISTS recipes_account_status_idx ON recipes(account_id, status);
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id text PRIMARY KEY, recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE, account_id text NOT NULL,
      position integer NOT NULL CHECK (position >= 0), source_type text NOT NULL CHECK (source_type IN ('SYSTEM_TACO', 'ACCOUNT_CUSTOM')), source_id text NOT NULL, source_version text NOT NULL,
      quantity numeric NOT NULL CHECK (quantity > 0), unit text NOT NULL CHECK (unit IN ('g', 'ml', 'unit')), ingredient_snapshot jsonb NOT NULL,
      CONSTRAINT recipe_ingredients_recipe_scope_fk FOREIGN KEY (recipe_id, account_id) REFERENCES recipes(id, account_id) ON DELETE CASCADE,
      CONSTRAINT recipe_ingredients_position_uk UNIQUE (recipe_id, position)
    );
    CREATE INDEX IF NOT EXISTS recipe_ingredients_account_source_idx ON recipe_ingredients(account_id, source_type, source_id);
    CREATE TABLE IF NOT EXISTS ready_meals (
      id text PRIMARY KEY, account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, name text NOT NULL, description text NOT NULL, suggested_time text,
      status text NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')), version integer NOT NULL CHECK (version > 0), created_at text NOT NULL, updated_at text NOT NULL, archived_at text
    );
    CREATE UNIQUE INDEX IF NOT EXISTS ready_meals_id_account_idx ON ready_meals(id, account_id);
    CREATE INDEX IF NOT EXISTS ready_meals_account_idx ON ready_meals(account_id);
    CREATE INDEX IF NOT EXISTS ready_meals_account_status_idx ON ready_meals(account_id, status);
    CREATE TABLE IF NOT EXISTS ready_meal_items (
      id text PRIMARY KEY, ready_meal_id text NOT NULL REFERENCES ready_meals(id) ON DELETE CASCADE, account_id text NOT NULL,
      position integer NOT NULL CHECK (position >= 0), source_type text NOT NULL CHECK (source_type IN ('FOOD', 'RECIPE')), source_id text NOT NULL, source_version text NOT NULL,
      quantity numeric, unit text CHECK (unit IS NULL OR unit IN ('g', 'ml', 'unit')), recipe_portions numeric, item_snapshot jsonb NOT NULL,
      CONSTRAINT ready_meal_items_scope_fk FOREIGN KEY (ready_meal_id, account_id) REFERENCES ready_meals(id, account_id) ON DELETE CASCADE,
      CONSTRAINT ready_meal_items_position_uk UNIQUE (ready_meal_id, position),
      CONSTRAINT ready_meal_items_quantity_or_portions_ck CHECK ((source_type = 'FOOD' AND quantity > 0 AND unit IS NOT NULL AND recipe_portions IS NULL) OR (source_type = 'RECIPE' AND recipe_portions > 0 AND quantity IS NULL AND unit IS NULL))
    );
    CREATE INDEX IF NOT EXISTS ready_meal_items_account_source_idx ON ready_meal_items(account_id, source_type, source_id);
    ALTER TABLE diet_item_snapshots DROP CONSTRAINT IF EXISTS diet_item_snapshots_source_type_check;
    ALTER TABLE diet_item_snapshots ADD CONSTRAINT diet_item_snapshots_source_type_check CHECK (source_type IN ('SYSTEM_TACO', 'ACCOUNT_CUSTOM', 'RECIPE', 'READY_MEAL'));
  `,
};
