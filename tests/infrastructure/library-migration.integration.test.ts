// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { applyMigrations, migrationFiles } from '@/lib/infrastructure/local-db/migrations';

const clients: PGlite[] = [];

afterEach(async () => {
  await Promise.all(clients.map(async (client) => {
    if (!client.closed) await client.close();
  }));
  clients.length = 0;
});

function createClient(): PGlite {
  const client = new PGlite('memory://library-migration-' + Date.now() + '-' + Math.random());
  clients.push(client);
  return client;
}

describe('reusable library migration', () => {
  it('creates account-scoped library tables and accepts every snapshot source', async () => {
    const client = createClient();
    await client.waitReady;
    expect(await applyMigrations(client)).toBe('6');
    const tables = await client.query<{ table_name: string }>(
      'SELECT table_name FROM information_schema.tables ' +
      'WHERE table_name IN (\'food_catalog_items\', \'recipes\', \'recipe_ingredients\', \'ready_meals\', \'ready_meal_items\') ' +
      'ORDER BY table_name',
    );
    expect(tables.rows.map((row) => row.table_name)).toEqual([
      'food_catalog_items',
      'ready_meal_items',
      'ready_meals',
      'recipe_ingredients',
      'recipes',
    ]);

    await client.query('INSERT INTO accounts (id, display_name, created_at, updated_at) VALUES (\'migration-account\', \'Fixture\', \'2026-09-01\', \'2026-09-01\')');
    await client.query('INSERT INTO patients (id, account_id, display_code, name, age, gender, height_cm, weight_kg, current_objective, target_protein, target_carbs, target_fats, target_kcal, created_at, updated_at, version) VALUES (\'migration-patient\', \'migration-account\', \'P-0001\', \'Paciente\', 30, \'F\', 170, 70, \'Manutenção\', 100, 200, 60, 1800, \'2026-09-01\', \'2026-09-01\', 1)');
    await client.query('INSERT INTO diet_plans (id, account_id, patient_id, name, mode, status, version, created_at, updated_at, activated_at) VALUES (\'migration-diet\', \'migration-account\', \'migration-patient\', \'Dieta\', \'SIMPLE\', \'ACTIVE\', 1, \'2026-09-01\', \'2026-09-01\', \'2026-09-01\')');
    await client.query('INSERT INTO diet_variations (id, diet_plan_id, account_id, patient_id, position, kind, name, input_mode, target_protein, target_carbs, target_fat, target_kcal) VALUES (\'migration-variation\', \'migration-diet\', \'migration-account\', \'migration-patient\', 0, \'SIMPLE\', \'Padrão\', \'GRAMS\', 100, 200, 60, 1800)');
    await client.query('INSERT INTO diet_meals (id, diet_plan_id, variation_id, account_id, patient_id, position, name) VALUES (\'migration-meal\', \'migration-diet\', \'migration-variation\', \'migration-account\', \'migration-patient\', 0, \'Café\')');
    await client.query('INSERT INTO diet_meal_options (id, diet_meal_id, position, label, counts_toward_totals) VALUES (\'migration-option\', \'migration-meal\', 0, \'Opção\', true)');
    await client.query('INSERT INTO diet_meal_items (id, diet_meal_option_id, position, role, name) VALUES (\'migration-item\', \'migration-option\', 0, \'PRIMARY\', \'Iogurte\')');

    for (const sourceType of ['SYSTEM_TACO', 'ACCOUNT_CUSTOM', 'RECIPE', 'READY_MEAL']) {
      await client.query(
        'INSERT INTO diet_item_snapshots (diet_meal_item_id, source_type, source_id, source_version, display_name, description, measurement_basis, food_state, reference_quantity, reference_unit, reference_protein, reference_carbs, reference_fat, reference_fiber, prescribed_quantity, prescribed_unit, prescribed_protein, prescribed_carbs, prescribed_fat, prescribed_fiber, energy_source, calculation_version, conversion_snapshot, composition_snapshot) ' +
        'VALUES ($1, $2, \'source\', \'1\', \'Item\', \'\', \'PER_100G\', \'AS_SOLD\', 100, \'g\', 1, 1, 1, 1, 10, \'g\', 0.1, 0.1, 0.1, 0.1, \'REFERENCE\', \'v1\', \'{}\'::jsonb, \'{}\'::jsonb)',
        ['migration-item', sourceType],
      );
      await client.query('DELETE FROM diet_item_snapshots WHERE diet_meal_item_id = $1', ['migration-item']);
    }
  });

  it('is idempotent and rolls back a failed follow-up migration', async () => {
    const client = createClient();
    await client.waitReady;
    await expect(applyMigrations(client)).resolves.toBe('6');
    await expect(applyMigrations(client)).resolves.toBe('6');
    await expect(applyMigrations(client, [
      ...migrationFiles,
      { id: 'library-failure', version: '6', sql: 'CREATE TABLE library_temporary_failure (id text); SELECT * FROM no_library_table;' },
    ])).rejects.toThrow();
    await expect(client.query('SELECT to_regclass(\'library_temporary_failure\') AS table_name')).resolves.toMatchObject({ rows: [{ table_name: null }] });
  });
});
