import { randomUUID } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool, type PoolClient } from 'pg';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const adminUrl = process.env.LOCAL_SUPABASE_DB_URL;
const runtimeUrl = process.env.ONLINE_DATABASE_URL;
const describeLocal = adminUrl && runtimeUrl ? describe : describe.skip;
const localHosts = ['127.0.0.1', 'localhost', '::1'];

type Context = { accountId?: string; userId?: string };

function migrationSql(): string {
  const dir = join(process.cwd(), 'supabase', 'migrations');
  const file = readdirSync(dir).find((name) => name.endsWith('_backend_foundation.sql'));
  if (!file) throw new Error('The backend_foundation migration does not exist.');
  return readFileSync(join(dir, file), 'utf8');
}

function renameBlock(): string {
  const block = migrationSql().match(/DO\s+\$\$[\s\S]*?online_runtime[\s\S]*?\$\$\s*;/);
  if (!block) throw new Error('The rename DO block was not found in the migration.');
  return block[0];
}

describeLocal('backend foundation: database isolation', () => {
  let admin: Pool;
  let runtime: Pool;
  const [userA, userB, userC, userD] = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
  let accountA = '';
  let accountB = '';

  async function asRuntime<T>(context: Context, run: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await runtime.connect();
    try {
      await client.query('BEGIN');
      if (context.accountId !== undefined) await client.query("SELECT set_config('app.account_id', $1, true)", [context.accountId]);
      if (context.userId !== undefined) await client.query("SELECT set_config('app.user_id', $1, true)", [context.userId]);
      return await run(client);
    } finally {
      await client.query('ROLLBACK').catch(() => undefined);
      client.release();
    }
  }

  async function catalog<T extends Record<string, unknown>>(query: string, values: unknown[] = []): Promise<T[]> {
    return (await admin.query(query, values)).rows as T[];
  }

  beforeAll(async () => {
    const adminConnection = new URL(adminUrl!);
    const runtimeConnection = new URL(runtimeUrl!);
    if (
      !localHosts.includes(adminConnection.hostname)
      || adminConnection.port !== '54322'
      || !localHosts.includes(runtimeConnection.hostname)
      || runtimeConnection.port !== '54322'
      || runtimeConnection.username !== 'app_runtime'
    ) {
      throw new Error('Backend foundation tests must use the local restricted runtime role on localhost:54322.');
    }

    admin = new Pool({ connectionString: adminUrl!, max: 2 });
    runtime = new Pool({ connectionString: runtimeUrl!, max: 2 });
    for (const id of [userA, userB, userC, userD]) {
      await admin.query(
        `INSERT INTO auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
         VALUES ($1, 'authenticated', 'authenticated', $2, '{}'::jsonb, '{}'::jsonb, now(), now())`,
        [id, `${id}@example.invalid`],
      );
    }
    accountA = (await admin.query('INSERT INTO app.accounts (owner_user_id) VALUES ($1) RETURNING id', [userA])).rows[0].id;
    accountB = (await admin.query('INSERT INTO app.accounts (owner_user_id) VALUES ($1) RETURNING id', [userB])).rows[0].id;
  });

  afterAll(async () => {
    const { closeOnlineDatabase } = await import('../../src/lib/server/online-db/client');
    await closeOnlineDatabase();
    await runtime?.end();
    if (!admin) return;
    await admin.query('DELETE FROM app.accounts WHERE owner_user_id = ANY($1::uuid[])', [[userA, userB, userC, userD]]);
    await admin.query('DELETE FROM auth.users WHERE id = ANY($1::uuid[])', [[userA, userB, userC, userD]]);
    await admin.end();
  });

  describe('catalog invariants', () => {
    it('C1/C2: app_runtime has the restricted attributes and timeouts, and online_runtime is gone', async () => {
      const [role] = await catalog<{ rolcanlogin: boolean; rolinherit: boolean; rolbypassrls: boolean; rolsuper: boolean; rolconfig: string[] }>(
        "SELECT rolcanlogin, rolinherit, rolbypassrls, rolsuper, rolconfig FROM pg_roles WHERE rolname = 'app_runtime'",
      );
      expect(role).toMatchObject({ rolcanlogin: true, rolinherit: false, rolbypassrls: false, rolsuper: false });
      expect(role.rolconfig).toEqual(
        expect.arrayContaining(['statement_timeout=5s', 'idle_in_transaction_session_timeout=10s']),
      );
      expect(await catalog("SELECT 1 FROM pg_roles WHERE rolname = 'online_runtime'")).toHaveLength(0);
    });

    it('C3: app_runtime has no DELETE, TRUNCATE or REFERENCES on any app table', async () => {
      const rows = await catalog<{ relname: string; privilege: string }>(
        `SELECT c.relname, p.privilege
           FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'app'
           CROSS JOIN (VALUES ('DELETE'), ('TRUNCATE'), ('REFERENCES')) AS p(privilege)
          WHERE c.relkind = 'r' AND has_table_privilege('app_runtime', c.oid, p.privilege)`,
      );
      expect(rows).toEqual([]);
    });

    it('C4: no privilege reaches PUBLIC, anon or authenticated in app or private', async () => {
      const rows = await catalog<{ kind: string; name: string }>(
        `WITH objs AS (
           SELECT 'schema' AS kind, nspname::text AS name, nspacl AS acl FROM pg_namespace WHERE nspname IN ('app', 'private')
           UNION ALL
           SELECT 'relation', n.nspname || '.' || c.relname, c.relacl
             FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname IN ('app', 'private') AND c.relkind IN ('r', 'v', 'm', 'S', 'p', 'f')
           UNION ALL
           SELECT 'function', n.nspname || '.' || p.proname, p.proacl
             FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname IN ('app', 'private')
         )
         SELECT objs.kind, objs.name
           FROM objs
           CROSS JOIN LATERAL aclexplode(objs.acl) AS a
           LEFT JOIN pg_roles r ON r.oid = a.grantee
          WHERE a.grantee = 0 OR r.rolname IN ('anon', 'authenticated')
         UNION ALL
         SELECT kind, name FROM objs WHERE kind = 'function' AND acl IS NULL`,
      );
      expect(rows).toEqual([]);
    });

    it('C5: every app table has RLS enabled and forced', async () => {
      const rows = await catalog<{ relname: string }>(
        `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'app'
          WHERE c.relkind = 'r' AND NOT (c.relrowsecurity AND c.relforcerowsecurity)`,
      );
      expect(rows).toEqual([]);
      expect(await catalog("SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'app' WHERE c.relname = 'accounts'")).toHaveLength(1);
    });

    it('C6: no SECURITY DEFINER function, and current_account_id pins an empty search_path', async () => {
      expect(
        await catalog(
          `SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname IN ('app', 'private') AND p.prosecdef`,
        ),
      ).toEqual([]);
      const [fn] = await catalog<{ proconfig: string[] | null }>(
        `SELECT p.proconfig FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'app' AND p.proname = 'current_account_id'`,
      );
      expect(fn?.proconfig).toContain('search_path=""');
    });

    it('C7: the owner foreign key is RESTRICT', async () => {
      const [fk] = await catalog<{ confdeltype: string }>(
        `SELECT confdeltype FROM pg_constraint
          WHERE conrelid = 'app.accounts'::regclass AND contype = 'f' AND confrelid = 'auth.users'::regclass`,
      );
      expect(fk?.confdeltype).toBe('r');
    });

    it('C8: the app schema is owned by postgres', async () => {
      const [schema] = await catalog<{ owner: string }>(
        "SELECT pg_get_userbyid(nspowner) AS owner FROM pg_namespace WHERE nspname = 'app'",
      );
      expect(schema?.owner).toBe('postgres');
    });

    it('C9: every app policy targets only app_runtime and every table has a policy', async () => {
      const policies = await catalog<{ roles: string[] }>("SELECT roles::text[] AS roles FROM pg_policies WHERE schemaname = 'app'");
      expect(policies.length).toBeGreaterThan(0);
      for (const policy of policies) expect(policy.roles).toEqual(['app_runtime']);
      const bare = await catalog<{ relname: string }>(
        `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'app'
          WHERE c.relkind = 'r' AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname = 'app' AND p.tablename = c.relname)`,
      );
      expect(bare).toEqual([]);
    });
  });

  describe('behavior matrix', () => {
    it('M1: no context sees no rows', async () => {
      const rows = await asRuntime({}, async (c) => (await c.query('SELECT id FROM app.accounts')).rows);
      expect(rows).toHaveLength(0);
    });

    it('M2: the user context sees only that user account', async () => {
      const rows = await asRuntime({ userId: userA }, async (c) => (await c.query('SELECT id, owner_user_id FROM app.accounts')).rows);
      expect(rows).toEqual([{ id: accountA, owner_user_id: userA }]);
    });

    it('M3: creating an account twice is idempotent', async () => {
      const ids = await asRuntime({ userId: userD }, async (c) => {
        const insert = 'INSERT INTO app.accounts (owner_user_id) VALUES ($1) ON CONFLICT (owner_user_id) DO NOTHING';
        await c.query(insert, [userD]);
        const first = (await c.query('SELECT id FROM app.accounts WHERE owner_user_id = $1', [userD])).rows;
        await c.query(insert, [userD]);
        const second = (await c.query('SELECT id FROM app.accounts WHERE owner_user_id = $1', [userD])).rows;
        return { first, second };
      });
      expect(ids.first).toHaveLength(1);
      expect(ids.second).toEqual(ids.first);
    });

    it('M4: the user context cannot create an account for another user', async () => {
      await expect(
        asRuntime({ userId: userA }, (c) => c.query('INSERT INTO app.accounts (owner_user_id) VALUES ($1)', [userB])),
      ).rejects.toThrow(/row-level security/i);
    });

    it('M5: the account context sees only that account', async () => {
      const rows = await asRuntime({ accountId: accountA }, async (c) => (await c.query('SELECT id FROM app.accounts')).rows);
      expect(rows).toEqual([{ id: accountA }]);
    });

    it('M6: the account context cannot create accounts', async () => {
      await expect(
        asRuntime({ accountId: accountA }, (c) => c.query('INSERT INTO app.accounts (owner_user_id) VALUES ($1)', [userC])),
      ).rejects.toThrow(/row-level security/i);
    });

    it('M6a: the id column cannot be written by the runtime', async () => {
      await expect(
        asRuntime({ userId: userC }, (c) =>
          c.query('INSERT INTO app.accounts (id, owner_user_id) VALUES ($1, $2)', [randomUUID(), userC]),
        ),
      ).rejects.toThrow(/permission denied/i);
    });

    it.each(['UPDATE app.accounts SET created_at = now()', 'DELETE FROM app.accounts'])('M7: %s is denied', async (statement) => {
      await expect(asRuntime({ accountId: accountA }, (c) => c.query(statement))).rejects.toThrow(/permission denied/i);
    });

    it('M8: a non-UUID account id fails closed', async () => {
      await expect(asRuntime({ accountId: 'x' }, (c) => c.query('SELECT id FROM app.accounts'))).rejects.toThrow(
        /invalid input syntax for type uuid/i,
      );
    });

    it('M9: an empty account id sees no rows', async () => {
      const rows = await asRuntime({ accountId: '' }, async (c) => (await c.query('SELECT id FROM app.accounts')).rows);
      expect(rows).toHaveLength(0);
    });

    it('M10: both contexts together see both accounts in accounts only (documented limit)', async () => {
      const rows = await asRuntime(
        { accountId: accountA, userId: userB },
        async (c) => (await c.query('SELECT id FROM app.accounts ORDER BY id')).rows,
      );
      expect(rows.map((row) => row.id).sort()).toEqual([accountA, accountB].sort());
    });

    it('M11: deleting a user that owns an account is refused', async () => {
      await expect(admin.query('DELETE FROM auth.users WHERE id = $1', [userA])).rejects.toThrow(/foreign key/i);
      expect(await catalog('SELECT 1 FROM app.accounts WHERE owner_user_id = $1', [userA])).toHaveLength(1);
    });

    it.each(['anon', 'authenticated'])('M12: %s cannot reach app or private', async (role) => {
      for (const table of ['app.accounts', 'private.saves']) {
        const client = await admin.connect();
        try {
          await client.query('BEGIN');
          await client.query(`SET LOCAL ROLE ${role}`);
          await expect(client.query(`SELECT * FROM ${table}`)).rejects.toThrow(/permission denied for schema/i);
        } finally {
          await client.query('ROLLBACK').catch(() => undefined);
          client.release();
        }
      }
    });

    it('M13: reapplying the migration is a no-op', async () => {
      const before = (await admin.query('SELECT count(*)::int AS n FROM pg_policies WHERE schemaname = \'app\'')).rows[0].n;
      await admin.query(migrationSql());
      const after = (await admin.query('SELECT count(*)::int AS n FROM pg_policies WHERE schemaname = \'app\'')).rows[0].n;
      expect(after).toBe(before);
      expect(await catalog('SELECT 1 FROM app.accounts WHERE owner_user_id = $1', [userA])).toHaveLength(1);
    });

    it('M14: the rename block refuses the two invalid role states and leaves state unchanged', async () => {
      const block = renameBlock();
      const attempt = async (prepare: string) => {
        const client = await admin.connect();
        try {
          await client.query('BEGIN');
          await client.query(prepare);
          await expect(client.query(block)).rejects.toThrow(/online_runtime|app_runtime/);
        } finally {
          await client.query('ROLLBACK').catch(() => undefined);
          client.release();
        }
      };
      await attempt('CREATE ROLE online_runtime');
      await attempt('ALTER ROLE app_runtime RENAME TO app_runtime_tmp');
      expect(await catalog("SELECT 1 FROM pg_roles WHERE rolname = 'app_runtime'")).toHaveLength(1);
      expect(await catalog("SELECT 1 FROM pg_roles WHERE rolname = 'online_runtime'")).toHaveLength(0);
    });

  describe('accounts module', () => {
    async function modules() {
      const accounts = await import('../../src/lib/server/online-db/accounts');
      const { getOnlineDatabase } = await import('../../src/lib/server/online-db/client');
      return { ...accounts, getOnlineDatabase };
    }

    it('does not leak the account context to the next transaction on the same connection', async () => {
      const { withAccountTransaction, getOnlineDatabase } = await modules();
      const within = await withAccountTransaction(accountA, async (tx) => (await tx.execute(sql`SELECT id FROM app.accounts`)).rows);
      expect(within).toEqual([{ id: accountA }]);
      const without = await getOnlineDatabase().transaction(async (tx) => (await tx.execute(sql`SELECT id FROM app.accounts`)).rows);
      expect(without).toEqual([]);
    });

    it('rolls back on error and leaves no residual context', async () => {
      const { withAccountTransaction, getOnlineDatabase } = await modules();
      await expect(
        withAccountTransaction(accountA, async () => {
          throw new Error('abort');
        }),
      ).rejects.toThrow('abort');
      const [setting] = await getOnlineDatabase().transaction(
        async (tx) => (await tx.execute(sql`SELECT current_setting('app.account_id', true) AS value`)).rows,
      );
      expect([null, '']).toContain((setting as { value: string | null }).value);
    });

    it('resolves the same account for the same user and different accounts for different users', async () => {
      const { resolveOrCreateAccount } = await modules();
      const first = await resolveOrCreateAccount(userA);
      const second = await resolveOrCreateAccount(userA);
      const other = await resolveOrCreateAccount(userB);
      expect(first).toEqual({ id: accountA, ownerUserId: userA });
      expect(second).toEqual(first);
      expect(other.id).toBe(accountB);
      expect(other.id).not.toBe(first.id);
    });

    it('creates the account on first resolution', async () => {
      const { resolveOrCreateAccount } = await modules();
      const created = await resolveOrCreateAccount(userC);
      expect(created.ownerUserId).toBe(userC);
      expect(await catalog('SELECT 1 FROM app.accounts WHERE id = $1', [created.id])).toHaveLength(1);
    });

    it('propagates the foreign key error for an unknown user', async () => {
      const { resolveOrCreateAccount } = await modules();
      // Drizzle wraps driver errors in DrizzleQueryError and keeps the Postgres error as the cause.
      const failure = await resolveOrCreateAccount(randomUUID()).catch((error: Error & { cause?: Error }) => error);
      expect(failure).toBeInstanceOf(Error);
      expect((failure as Error & { cause?: Error }).cause?.message).toMatch(/foreign key/i);
    });
  });
  });
});
