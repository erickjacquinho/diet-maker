import { createSecretKey, randomBytes } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  generateDek, openField, readFieldKeyVersion, rewrapDek, sealField, unwrapDek, wrapDek,
} from '../../src/lib/server/crypto/field-codec';
import { DekCache } from '../../src/lib/server/crypto/account-keys';

const accountA = '11111111-1111-4111-8111-111111111111';
const accountB = '22222222-2222-4222-8222-222222222222';
const rowA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const rowB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const schema = { parse: (value: unknown) => value as { name: string } };
const ctx = { column: 'patients.sensitive', accountId: accountA, rowId: rowA };

describe('sealed field codec', () => {
  it('round-trips and carries the layout version and key version', () => {
    const dek = generateDek();
    const blob = sealField(dek, 3, ctx, { name: 'Maria' });
    expect(blob[0]).toBe(0x01);
    expect(readFieldKeyVersion(blob)).toBe(3);
    expect(blob.toString('utf8')).not.toContain('Maria');
    expect(openField(() => dek, ctx, blob, schema)).toEqual({ name: 'Maria' });
  });

  it('uses a fresh IV per seal', () => {
    const dek = generateDek();
    expect(sealField(dek, 1, ctx, { name: 'x' }).equals(sealField(dek, 1, ctx, { name: 'x' }))).toBe(false);
  });

  it('fails when the ciphertext is tampered with', () => {
    const dek = generateDek();
    const blob = sealField(dek, 1, ctx, { name: 'Maria' });
    for (const index of [0, 2, 10, blob.length - 1]) {
      const copy = Buffer.from(blob);
      copy[index] ^= 0x01;
      expect(() => openField(() => dek, ctx, copy, schema)).toThrow('could not be opened');
    }
  });

  it('fails when the blob is moved to another row, column or account', () => {
    const dek = generateDek();
    const blob = sealField(dek, 1, ctx, { name: 'Maria' });
    expect(() => openField(() => dek, { ...ctx, rowId: rowB }, blob, schema)).toThrow();
    expect(() => openField(() => dek, { ...ctx, column: 'patients.other' }, blob, schema)).toThrow();
    expect(() => openField(() => dek, { ...ctx, accountId: accountB }, blob, schema)).toThrow();
  });

  it('fails closed when the decrypted payload violates the schema', () => {
    const dek = generateDek();
    const strict = { parse: () => { throw new Error('shape'); } };
    expect(() => openField(() => dek, ctx, sealField(dek, 1, ctx, { name: 'x' }), strict)).toThrow('could not be opened');
  });
});

describe('DEK wrapping and KEK rotation', () => {
  const kek1 = createSecretKey(randomBytes(32));
  const kek2 = createSecretKey(randomBytes(32));

  it('rewrap preserves readability of existing ciphertext', () => {
    const dek = generateDek();
    const blob = sealField(dek, 1, ctx, { name: 'Maria' });
    const wrapped = wrapDek(kek1, 'v1', accountA, 1, dek);
    const rewrapped = rewrapDek(kek1, kek2, 'v2', accountA, 1, wrapped);
    expect(rewrapped.kekId).toBe('v2');
    const recovered = unwrapDek(kek2, accountA, 1, rewrapped);
    expect(openField(() => recovered, ctx, blob, schema)).toEqual({ name: 'Maria' });
    expect(() => unwrapDek(kek1, accountA, 1, rewrapped)).toThrow();
  });

  it('refuses to unwrap for another account or key version', () => {
    const wrapped = wrapDek(kek1, 'v1', accountA, 1, generateDek());
    expect(() => unwrapDek(kek1, accountB, 1, wrapped)).toThrow();
    expect(() => unwrapDek(kek1, accountA, 2, wrapped)).toThrow();
  });

  it('produces a 48-byte wrapped DEK matching the table constraint', () => {
    const wrapped = wrapDek(kek1, 'v1', accountA, 1, generateDek());
    expect(wrapped.wrappedDek.length).toBe(48);
    expect(wrapped.iv.length).toBe(12);
  });
});

describe('DekCache', () => {
  it('expires entries after the TTL and zeroes evicted buffers', () => {
    let now = 0;
    const cache = new DekCache(() => now);
    cache.set('k', Buffer.alloc(32, 7));
    const held = cache.get('k') as Buffer;
    expect(held[0]).toBe(7);
    now = 5 * 60 * 1000 + 1;
    expect(cache.get('k')).toBeUndefined();
    expect(held.every((byte) => byte === 0)).toBe(true);
    expect(cache.size).toBe(0);
  });

  it('evicts the least recently used entry beyond capacity', () => {
    const cache = new DekCache(() => 0);
    for (let i = 0; i < 257; i += 1) cache.set(`k${i}`, Buffer.alloc(32, 1));
    expect(cache.size).toBe(256);
    expect(cache.get('k0')).toBeUndefined();
    expect(cache.get('k256')).toBeDefined();
  });
});
