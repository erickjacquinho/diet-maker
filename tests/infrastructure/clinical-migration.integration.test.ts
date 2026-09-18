import { afterEach, describe, expect, it } from 'vitest';
import { createClinicalTestDatabase } from '../helpers/clinical-test-db';
import type { LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { applyMigrations, migrationFiles } from '@/lib/infrastructure/local-db/migrations';

let handle: LocalDatabaseHandle | undefined;

afterEach(async () => {
  await handle?.close();
  handle = undefined;
});

describe('clinical database migration', () => {
  it('upgrades the local schema to v9 while preserving earlier tables and data', async () => {
    handle = await createClinicalTestDatabase('clinical-migration');
    await handle.client.query(`
      INSERT INTO accounts (id, display_name, created_at, updated_at)
      VALUES ('migration-account', 'Conta', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z')
    `);
    await handle.client.query(`
      INSERT INTO patients (id, account_id, display_code, name, age, gender, height_cm, weight_kg, current_objective, target_protein, target_carbs, target_fats, target_kcal, created_at, updated_at, version)
      VALUES ('migration-patient', 'migration-account', 'P-0001', 'Paciente', 30, 'Feminino', 165, 62, 'Manutenção', 110, 200, 55, 1755, '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z', 1)
    `);

    expect(handle.schemaVersion).toBe('9');
    await expect(handle.client.query(`SELECT id, name FROM patients WHERE id = 'migration-patient'`)).resolves.toMatchObject({
      rows: [{ id: 'migration-patient', name: 'Paciente' }],
    });
    await expect(handle.client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('body_assessments', 'next_follow_ups')
      ORDER BY table_name
    `)).resolves.toMatchObject({ rows: [{ table_name: 'body_assessments' }, { table_name: 'next_follow_ups' }] });

    const journal = await handle.client.query<{ id: string; version: string }>(
      `SELECT id, version FROM __nutridiet_migrations ORDER BY version`,
    );
    expect(journal.rows.at(-1)).toEqual({ id: '0009_diet_history_summary_backfill', version: '9' });
    await expect(handle.client.query(`SELECT collname FROM pg_collation WHERE collname = 'nutridiet_pt_br_base'`))
      .resolves.toMatchObject({ rows: [{ collname: 'nutridiet_pt_br_base' }] });
  });

  it('is idempotent and exposes scope, cardinality and value checks', async () => {
    handle = await createClinicalTestDatabase('clinical-migration-idempotent');
    const before = await handle.client.query<{ count: string }>(`SELECT count(*)::text AS count FROM __nutridiet_migrations`);
    await applyMigrations(handle.client, migrationFiles);
    const after = await handle.client.query<{ count: string }>(`SELECT count(*)::text AS count FROM __nutridiet_migrations`);
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);

    const constraints = await handle.client.query<{ constraint_name: string }>(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name IN ('body_assessments', 'next_follow_ups')
    `);
    expect(constraints.rows.map((row) => row.constraint_name)).toEqual(expect.arrayContaining([
      'body_assessments_patient_scope_fk',
      'next_follow_ups_patient_scope_fk',
    ]));
  });
});
