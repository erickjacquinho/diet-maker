import 'server-only';

import { and, desc, eq, sql } from 'drizzle-orm';
import type { getOnlineDatabase } from './client';
import { getOnlineDatabase as onlineDatabase } from './client';
import { professionalProfiles, runtimeAuthSessions, saves } from './schema';

type OnlineTransaction = Parameters<Parameters<ReturnType<typeof getOnlineDatabase>['transaction']>[0]>[0];

export type SaveRegistryRecord = typeof saves.$inferSelect;
export type SaveRegistryInsert = typeof saves.$inferInsert;

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

export async function withOwnerTransaction<T>(
  ownerId: string,
  run: (transaction: OnlineTransaction) => Promise<T>,
): Promise<T> {
  assertUuid(ownerId);
  return onlineDatabase().transaction(async (transaction) => {
    await transaction.execute(sql`SELECT set_config('app.owner_id', ${ownerId}, true)`);
    return run(transaction);
  });
}

export async function bootstrapProfessionalProfile(input: {
  ownerId: string;
  profileCipher: Buffer;
  profileIv: Buffer;
  profileKekId: string;
}): Promise<boolean> {
  return withOwnerTransaction(input.ownerId, async (transaction) => {
    const inserted = await transaction.execute(sql`
      INSERT INTO private.professional_profiles (owner_id, profile_cipher, profile_iv, profile_kek_id)
      VALUES (${input.ownerId}, ${input.profileCipher}, ${input.profileIv}, ${input.profileKekId})
      ON CONFLICT (owner_id) DO NOTHING
      RETURNING owner_id
    `);

    return inserted.rows.length === 1;
  });
}

export async function getProfessionalProfile(ownerId: string) {
  return withOwnerTransaction(ownerId, async (transaction) => {
    const [profile] = await transaction
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.ownerId, ownerId))
      .limit(1);

    return profile ?? null;
  });
}

export async function updateProfessionalProfile(input: {
  ownerId: string;
  profileCipher: Buffer;
  profileIv: Buffer;
  profileKekId: string;
}): Promise<boolean> {
  return withOwnerTransaction(input.ownerId, async (transaction) => {
    const updated = await transaction.execute(sql`
      UPDATE private.professional_profiles
      SET profile_cipher = ${input.profileCipher}, profile_iv = ${input.profileIv}, profile_kek_id = ${input.profileKekId}
      WHERE owner_id = ${input.ownerId}
      RETURNING owner_id
    `);

    return updated.rows.length === 1;
  });
}

export async function updateSaveLabel(input: {
  ownerId: string;
  saveId: string;
  labelCipher: Buffer;
  labelIv: Buffer;
  labelKekId: string;
}): Promise<boolean> {
  assertUuid(input.saveId);
  return withOwnerTransaction(input.ownerId, async (transaction) => {
    const updated = await transaction.execute(sql`
      UPDATE private.saves
      SET label_cipher = ${input.labelCipher}, label_iv = ${input.labelIv}, label_kek_id = ${input.labelKekId}
      WHERE id = ${input.saveId} AND owner_id = ${input.ownerId}
      RETURNING id
    `);

    return updated.rows.length === 1;
  });
}

export async function findAuthSessionOwner(sessionId: string): Promise<string | null> {
  assertUuid(sessionId);
  const [session] = await onlineDatabase()
    .select({ userId: runtimeAuthSessions.userId })
    .from(runtimeAuthSessions)
    .where(eq(runtimeAuthSessions.id, sessionId))
    .limit(1);

  return session?.userId ?? null;
}

export async function registerSaveRecord(
  input: SaveRegistryInsert,
): Promise<{ record: SaveRegistryRecord; created: boolean } | null> {
  return withOwnerTransaction(input.ownerId, async (transaction) => {
    const findByIdempotencyKey = () => transaction
      .select()
      .from(saves)
      .where(and(eq(saves.ownerId, input.ownerId), eq(saves.idempotencyKey, input.idempotencyKey)))
      .limit(1);
    const findByLocalAccountId = () => transaction
      .select()
      .from(saves)
      .where(eq(saves.localAccountId, input.localAccountId))
      .limit(1);

    const [byIdempotencyKey] = await findByIdempotencyKey();
    if (byIdempotencyKey) return { record: byIdempotencyKey, created: false };

    const [byLocalAccountId] = await findByLocalAccountId();
    if (byLocalAccountId) return { record: byLocalAccountId, created: false };

    const { rows } = await transaction.execute(sql`
      INSERT INTO private.saves (
        id, owner_id, local_account_id, key_id, wrapped_key, wrap_iv, wrap_kek_id,
        binding_mac, binding_kek_id, label_cipher, label_iv, label_kek_id, idempotency_key
      ) VALUES (
        ${input.id}, ${input.ownerId}, ${input.localAccountId}, ${input.keyId}, ${input.wrappedKey},
        ${input.wrapIv}, ${input.wrapKekId}, ${input.bindingMac}, ${input.bindingKekId},
        ${input.labelCipher ?? null}, ${input.labelIv ?? null}, ${input.labelKekId ?? null}, ${input.idempotencyKey}
      )
      ON CONFLICT DO NOTHING
      RETURNING
        id, owner_id AS "ownerId", local_account_id AS "localAccountId", key_id AS "keyId",
        wrapped_key AS "wrappedKey", wrap_iv AS "wrapIv", wrap_kek_id AS "wrapKekId",
        binding_mac AS "bindingMac", binding_kek_id AS "bindingKekId",
        label_cipher AS "labelCipher", label_iv AS "labelIv", label_kek_id AS "labelKekId",
        idempotency_key AS "idempotencyKey", created_at AS "createdAt"
    `);
    const created = rows[0] as unknown as SaveRegistryRecord | undefined;
    if (created) return { record: created, created: true };

    const [idempotencyRace] = await findByIdempotencyKey();
    if (idempotencyRace) return { record: idempotencyRace, created: false };
    const [claimRace] = await findByLocalAccountId();
    return claimRace ? { record: claimRace, created: false } : null;
  });
}

export async function getSaveRecord(ownerId: string, saveId: string): Promise<SaveRegistryRecord | null> {
  assertUuid(saveId);
  return withOwnerTransaction(ownerId, async (transaction) => {
    const [record] = await transaction
      .select()
      .from(saves)
      .where(and(eq(saves.id, saveId), eq(saves.ownerId, ownerId)))
      .limit(1);
    return record ?? null;
  });
}

export interface SaveCatalogRecord {
  id: string;
  createdAt: Date;
  labelCipher: Buffer | null;
  labelIv: Buffer | null;
  labelKekId: string | null;
}

export async function getSaveCatalogPage(ownerId: string, pageIndex: number, pageSize = 50): Promise<{
  items: SaveCatalogRecord[];
  totalRows: number;
}> {
  if (!Number.isSafeInteger(pageIndex) || pageIndex < 0 || !Number.isSafeInteger(pageSize) || pageSize !== 50) {
    throw new TypeError('Save catalog pagination is invalid.');
  }
  const offset = pageIndex * pageSize;
  if (!Number.isSafeInteger(offset)) throw new TypeError('Save catalog pagination is invalid.');
  return withOwnerTransaction(ownerId, async (transaction) => {
    const [countRow] = await transaction
      .select({ totalRows: sql<number>`count(*)::integer` })
      .from(saves)
      .where(eq(saves.ownerId, ownerId));
    const items = await transaction
      .select({
        id: saves.id,
        createdAt: saves.createdAt,
        labelCipher: saves.labelCipher,
        labelIv: saves.labelIv,
        labelKekId: saves.labelKekId,
      })
      .from(saves)
      .where(eq(saves.ownerId, ownerId))
      .orderBy(desc(saves.createdAt), desc(saves.id))
      .limit(pageSize)
      .offset(offset);
    return { items, totalRows: Number(countRow?.totalRows ?? 0) };
  });
}

export async function consumeAuthRateLimit(
  bucketHash: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(bucketHash)) throw new TypeError('A valid rate-limit bucket is required.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100_000) throw new RangeError('The rate limit is invalid.');
  if (!Number.isInteger(windowSeconds) || windowSeconds < 1 || windowSeconds > 86_400) {
    throw new RangeError('The rate-limit window is invalid.');
  }

  return onlineDatabase().transaction(async (transaction) => {
    await transaction.execute(sql`
      WITH expired AS (
        SELECT ctid
        FROM private.auth_rate_limits
        WHERE expires_at <= clock_timestamp()
        ORDER BY expires_at
        LIMIT 100
      )
      DELETE FROM private.auth_rate_limits
      WHERE ctid IN (SELECT ctid FROM expired)
    `);

    const { rows } = await transaction.execute(sql`
      WITH bucket AS (
        SELECT to_timestamp(
          floor(extract(epoch FROM clock_timestamp()) / ${windowSeconds}) * ${windowSeconds}
        ) AS window_start
      )
      INSERT INTO private.auth_rate_limits AS current_bucket (
        bucket_hash, window_start, attempts, expires_at
      )
      SELECT
        ${bucketHash},
        bucket.window_start,
        1,
        bucket.window_start + make_interval(secs => ${windowSeconds})
      FROM bucket
      ON CONFLICT (bucket_hash, window_start) DO UPDATE
        SET attempts = LEAST(current_bucket.attempts + 1, ${limit + 1})
      RETURNING attempts, GREATEST(1, CEIL(EXTRACT(EPOCH FROM expires_at - clock_timestamp())))::integer AS retry_after_seconds
    `);
    const row = rows[0] as { attempts: number; retry_after_seconds: number } | undefined;
    if (!row) throw new Error('The rate-limit bucket was not recorded.');

    return {
      allowed: Number(row.attempts) <= limit,
      retryAfterSeconds: Number(row.retry_after_seconds),
    };
  });
}

function assertUuid(value: string): void {
  if (!uuidPattern.test(value)) throw new TypeError('A valid UUID is required for online database access.');
}
