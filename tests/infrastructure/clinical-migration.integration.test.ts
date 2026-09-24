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
  it('upgrades the local schema to v11 while preserving earlier tables and data', async () => {
    handle = await createClinicalTestDatabase('clinical-migration');
    await handle.client.query(`
      INSERT INTO accounts (id, display_name, created_at, updated_at)
      VALUES ('migration-account', 'Conta', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z')
    `);
    await handle.client.query(`
      INSERT INTO patients (id, account_id, display_code, name, age, gender, height_cm, weight_kg, current_objective, target_protein, target_carbs, target_fats, target_kcal, created_at, updated_at, version)
      VALUES ('migration-patient', 'migration-account', 'P-0001', 'Paciente', 30, 'Feminino', 165, 62, 'Manutenção', 110, 200, 55, 1755, '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z', 1)
    `);
    await handle.client.query(`
      INSERT INTO next_follow_ups (account_id, patient_id, due_date, type, version, created_at, updated_at)
      VALUES ('migration-account', 'migration-patient', '2026-10-01', 'ASSESSMENT_UPDATE', 1, '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z')
    `);
    await handle.client.query(`ALTER TABLE next_follow_ups DROP COLUMN comments`);
    await handle.client.query(`DELETE FROM __nutridiet_migrations WHERE id IN ('0010_next_follow_up_comments', '0011_next_follow_up_multiple_types')`);
    await applyMigrations(handle.client, migrationFiles);

    expect(handle.schemaVersion).toBe('11');
    await expect(handle.client.query(`SELECT id, name FROM patients WHERE id = 'migration-patient'`)).resolves.toMatchObject({
      rows: [{ id: 'migration-patient', name: 'Paciente' }],
    });
    await expect(handle.client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('body_assessments', 'next_follow_ups')
      ORDER BY table_name
    `)).resolves.toMatchObject({ rows: [{ table_name: 'body_assessments' }, { table_name: 'next_follow_ups' }] });

    const journal = await handle.client.query<{ id: string; version: string }>(
      `SELECT id, version FROM __nutridiet_migrations ORDER BY version::integer`,
    );
    expect(journal.rows.at(-1)).toEqual({ id: '0011_next_follow_up_multiple_types', version: '11' });
    await expect(handle.client.query(`SELECT comments FROM next_follow_ups WHERE patient_id = 'migration-patient'`))
      .resolves.toMatchObject({ rows: [{ comments: '' }] });
    await expect(handle.client.query(`UPDATE next_follow_ups SET type = 'BOTH' WHERE patient_id = 'migration-patient'`))
      .resolves.toBeDefined();
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
