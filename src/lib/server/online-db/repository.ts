import 'server-only';

import { and, desc, eq, sql } from 'drizzle-orm';
import type { getOnlineDatabase } from './client';
import { getOnlineDatabase as onlineDatabase } from './client';
import { professionalProfiles, runtimeAuthSessions, saves } from './schema';

type OnlineTransaction = Parameters<Parameters<ReturnType<typeof getOnlineDatabase>['transaction']>[0]>[0];

export type SaveRegistryRecord = typeof saves.$inferSelect;

export const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

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

export async function findAuthSessionOwner(sessionId: string): Promise<string | null> {
  assertUuid(sessionId);
  const [session] = await onlineDatabase()
    .select({ userId: runtimeAuthSessions.userId })
    .from(runtimeAuthSessions)
    .where(eq(runtimeAuthSessions.id, sessionId))
    .limit(1);

  return session?.userId ?? null;
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
