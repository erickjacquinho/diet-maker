import 'server-only';

import { sql } from 'drizzle-orm';
import type { KeyObject } from 'node:crypto';
import type { AccountTransaction } from '../online-db/accounts';
import { loadAccountKeyring } from './account-kek';
import {
  generateDek,
  openField,
  readFieldKeyVersion,
  rewrapDek,
  sealField,
  unwrapDek,
  wrapDek,
  type FieldContext,
  type FieldSchema,
  type WrappedDek,
} from './field-codec';

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 256;

interface Keyring {
  activeId: string;
  keys: ReadonlyMap<string, KeyObject>;
}

interface CacheEntry {
  dek: Buffer;
  expiresAt: number;
}

type AccountKeyRow = {
  key_version: number;
  wrapped_dek: Buffer;
  iv: Buffer;
  kek_id: string;
};

export interface FieldSealer {
  seal<T>(context: Omit<FieldContext, 'accountId'>, value: T): Promise<Buffer>;
  open<T>(context: Omit<FieldContext, 'accountId'>, blob: Buffer, schema: FieldSchema<T>): Promise<T>;
}

/** In-memory LRU of unwrapped DEKs; buffers are zeroed on eviction. The DEK never leaves the server. */
export class DekCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly now: () => number = Date.now) {}

  get(key: string): Buffer | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.delete(key);
      return undefined;
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.dek;
  }

  set(key: string, dek: Buffer): void {
    this.delete(key);
    this.entries.set(key, { dek: Buffer.from(dek), expiresAt: this.now() + CACHE_TTL_MS });
    while (this.entries.size > CACHE_MAX_ENTRIES) {
      this.delete(this.entries.keys().next().value as string);
    }
  }

  delete(key: string): void {
    this.entries.get(key)?.dek.fill(0);
    this.entries.delete(key);
  }

  clear(): void {
    for (const key of [...this.entries.keys()]) this.delete(key);
  }

  get size(): number {
    return this.entries.size;
  }
}

const sharedCache = new DekCache();

export function createAccountKeyService(
  options: { keyring?: () => Keyring; cache?: DekCache } = {},
) {
  const keyring = options.keyring ?? (() => loadAccountKeyring());
  const cache = options.cache ?? sharedCache;

  const kekFor = (ring: Keyring, kekId: string): KeyObject => {
    const kek = ring.keys.get(kekId.toLowerCase());
    if (!kek) throw new Error('The account key encryption key is unavailable.');
    return kek;
  };

  async function readRow(tx: AccountTransaction, accountId: string, keyVersion?: number): Promise<AccountKeyRow | undefined> {
    const { rows } = await tx.execute<AccountKeyRow>(
      keyVersion === undefined
        ? sql`SELECT key_version, wrapped_dek, iv, kek_id FROM private.account_keys
              WHERE account_id = ${accountId} AND retired_at IS NULL`
        : sql`SELECT key_version, wrapped_dek, iv, kek_id FROM private.account_keys
              WHERE account_id = ${accountId} AND key_version = ${keyVersion}`,
    );
    return rows[0];
  }

  function unwrapRow(accountId: string, row: AccountKeyRow): Buffer {
    const ring = keyring();
    return unwrapDek(kekFor(ring, row.kek_id), accountId, row.key_version, {
      wrappedDek: row.wrapped_dek, iv: row.iv, kekId: row.kek_id,
    });
  }

  async function getDek(tx: AccountTransaction, accountId: string, keyVersion: number): Promise<Buffer> {
    const cacheKey = `${accountId}:${keyVersion}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const row = await readRow(tx, accountId, keyVersion);
    if (!row) throw new Error('The account key is unavailable.');
    const dek = unwrapRow(accountId, row);
    cache.set(cacheKey, dek);
    dek.fill(0);
    return cache.get(cacheKey) as Buffer;
  }

  async function getActive(tx: AccountTransaction, accountId: string): Promise<{ dek: Buffer; keyVersion: number }> {
    let row = await readRow(tx, accountId);
    if (!row) {
      const ring = keyring();
      const dek = generateDek();
      const wrapped = wrapDek(kekFor(ring, ring.activeId), ring.activeId, accountId, 1, dek);
      dek.fill(0);
      await tx.execute(sql`
        INSERT INTO private.account_keys (account_id, key_version, wrapped_dek, iv, kek_id)
        VALUES (${accountId}, 1, ${wrapped.wrappedDek}, ${wrapped.iv}, ${wrapped.kekId})
        ON CONFLICT DO NOTHING`);
      row = await readRow(tx, accountId);
      if (!row) throw new Error('The account key could not be created.');
    }
    return { dek: await getDek(tx, accountId, row.key_version), keyVersion: row.key_version };
  }

  /** Re-wraps every non-retired DEK of the account under the active KEK; sealed fields are untouched. */
  async function rewrapAccountKeys(tx: AccountTransaction, accountId: string): Promise<number> {
    const ring = keyring();
    const { rows } = await tx.execute<AccountKeyRow>(sql`
      SELECT key_version, wrapped_dek, iv, kek_id FROM private.account_keys
      WHERE account_id = ${accountId} AND kek_id <> ${ring.activeId}`);
    for (const row of rows) {
      const current: WrappedDek = { wrappedDek: row.wrapped_dek, iv: row.iv, kekId: row.kek_id };
      const next = rewrapDek(
        kekFor(ring, row.kek_id), kekFor(ring, ring.activeId), ring.activeId, accountId, row.key_version, current,
      );
      await tx.execute(sql`
        UPDATE private.account_keys
        SET wrapped_dek = ${next.wrappedDek}, iv = ${next.iv}, kek_id = ${next.kekId}
        WHERE account_id = ${accountId} AND key_version = ${row.key_version}`);
    }
    return rows.length;
  }

  function createSealer(tx: AccountTransaction, accountId: string): FieldSealer {
    return {
      async seal(context, value) {
        const { dek, keyVersion } = await getActive(tx, accountId);
        return sealField(dek, keyVersion, { ...context, accountId }, value);
      },
      async open(context, blob, schema) {
        const dek = await getDek(tx, accountId, readFieldKeyVersion(blob));
        return openField(() => dek, { ...context, accountId }, blob, schema);
      },
    };
  }

  return { getActive, getDek, rewrapAccountKeys, createSealer };
}

export const accountKeys = createAccountKeyService();
