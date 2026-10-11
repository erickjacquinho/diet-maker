// @vitest-environment node

import { randomBytes, randomUUID } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BackupApplicationError, validateBackupEnvelope } from '@/lib/application/backup-application';
import {
  PROTECTED_SAVE_ALGORITHM,
  PROTECTED_SAVE_APP_ID,
  PROTECTED_SAVE_FORMAT_VERSION,
  encodeBindingProof,
  parseProtectedSaveEnvelope,
  type ProtectedSaveGrant,
} from '@/lib/domain/protected-save';
import { decryptProtectedSave, encryptProtectedSave } from '@/lib/infrastructure/crypto/protected-save';
import { createBackupEnvelope } from '../fixtures/backup';

const saveId = randomUUID();
const localAccountId = 'local-account';
const bindingProof = encodeBindingProof('test-verifier-v1', Buffer.alloc(32, 0x45).toString('base64url'));

async function createGrant(overrides: Partial<ProtectedSaveGrant> = {}): Promise<ProtectedSaveGrant> {
  let key = overrides.key;
  if (!key) {
    const keyBytes = randomBytes(32);
    key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    keyBytes.fill(0);
  }
  return {
    ownerId: randomUUID(),
    saveId,
    localAccountId,
    keyId: randomUUID(),
    bindingProof,
    authorizedAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    key,
    ...overrides,
  };
}

function encode(value: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < value.length; offset += 0x8000) {
    binary += String.fromCharCode(...value.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function canonicalAad(header: { appId: string; formatVersion: number; saveId: string; algorithm: string; bindingProof: string }) {
  return new TextEncoder().encode(JSON.stringify([
    header.appId,
    header.formatVersion,
    header.saveId,
    header.algorithm,
    header.bindingProof,
  ]));
}

describe('protected .nutridiet codec', () => {
  afterEach(() => vi.restoreAllMocks());

  it('round-trips every schema-11 collection without clear clinical data or key material in the file', async () => {
    const source = validateBackupEnvelope(createBackupEnvelope({ favorites: ['favorite-food'], agendaReminders: [] }), {
      accountId: localAccountId,
    });
    const keyMaterial = randomBytes(32);
    const keyFingerprint = encode(keyMaterial);
    const key = await crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const grant = await createGrant({ key });
    const serialized = await encryptProtectedSave(source, grant);
    keyMaterial.fill(0);
    const outer = parseProtectedSaveEnvelope(JSON.parse(serialized));
    const restored = await decryptProtectedSave(serialized, grant);

    expect(source.schemaVersion).toBe('11');
    expect(restored).toEqual(source);
    expect(outer).toMatchObject({
      appId: PROTECTED_SAVE_APP_ID,
      formatVersion: PROTECTED_SAVE_FORMAT_VERSION,
      saveId,
      algorithm: PROTECTED_SAVE_ALGORITHM,
      bindingProof,
    });
    expect(Object.keys(outer).sort()).toEqual(['algorithm', 'appId', 'bindingProof', 'ciphertext', 'formatVersion', 'iv', 'saveId'].sort());
    expect(outer.iv).toMatch(/^[A-Za-z0-9_-]{16}$/);
    expect(outer.ciphertext.length).toBeGreaterThan(24);
    expect(serialized).not.toContain(source.account[0].displayName);
    expect(serialized).not.toContain(source.patients[0].name);
    expect(serialized).not.toContain(localAccountId);
    expect(serialized).not.toContain(keyFingerprint);
    expect(serialized).not.toMatch(/ownerId|wrappedKey|patient|phone|drafts/i);
  });

  it('uses a fresh 12-byte IV for every encryption', async () => {
    const grant = await createGrant();
    const source = validateBackupEnvelope(createBackupEnvelope(), { accountId: localAccountId });
    const first = parseProtectedSaveEnvelope(JSON.parse(await encryptProtectedSave(source, grant)));
    const second = parseProtectedSaveEnvelope(JSON.parse(await encryptProtectedSave(source, grant)));

    expect(first.iv).not.toBe(second.iv);
    expect(await decryptProtectedSave(JSON.stringify(first), grant)).toEqual(source);
    expect(await decryptProtectedSave(JSON.stringify(second), grant)).toEqual(source);
  });

  it('rejects malformed, extended, or unsupported headers before decryption', async () => {
    const grant = await createGrant();
    const source = validateBackupEnvelope(createBackupEnvelope(), { accountId: localAccountId });
    const serialized = await encryptProtectedSave(source, grant);
    const envelope = JSON.parse(serialized) as Record<string, unknown>;
    const decrypt = vi.spyOn(crypto.subtle, 'decrypt');

    await expect(decryptProtectedSave(JSON.stringify({ ...envelope, formatVersion: 99 }), grant)).rejects.toThrow();
    await expect(decryptProtectedSave(JSON.stringify({ ...envelope, ownerId: randomUUID() }), grant)).rejects.toThrow();
    await expect(decryptProtectedSave(JSON.stringify({ ...envelope, algorithm: 'AES-CBC' }), grant)).rejects.toThrow();
    await expect(decryptProtectedSave(JSON.stringify({ ...envelope, ciphertext: 'not-base64url!' }), grant)).rejects.toThrow();
    expect(decrypt).not.toHaveBeenCalled();
  });

  it('rejects header identity and GCM tag/IV/ciphertext changes before a caller can import data', async () => {
    const grant = await createGrant();
    const source = validateBackupEnvelope(createBackupEnvelope(), { accountId: localAccountId });
    const envelope = JSON.parse(await encryptProtectedSave(source, grant)) as Record<string, unknown>;
    const ciphertext = decode(String(envelope.ciphertext));
    const iv = decode(String(envelope.iv));
    const changedCiphertext = Uint8Array.from(ciphertext);
    changedCiphertext[0] ^= 1;
    const changedIv = Uint8Array.from(iv);
    changedIv[0] ^= 1;
    const importSnapshot = vi.fn();

    const cases = [
      { ...envelope, saveId: randomUUID() },
      { ...envelope, bindingProof: encodeBindingProof('test-verifier-v1', Buffer.alloc(32, 0x46).toString('base64url')) },
      { ...envelope, ciphertext: encode(changedCiphertext) },
      { ...envelope, iv: encode(changedIv) },
    ];
    for (const changed of cases) {
      await expect(decryptProtectedSave(JSON.stringify(changed), grant)).rejects.toThrow();
    }
    expect(importSnapshot).not.toHaveBeenCalled();
  });

  it('validates the clinical Account against the authorized tuple before returning a payload', async () => {
    const grant = await createGrant();
    const source = validateBackupEnvelope(createBackupEnvelope(), { accountId: localAccountId });
    const serialized = await encryptProtectedSave(source, grant);

    await expect(decryptProtectedSave(serialized, { ...grant, localAccountId: 'another-account' }))
      .rejects.toMatchObject({ name: 'BackupApplicationError', code: 'BACKUP_APP_MISMATCH' });
  });

  it('refuses unknown clinical schema versions before a restored snapshot is returned', async () => {
    const grant = await createGrant();
    const source = { ...createBackupEnvelope(), schemaVersion: '99' };
    const header = {
      appId: PROTECTED_SAVE_APP_ID,
      formatVersion: PROTECTED_SAVE_FORMAT_VERSION,
      saveId: grant.saveId,
      algorithm: PROTECTED_SAVE_ALGORITHM,
      bindingProof: grant.bindingProof,
    };
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(source));
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv,
      additionalData: canonicalAad(header),
      tagLength: 128,
    }, grant.key, plaintext));
    plaintext.fill(0);
    const serialized = JSON.stringify({ ...header, iv: encode(iv), ciphertext: encode(ciphertext) });
    const importSnapshot = vi.fn();

    await expect(decryptProtectedSave(serialized, grant)).rejects.toMatchObject({
      name: 'BackupApplicationError',
      code: 'BACKUP_VERSION_UNSUPPORTED',
    });
    expect(importSnapshot).not.toHaveBeenCalled();
  });

  it('rejects extractable or non-AES-256 keys', async () => {
    const keyMaterial = randomBytes(32);
    const exportable = await crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
    keyMaterial.fill(0);
    const grant = await createGrant({ key: exportable });
    const source = validateBackupEnvelope(createBackupEnvelope(), { accountId: localAccountId });

    await expect(encryptProtectedSave(source, grant)).rejects.toThrow();
  });
});
