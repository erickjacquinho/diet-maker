import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const adminUrl = process.env.LOCAL_SUPABASE_DB_URL;
const runtimeUrl = process.env.ONLINE_DATABASE_URL;
const describeLocal = adminUrl && runtimeUrl ? describe : describe.skip;

describeLocal('online database repository', () => {
  let admin: Pool;
  const owners = [randomUUID(), randomUUID()];
  const sessionId = randomUUID();

  beforeAll(async () => {
    const adminConnection = new URL(adminUrl!);
    const runtimeConnection = new URL(runtimeUrl!);
    if (
      !['127.0.0.1', 'localhost', '::1'].includes(adminConnection.hostname)
      || adminConnection.port !== '54322'
      || !['127.0.0.1', 'localhost', '::1'].includes(runtimeConnection.hostname)
      || runtimeConnection.port !== '54322'
      || runtimeConnection.username !== 'online_runtime'
    ) {
      throw new Error('Online database integration tests must use the local restricted runtime role.');
    }

    admin = new Pool({ connectionString: adminUrl!, max: 1 });
    for (const ownerId of owners) {
      await admin.query(
        `INSERT INTO auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
         VALUES ($1, 'authenticated', 'authenticated', $2, '{}'::jsonb, '{}'::jsonb, now(), now())`,
        [ownerId, `${ownerId}@example.invalid`],
      );
    }
    await admin.query('INSERT INTO auth.sessions (id, user_id) VALUES ($1, $2)', [sessionId, owners[0]]);
  });

  afterAll(async () => {
    if (admin) {
      for (const ownerId of owners) {
        await admin.query('DELETE FROM private.saves WHERE owner_id = $1', [ownerId]);
        await admin.query('DELETE FROM private.professional_profiles WHERE owner_id = $1', [ownerId]);
        await admin.query('DELETE FROM auth.users WHERE id = $1', [ownerId]);
      }
      await admin.end();
    }
    const { closeOnlineDatabase } = await import('../../src/lib/server/online-db/client');
    await closeOnlineDatabase();
  });

  it('reuses one restricted connection without carrying the previous owner context', async () => {
    const { getOnlineDatabase } = await import('../../src/lib/server/online-db/client');
    const { professionalProfiles } = await import('../../src/lib/server/online-db/schema');
    const { bootstrapProfessionalProfile, withOwnerTransaction } = await import(
      '../../src/lib/server/online-db/repository'
    );

    const firstCipher = Buffer.alloc(32, 0x11);
    expect(await bootstrapProfessionalProfile({
      ownerId: owners[0],
      profileCipher: firstCipher,
      profileIv: Buffer.alloc(12, 0x21),
      profileKekId: 'integration-test-v1',
    })).toBe(true);
    expect(await bootstrapProfessionalProfile({
      ownerId: owners[0],
      profileCipher: Buffer.alloc(32, 0x12),
      profileIv: Buffer.alloc(12, 0x22),
      profileKekId: 'integration-test-v2',
    })).toBe(false);
    expect(await bootstrapProfessionalProfile({
      ownerId: owners[1],
      profileCipher: Buffer.alloc(32, 0x31),
      profileIv: Buffer.alloc(12, 0x41),
      profileKekId: 'integration-test-v1',
    })).toBe(true);

    const visibleProfiles = async (ownerId: string) => withOwnerTransaction(ownerId, async (tx) => {
      const pid = await tx.execute<{ pid: number }>(sql`SELECT pg_backend_pid() AS pid`);
      const rows = await tx.select({ ownerId: professionalProfiles.ownerId }).from(professionalProfiles);
      return { pid: pid.rows[0].pid, owners: rows.map(({ ownerId: visibleOwner }) => visibleOwner) };
    });
    const first = await visibleProfiles(owners[0]);
    const second = await visibleProfiles(owners[1]);
    const unscoped = await getOnlineDatabase()
      .select({ ownerId: professionalProfiles.ownerId })
      .from(professionalProfiles);

    expect(first.pid).toBe(second.pid);
    expect(first.owners).toEqual([owners[0]]);
    expect(second.owners).toEqual([owners[1]]);
    expect(unscoped).toEqual([]);

    const persisted = await withOwnerTransaction(owners[0], (tx) =>
      tx.select({ profileCipher: professionalProfiles.profileCipher }).from(professionalProfiles),
    );
    expect(persisted[0].profileCipher).toEqual(firstCipher);
  });

  it('reads only the authenticated session owner columns from auth.sessions', async () => {
    const { findAuthSessionOwner } = await import('../../src/lib/server/online-db/repository');
    expect(await findAuthSessionOwner(sessionId)).toBe(owners[0]);
  });
});
