import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  createBindingProof,
  createSaveKey,
  decryptProfessionalProfile,
  encryptProfessionalProfile,
  unwrapSaveKey,
  verifyBindingProof,
  wrapSaveKey,
} from '../../src/lib/server/save-keys';

const testKek = Buffer.alloc(32, 0x42).toString('base64');

describe('server save keys', () => {
  beforeEach(() => {
    vi.stubEnv('SERVER_MASTER_KEY', testKek);
    vi.stubEnv('SERVER_MASTER_KEY_ID', 'test-v1');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('creates a random DEK and preserves it across wrapping retries', () => {
    const tuple = createTuple();
    const first = createSaveKey();
    const second = createSaveKey();

    expect(first.dek).toHaveLength(32);
    expect(first.keyId).not.toBe(second.keyId);
    expect(first.dek.equals(second.dek)).toBe(false);

    const persistedWrap = wrapSaveKey(first.dek, tuple);
    expect(persistedWrap.wrappedKey.includes(first.dek)).toBe(false);
    const retry = unwrapSaveKey(persistedWrap, tuple);
    expect(retry.equals(first.dek)).toBe(true);
    expect(unwrapSaveKey(persistedWrap, tuple).equals(retry)).toBe(true);
    expect(persistedWrap.wrapIv).toHaveLength(12);
    expect(persistedWrap.wrappedKey).toHaveLength(48);
  });

  it('rejects tuple mismatch, ciphertext tampering, and an unavailable KEK', () => {
    const tuple = createTuple();
    const key = createSaveKey();
    const wrapped = wrapSaveKey(key.dek, tuple);

    expect(() => unwrapSaveKey(wrapped, { ...tuple, saveId: randomUUID() })).toThrow();

    const tampered = Buffer.from(wrapped.wrappedKey);
    tampered[0] ^= 1;
    expect(() => unwrapSaveKey({ ...wrapped, wrappedKey: tampered }, tuple)).toThrow();

    vi.stubEnv('SERVER_MASTER_KEY', '');
    expect(() => unwrapSaveKey(wrapped, tuple)).toThrow(/SERVER_MASTER_KEY/);
  });

  it('creates a purpose-separated binding proof that only matches its tuple', () => {
    const tuple = createTuple();
    const proof = createBindingProof(tuple);

    expect(proof.mac).toHaveLength(32);
    expect(verifyBindingProof(tuple, proof.mac, proof.kekId)).toBe(true);
    expect(verifyBindingProof({ ...tuple, ownerId: randomUUID() }, proof.mac, proof.kekId)).toBe(false);

    const altered = Buffer.from(proof.mac);
    altered[0] ^= 1;
    expect(verifyBindingProof(tuple, altered, proof.kekId)).toBe(false);
  });

  it('encrypts the profile at rest and rejects wrong-owner or altered ciphertext', () => {
    const ownerId = randomUUID();
    const profile = {
      firstName: 'Dado confidencial',
      lastName: 'Sobrenome reservado',
      averagePatientsPerMonth: 27.5,
    };
    const encrypted = encryptProfessionalProfile(ownerId, profile);

    expect(encrypted.iv).toHaveLength(12);
    expect(encrypted.ciphertext.includes(Buffer.from(profile.firstName))).toBe(false);
    expect(encrypted.ciphertext.includes(Buffer.from(profile.lastName))).toBe(false);
    expect(decryptProfessionalProfile(ownerId, encrypted)).toEqual(profile);
    expect(() => decryptProfessionalProfile(randomUUID(), encrypted)).toThrow();

    const tampered = Buffer.from(encrypted.ciphertext);
    tampered[tampered.length - 1] ^= 1;
    expect(() => decryptProfessionalProfile(ownerId, { ...encrypted, ciphertext: tampered })).toThrow();
  });

  it('does not log key material or profile content', () => {
    const log = vi.spyOn(console, 'log');
    const info = vi.spyOn(console, 'info');
    const warn = vi.spyOn(console, 'warn');
    const error = vi.spyOn(console, 'error');
    const tuple = createTuple();
    const { dek } = createSaveKey();

    wrapSaveKey(dek, tuple);
    encryptProfessionalProfile(tuple.ownerId, { firstName: 'Segredo de teste' });

    expect(log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

function createTuple() {
  return {
    ownerId: randomUUID(),
    saveId: randomUUID(),
    localAccountId: `account-${randomUUID()}`,
    keyId: randomUUID(),
  };
}
