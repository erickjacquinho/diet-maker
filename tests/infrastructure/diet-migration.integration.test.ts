// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { applyMigrations, migrationFiles } from '@/lib/infrastructure/local-db/migrations';

let clients: PGlite[] = [];

afterEach(async () => {
  await Promise.all(clients.map(async (client) => {
    if (!client.closed) await client.close();
  }));
  clients = [];
});

async function createClient(): Promise<PGlite> {
  const client = new PGlite('memory://diet-migration-test');
  clients.push(client);
  await client.waitReady;
  return client;
}

describe('diet relational migration', () => {
  it('upgrades a stage-2 database without changing existing account/patient rows', async () => {
    const client = await createClient();
    await applyMigrations(client, migrationFiles.slice(0, 1));
    await client.query(`INSERT INTO accounts (id, display_name, created_at, updated_at) VALUES ('account-a', 'Conta', '2026-08-30T10:00:00.000Z', '2026-08-30T10:00:00.000Z')`);
    await client.query(`INSERT INTO patients (id, account_id, display_code, name, age, gender, height_cm, weight_kg, current_objective, target_protein, target_carbs, target_fats, target_kcal, created_at, updated_at, version) VALUES ('patient-a', 'account-a', 'P-0001', 'Ana', 32, 'Feminino', 165, 64, 'Manutenção', 120, 180, 55, 1655, '2026-08-30T10:00:00.000Z', '2026-08-30T10:00:00.000Z', 1)`);

    expect(await applyMigrations(client)).toBe('9');
    await expect(client.query(`SELECT id, account_id, name, weight_kg FROM patients WHERE id = 'patient-a'`)).resolves.toMatchObject({ rows: [{ id: 'patient-a', account_id: 'account-a', name: 'Ana', weight_kg: 64 }] });
    await expect(client.query(`SELECT table_name FROM information_schema.tables WHERE table_name IN ('diet_plans', 'diet_variations', 'diet_variation_days', 'diet_meals', 'diet_meal_options', 'diet_meal_items', 'diet_item_snapshots') ORDER BY table_name`)).resolves.toMatchObject({ rows: [
      { table_name: 'diet_item_snapshots' }, { table_name: 'diet_meal_items' }, { table_name: 'diet_meal_options' }, { table_name: 'diet_meals' },
      { table_name: 'diet_plans' }, { table_name: 'diet_variation_days' }, { table_name: 'diet_variations' },
    ] });
  });

  it('backfills exact variation history totals when an existing local database reaches v9', async () => {
    const client = await createClient();
    await applyMigrations(client, migrationFiles.slice(0, -1));
    await client.query(`INSERT INTO accounts (id, display_name, created_at, updated_at) VALUES ('account-a', 'Conta', '2026-08-30', '2026-08-30')`);
    await client.query(`INSERT INTO patients (id, account_id, display_code, name, gender, created_at, updated_at, version) VALUES ('patient-a', 'account-a', 'P-0001', 'Ana', 'Feminino', '2026-08-30', '2026-08-30', 1)`);
    await client.query(`INSERT INTO diet_plans (id, account_id, patient_id, name, mode, status, version, created_at, updated_at, activated_at) VALUES ('diet-a', 'account-a', 'patient-a', 'Plano', 'SIMPLE', 'ACTIVE', 1, '2026-08-30', '2026-08-30', '2026-08-30')`);
    await client.query(`INSERT INTO diet_variations (id, diet_plan_id, account_id, patient_id, position, kind, name, input_mode, target_protein, target_carbs, target_fat, target_kcal) VALUES ('variation-a', 'diet-a', 'account-a', 'patient-a', 0, 'SIMPLE', 'Diário', 'GRAMS', 100, 180, 50, 1500)`);
    await client.query(`INSERT INTO diet_meals (id, diet_plan_id, variation_id, account_id, patient_id, position, name) VALUES ('meal-a', 'diet-a', 'variation-a', 'account-a', 'patient-a', 0, 'Almoço')`);
    await client.query(`INSERT INTO diet_meal_options (id, diet_meal_id, position, label, counts_toward_totals) VALUES ('option-a', 'meal-a', 0, 'Base', true)`);
    await client.query(`INSERT INTO diet_meal_items (id, diet_meal_option_id, position, role, name) VALUES ('item-a', 'option-a', 0, 'PRIMARY', 'Arroz')`);
    await client.query(`INSERT INTO diet_item_snapshots (diet_meal_item_id, source_type, source_id, source_version, display_name, description, measurement_basis, food_state, reference_quantity, reference_unit, reference_protein, reference_carbs, reference_fat, reference_fiber, prescribed_quantity, prescribed_unit, prescribed_protein, prescribed_carbs, prescribed_fat, prescribed_fiber, energy_source, calculation_version, conversion_snapshot, composition_snapshot) VALUES ('item-a', 'SYSTEM_TACO', 'taco-1', 'TACO-4', 'Arroz', '', 'PER_100G', 'COOKED', 100, 'g', 2.5, 28.1, 0.2, 1.6, 100, 'g', 2.5, 28.1, 0.2, 1.6, 'REFERENCE', 'v1', '{}'::jsonb, '{}'::jsonb)`);

    expect(await applyMigrations(client)).toBe('9');
    await expect(client.query(`SELECT prescribed_protein::text, prescribed_carbs::text, prescribed_fat::text, prescribed_energy_kcal::text FROM diet_variation_history_summaries WHERE diet_variation_id = 'variation-a'`)).resolves.toMatchObject({
      rows: [{ prescribed_protein: '2.5', prescribed_carbs: '28.1', prescribed_fat: '0.2', prescribed_energy_kcal: '124.2' }],
    });
  });

  it('uses numeric values, explicit checks, composite scope and one ACTIVE index', async () => {
    const client = await createClient();
    await applyMigrations(client);

    const numericColumns = await client.query<{ column_name: string }>(`SELECT column_name FROM information_schema.columns WHERE table_name = 'diet_plans' AND data_type = 'numeric' ORDER BY column_name`);
    expect(numericColumns.rows.map((row) => row.column_name)).toContain('weight_reference_kg');
    const indexes = await client.query<{ indexname: string }>(`SELECT indexname FROM pg_indexes WHERE tablename = 'diet_plans'`);
    expect(indexes.rows.map((row) => row.indexname)).toContain('diet_plans_one_active_idx');
    const constraints = await client.query<{ constraint_name: string }>(`SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'diet_plans'`);
    expect(constraints.rows.some((row) => row.constraint_name.includes('patient'))).toBe(true);
  });

  it('is idempotent and rolls back a failed subsequent migration', async () => {
    const client = await createClient();
    expect(await applyMigrations(client)).toBe('9');
    expect(await applyMigrations(client)).toBe('9');
    const failingMigration = { id: '9999_diet_test_failure', version: '6', sql: 'CREATE TABLE diet_temporary_failure (id text); SELECT * FROM table_that_does_not_exist;' };
    await expect(applyMigrations(client, [...migrationFiles, failingMigration])).rejects.toThrow();
    await expect(client.query(`SELECT to_regclass('diet_temporary_failure') AS table_name`)).resolves.toMatchObject({ rows: [{ table_name: null }] });
    await expect(client.query(`SELECT id FROM __nutridiet_migrations WHERE id = '9999_diet_test_failure'`)).resolves.toMatchObject({ rows: [] });
  });
});
