import { sql } from 'drizzle-orm';
import {
  check,
  customType,
  index,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const privateSchema = pgSchema('private');
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => 'bytea' });

export const professionalProfiles = privateSchema.table('professional_profiles', {
  ownerId: uuid('owner_id').primaryKey(),
  profileCipher: bytea('profile_cipher').notNull(),
  profileIv: bytea('profile_iv').notNull(),
  profileKekId: text('profile_kek_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  check('professional_profiles_cipher_size', sql`octet_length(${table.profileCipher}) > 16`),
  check('professional_profiles_iv_size', sql`octet_length(${table.profileIv}) = 12`),
  check('professional_profiles_kek_id_nonempty', sql`length(${table.profileKekId}) > 0`),
]);

export const saves = privateSchema.table('saves', {
  id: uuid('id').primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => professionalProfiles.ownerId),
  localAccountId: text('local_account_id').notNull(),
  keyId: uuid('key_id').notNull(),
  wrappedKey: bytea('wrapped_key').notNull(),
  wrapIv: bytea('wrap_iv').notNull(),
  wrapKekId: text('wrap_kek_id').notNull(),
  bindingMac: bytea('binding_mac').notNull(),
  bindingKekId: text('binding_kek_id').notNull(),
  labelCipher: bytea('label_cipher'),
  labelIv: bytea('label_iv'),
  labelKekId: text('label_kek_id'),
  idempotencyKey: uuid('idempotency_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('saves_local_account_id_unique').on(table.localAccountId),
  uniqueIndex('saves_key_id_unique').on(table.keyId),
  uniqueIndex('saves_owner_idempotency_key_unique').on(table.ownerId, table.idempotencyKey),
  index('saves_owner_created_id_idx').on(table.ownerId, table.createdAt.desc(), table.id),
  check('saves_local_account_id_nonempty', sql`length(btrim(${table.localAccountId})) > 0`),
  check('saves_wrapped_key_size', sql`octet_length(${table.wrappedKey}) = 48`),
  check('saves_wrap_iv_size', sql`octet_length(${table.wrapIv}) = 12`),
  check('saves_wrap_kek_id_nonempty', sql`length(${table.wrapKekId}) > 0`),
  check('saves_binding_mac_size', sql`octet_length(${table.bindingMac}) = 32`),
  check('saves_binding_kek_id_nonempty', sql`length(${table.bindingKekId}) > 0`),
  check('saves_label_cipher_fields_consistent', sql`
    (${table.labelCipher} IS NULL AND ${table.labelIv} IS NULL AND ${table.labelKekId} IS NULL)
    OR (
      ${table.labelCipher} IS NOT NULL AND ${table.labelIv} IS NOT NULL AND ${table.labelKekId} IS NOT NULL
      AND octet_length(${table.labelCipher}) > 16 AND octet_length(${table.labelIv}) = 12 AND length(${table.labelKekId}) > 0
    )
  `),
]);

export const authRateLimits = privateSchema.table('auth_rate_limits', {
  bucketHash: text('bucket_hash').notNull(),
  windowStart: timestamp('window_start', { withTimezone: true, mode: 'date' }).notNull(),
  attempts: integer('attempts').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.bucketHash, table.windowStart] }),
  check('auth_rate_limits_bucket_hash_nonempty', sql`length(${table.bucketHash}) > 0`),
  check('auth_rate_limits_attempts_nonnegative', sql`${table.attempts} >= 0`),
  check('auth_rate_limits_expiry_after_window', sql`${table.expiresAt} > ${table.windowStart}`),
]);

export const runtimeAuthSessions = privateSchema.view('runtime_auth_sessions', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
}).existing();

export const onlineSchema = {
  professionalProfiles,
  saves,
  authRateLimits,
  runtimeAuthSessions,
};
