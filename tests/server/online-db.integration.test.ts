import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.LOCAL_SUPABASE_DB_URL;
const describeLocal = databaseUrl ? describe : describe.skip;

describeLocal('Supabase local private database access', () => {
  let admin: Pool;
  const owners = [randomUUID(), randomUUID()];

  beforeAll(async () => {
    const url = new URL(databaseUrl!);
    if (!['127.0.0.1', 'localhost', '::1'].includes(url.hostname) || url.port !== '54322') {
      throw new Error('LOCAL_SUPABASE_DB_URL must target the disposable Supabase database on localhost:54322.');
    }

    admin = new Pool({ connectionString: databaseUrl!, max: 4 });
    await admin.query('GRANT online_runtime TO postgres');
    for (const ownerId of owners) {
      await admin.query(
        `INSERT INTO auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
         VALUES ($1, 'authenticated', 'authenticated', $2, '{}'::jsonb, '{}'::jsonb, now(), now())`,
        [ownerId, `${ownerId}@example.invalid`],
      );
      await admin.query(
        `INSERT INTO private.professional_profiles (owner_id, profile_cipher, profile_iv, profile_kek_id)
         VALUES ($1, decode(repeat('ab', 32), 'hex'), decode(repeat('cd', 12), 'hex'), 'integration-test')`,
        [ownerId],
      );
    }
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.query('REVOKE online_runtime FROM postgres');
    for (const ownerId of owners) {
      await admin.query('DELETE FROM private.saves WHERE owner_id = $1', [ownerId]);
      await admin.query('DELETE FROM private.professional_profiles WHERE owner_id = $1', [ownerId]);
      await admin.query('DELETE FROM auth.users WHERE id = $1', [ownerId]);
    }
    await admin.end();
  });

  it('keeps browser roles out and gives a non-owner runtime role only the required grants', async () => {
    const roles = await admin.query<{
      rolname: string;
      rolcanlogin: boolean;
      rolinherit: boolean;
      rolsuper: boolean;
      rolbypassrls: boolean;
    }>(`
      SELECT rolname, rolcanlogin, rolinherit, rolsuper, rolbypassrls
      FROM pg_roles
      WHERE rolname = 'online_runtime'
    `);
    expect(roles.rows).toHaveLength(1);
    expect(roles.rows[0]).toMatchObject({
      rolname: 'online_runtime',
      rolcanlogin: true,
      rolinherit: false,
      rolsuper: false,
      rolbypassrls: false,
    });

    const { rows: [privileges] } = await admin.query<{
      owner: string;
      anon_schema: boolean;
      authenticated_schema: boolean;
      runtime_auth_schema: boolean;
      runtime_auth_session_view_read: boolean;
      anon_profiles: boolean;
      authenticated_saves: boolean;
      runtime_profile_read: boolean;
      runtime_profile_insert: boolean;
      runtime_profile_update: boolean;
      runtime_profile_delete: boolean;
      runtime_save_read: boolean;
      runtime_save_insert: boolean;
      runtime_save_update: boolean;
      runtime_save_delete: boolean;
      anon_rate_limits: boolean;
      authenticated_rate_limits: boolean;
      runtime_rate_limit_read: boolean;
      runtime_rate_limit_insert: boolean;
      runtime_rate_limit_update: boolean;
      runtime_rate_limit_delete: boolean;
      session_id_read: boolean;
      session_owner_read: boolean;
      session_ip_read: boolean;
    }>(`
      SELECT
        pg_get_userbyid(c.relowner) AS owner,
        has_schema_privilege('anon', 'private', 'USAGE') AS anon_schema,
        has_schema_privilege('authenticated', 'private', 'USAGE') AS authenticated_schema,
        has_schema_privilege('online_runtime', 'auth', 'USAGE') AS runtime_auth_schema,
        has_table_privilege('online_runtime', 'private.runtime_auth_sessions', 'SELECT') AS runtime_auth_session_view_read,
        has_table_privilege('anon', 'private.professional_profiles', 'SELECT') AS anon_profiles,
        has_table_privilege('authenticated', 'private.saves', 'INSERT') AS authenticated_saves,
        has_table_privilege('online_runtime', 'private.professional_profiles', 'SELECT') AS runtime_profile_read,
        has_column_privilege('online_runtime', 'private.professional_profiles', 'owner_id', 'INSERT') AS runtime_profile_insert,
        has_table_privilege('online_runtime', 'private.professional_profiles', 'UPDATE') AS runtime_profile_update,
        has_table_privilege('online_runtime', 'private.professional_profiles', 'DELETE') AS runtime_profile_delete,
        has_table_privilege('online_runtime', 'private.saves', 'SELECT') AS runtime_save_read,
        has_column_privilege('online_runtime', 'private.saves', 'id', 'INSERT') AS runtime_save_insert,
        has_table_privilege('online_runtime', 'private.saves', 'UPDATE') AS runtime_save_update,
        has_table_privilege('online_runtime', 'private.saves', 'DELETE') AS runtime_save_delete,
        has_table_privilege('anon', 'private.auth_rate_limits', 'SELECT') AS anon_rate_limits,
        has_table_privilege('authenticated', 'private.auth_rate_limits', 'INSERT') AS authenticated_rate_limits,
        has_table_privilege('online_runtime', 'private.auth_rate_limits', 'SELECT') AS runtime_rate_limit_read,
        has_table_privilege('online_runtime', 'private.auth_rate_limits', 'INSERT') AS runtime_rate_limit_insert,
        has_table_privilege('online_runtime', 'private.auth_rate_limits', 'UPDATE') AS runtime_rate_limit_update,
        has_table_privilege('online_runtime', 'private.auth_rate_limits', 'DELETE') AS runtime_rate_limit_delete,
        has_column_privilege('online_runtime', 'auth.sessions', 'id', 'SELECT') AS session_id_read,
        has_column_privilege('online_runtime', 'auth.sessions', 'user_id', 'SELECT') AS session_owner_read,
        has_column_privilege('online_runtime', 'auth.sessions', 'ip', 'SELECT') AS session_ip_read
      FROM pg_class c
      WHERE c.oid = 'private.professional_profiles'::regclass
    `);
    expect(privileges).toMatchObject({
      owner: 'postgres',
      anon_schema: false,
      authenticated_schema: false,
      runtime_auth_schema: false,
      runtime_auth_session_view_read: true,
      anon_profiles: false,
      authenticated_saves: false,
      runtime_profile_read: true,
      runtime_profile_insert: true,
      runtime_profile_update: false,
      runtime_profile_delete: false,
      runtime_save_read: true,
      runtime_save_insert: true,
      runtime_save_update: false,
      runtime_save_delete: false,
      anon_rate_limits: false,
      authenticated_rate_limits: false,
      runtime_rate_limit_read: true,
      runtime_rate_limit_insert: true,
      runtime_rate_limit_update: true,
      runtime_rate_limit_delete: true,
      session_id_read: false,
      session_owner_read: false,
      session_ip_read: false,
    });
    expect(privileges.owner).not.toBe('online_runtime');

    const clinicalColumns = await admin.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'private'
        AND column_name ~* '(patient|diet|recipe|meal|snapshot|note|draft|clinical)'
    `);
    expect(clinicalColumns.rows).toEqual([]);
  });

  it('requires a transaction owner and rejects rows claimed by another owner', async () => {
    const withoutOwner = await asRuntime(admin, null, (client) =>
      client.query('SELECT owner_id FROM private.professional_profiles'),
    );
    expect(withoutOwner.rows).toEqual([]);

    const ownRows = await asRuntime(admin, owners[0], (client) =>
      client.query('SELECT owner_id FROM private.professional_profiles'),
    );
    expect(ownRows.rows.map(({ owner_id }) => owner_id)).toEqual([owners[0]]);

    await expect(
      asRuntime(admin, owners[0], (client) => insertSave(client, owners[1], `forged-${randomUUID()}`)),
    ).rejects.toThrow(/row-level security/i);
  });

  it('arbitrates a concurrent first claim with one global local-account owner', async () => {
    const localAccountId = `claim-${randomUUID()}`;
    const results = await Promise.allSettled(
      owners.map((ownerId) =>
        asRuntime(admin, ownerId, (client) => insertSave(client, ownerId, localAccountId)),
      ),
    );

    const failures = results.reduce<string[]>((messages, result) => {
      if (result.status === 'rejected') messages.push(String(result.reason?.message ?? result.reason));
      return messages;
    }, []);
    expect(results.filter((result) => result.status === 'fulfilled').length, failures.join('; ')).toBe(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });
});

async function asRuntime<T>(
  pool: Pool,
  ownerId: string | null,
  run: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE online_runtime');
    if (ownerId) await client.query("SELECT set_config('app.owner_id', $1, true)", [ownerId]);
    const result = await run(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function insertSave(client: PoolClient, ownerId: string, localAccountId: string) {
  return client.query(
    `INSERT INTO private.saves (
      id, owner_id, local_account_id, key_id, wrapped_key, wrap_iv, wrap_kek_id,
      binding_mac, binding_kek_id, idempotency_key
    ) VALUES (
      $1, $2, $3, $4, decode(repeat('ab', 48), 'hex'), decode(repeat('cd', 12), 'hex'),
      'integration-test', decode(repeat('ef', 32), 'hex'), 'integration-test', $5
    ) RETURNING id`,
    [randomUUID(), ownerId, localAccountId, randomUUID(), randomUUID()],
  );
}
