import 'server-only';

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';

const keyBytes = 32;
const ivBytes = 12;
const tagBytes = 16;
const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

export interface SaveKeyTuple {
  ownerId: string;
  saveId: string;
  localAccountId: string;
  keyId: string;
}

export interface WrappedSaveKey {
  wrappedKey: Buffer;
  wrapIv: Buffer;
  wrapKekId: string;
}

export interface EncryptedProfile {
  ciphertext: Buffer;
  iv: Buffer;
  kekId: string;
}

export interface EncryptedServerValue {
  ciphertext: Buffer;
  iv: Buffer;
  kekId: string;
}

export function encryptServerValue(
  purpose: string,
  context: readonly string[],
  cleartext: Buffer,
): EncryptedServerValue {
  assertServerValueContext(purpose, context);
  const kek = getMasterKey();
  const iv = randomBytes(ivBytes);
  try {
    return {
      ciphertext: encrypt(kek.bytes, iv, cleartext, serverValueAad(purpose, kek.id, context)),
      iv,
      kekId: kek.id,
    };
  } finally {
    kek.bytes.fill(0);
  }
}

export function decryptServerValue(
  encrypted: EncryptedServerValue,
  purpose: string,
  context: readonly string[],
): Buffer {
  assertServerValueContext(purpose, context);
  if (!Buffer.isBuffer(encrypted.iv) || !Buffer.isBuffer(encrypted.ciphertext) || encrypted.iv.length !== ivBytes) {
    throw new TypeError('The encrypted value is invalid.');
  }
  const kek = getMasterKey(encrypted.kekId);
  try {
    return decrypt(
      kek.bytes,
      encrypted.iv,
      encrypted.ciphertext,
      serverValueAad(purpose, kek.id, context),
    );
  } finally {
    kek.bytes.fill(0);
  }
}

export function createSaveKey(): { keyId: string; dek: Buffer } {
  return { keyId: randomUUID(), dek: randomBytes(keyBytes) };
}

export function wrapSaveKey(dek: Buffer, tuple: SaveKeyTuple): WrappedSaveKey {
  assertTuple(tuple);
  if (dek.length !== keyBytes) throw new TypeError('A save key must contain 32 bytes.');

  const encrypted = encryptServerValue('save-key-wrap', tupleContext(tuple), dek);
  return { wrappedKey: encrypted.ciphertext, wrapIv: encrypted.iv, wrapKekId: encrypted.kekId };
}

export function unwrapSaveKey(wrapped: WrappedSaveKey, tuple: SaveKeyTuple): Buffer {
  assertTuple(tuple);
  if (wrapped.wrapIv.length !== ivBytes || wrapped.wrappedKey.length !== keyBytes + tagBytes) {
    throw new TypeError('The wrapped save key is invalid.');
  }

  const dek = decryptServerValue({
    ciphertext: wrapped.wrappedKey,
    iv: wrapped.wrapIv,
    kekId: wrapped.wrapKekId,
  }, 'save-key-wrap', tupleContext(tuple));
  if (dek.length !== keyBytes) {
    dek.fill(0);
    throw new Error('The wrapped save key is invalid.');
  }
  return dek;
}

export function createBindingProof(tuple: SaveKeyTuple): { mac: Buffer; kekId: string } {
  assertTuple(tuple);
  const kek = getMasterKey();
  const proofKey = Buffer.from(hkdfSync(
    'sha256',
    kek.bytes,
    Buffer.alloc(0),
    Buffer.from('diet-maker:binding-proof:v1'),
    keyBytes,
  ));

  try {
    const mac = createHmac('sha256', proofKey)
      .update(tupleAad('save-binding-proof', kek.id, tuple))
      .digest();
    return { mac, kekId: kek.id };
  } finally {
    proofKey.fill(0);
    kek.bytes.fill(0);
  }
}

export function verifyBindingProof(tuple: SaveKeyTuple, mac: Buffer, kekId: string): boolean {
  assertTuple(tuple);
  if (mac.length !== keyBytes) return false;

  const expected = createBindingProof(tuple);
  try {
    return kekId === expected.kekId && timingSafeEqual(expected.mac, mac);
  } finally {
    expected.mac.fill(0);
  }
}

export function createRateLimitBucketHash(endpoint: string, identityType: string, identifier: string): string {
  if (!/^[a-z\d-]{1,48}$/.test(endpoint) || !/^[a-z\d-]{1,16}$/.test(identityType)) {
    throw new TypeError('A valid rate-limit scope is required.');
  }
  if (typeof identifier !== 'string' || identifier.length === 0 || identifier.length > 512) {
    throw new TypeError('A valid rate-limit identifier is required.');
  }

  const kek = getMasterKey();
  const hashKey = Buffer.from(hkdfSync(
    'sha256',
    kek.bytes,
    Buffer.alloc(0),
    Buffer.from(`diet-maker:rate-limit:v1:${kek.id}`),
    keyBytes,
  ));
  try {
    return createHmac('sha256', hashKey)
      .update(JSON.stringify(['diet-maker-rate-limit-v1', endpoint, identityType, identifier]))
      .digest('base64url');
  } finally {
    hashKey.fill(0);
    kek.bytes.fill(0);
  }
}

export function encryptProfessionalProfile(
  ownerId: string,
  profile: object,
): EncryptedProfile {
  assertUuid(ownerId, 'ownerId');
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    throw new TypeError('A professional profile object is required.');
  }

  const serialized = JSON.stringify(profile);
  if (!serialized) throw new TypeError('The professional profile could not be serialized.');

  return encryptServerValue('professional-profile', [ownerId], Buffer.from(serialized, 'utf8'));
}

export function decryptProfessionalProfile<T = unknown>(
  ownerId: string,
  encrypted: EncryptedProfile,
): T {
  assertUuid(ownerId, 'ownerId');
  const cleartext = decryptServerValue(encrypted, 'professional-profile', [ownerId]);
  try {
    return JSON.parse(cleartext.toString('utf8')) as T;
  } catch {
    throw new Error('The encrypted profile is invalid.');
  } finally {
    cleartext.fill(0);
  }
}

function getMasterKey(expectedId?: string): { bytes: Buffer; id: string } {
  // shortcut: one active KEK only; add an ID-to-key registry before rotating server keys.
  const encoded = process.env.SERVER_MASTER_KEY;
  const id = process.env.SERVER_MASTER_KEY_ID;
  if (!encoded) throw new Error('SERVER_MASTER_KEY is required.');
  if (!id || !/^[\da-zA-Z._-]{1,80}$/.test(id)) throw new Error('SERVER_MASTER_KEY_ID is required.');
  if (!/^[A-Za-z0-9+/]{43}=$/.test(encoded)) {
    throw new Error('SERVER_MASTER_KEY must be a base64-encoded 32-byte key.');
  }

  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length !== keyBytes || bytes.toString('base64') !== encoded) {
    bytes.fill(0);
    throw new Error('SERVER_MASTER_KEY must be a base64-encoded 32-byte key.');
  }
  if (expectedId && expectedId !== id) {
    bytes.fill(0);
    throw new Error('The required server master key is unavailable.');
  }
  return { bytes, id };
}

function encrypt(key: Buffer, iv: Buffer, cleartext: Buffer, aad: Buffer): Buffer {
  const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: tagBytes });
  cipher.setAAD(aad);
  return Buffer.concat([cipher.update(cleartext), cipher.final(), cipher.getAuthTag()]);
}

function decrypt(key: Buffer, iv: Buffer, ciphertext: Buffer, aad: Buffer): Buffer {
  if (iv.length !== ivBytes || ciphertext.length < tagBytes) {
    throw new TypeError('The encrypted value is invalid.');
  }
  const decipher = createDecipheriv('aes-256-gcm', key, iv, { authTagLength: tagBytes });
  decipher.setAAD(aad);
  decipher.setAuthTag(ciphertext.subarray(-tagBytes));
  try {
    return Buffer.concat([decipher.update(ciphertext.subarray(0, -tagBytes)), decipher.final()]);
  } catch {
    throw new Error('The encrypted value could not be authenticated.');
  }
}

function tupleAad(purpose: string, kekId: string, tuple: SaveKeyTuple): Buffer {
  return Buffer.from(JSON.stringify([
    'diet-maker',
    purpose,
    1,
    kekId,
    tuple.ownerId,
    tuple.saveId,
    tuple.localAccountId,
    tuple.keyId,
  ]));
}

function tupleContext(tuple: SaveKeyTuple): string[] {
  return [tuple.ownerId, tuple.saveId, tuple.localAccountId, tuple.keyId];
}

function serverValueAad(purpose: string, kekId: string, context: readonly string[]): Buffer {
  return Buffer.from(JSON.stringify(['diet-maker', purpose, 1, kekId, ...context]));
}

function assertServerValueContext(purpose: string, context: readonly string[]): void {
  if (!/^[a-z\d-]{1,48}$/.test(purpose) || !Array.isArray(context) || context.some((part) => typeof part !== 'string')) {
    throw new TypeError('A valid server encryption purpose is required.');
  }
}

function assertTuple(tuple: SaveKeyTuple): void {
  assertUuid(tuple.ownerId, 'ownerId');
  assertUuid(tuple.saveId, 'saveId');
  assertUuid(tuple.keyId, 'keyId');
  if (typeof tuple.localAccountId !== 'string' || tuple.localAccountId.trim().length === 0) {
    throw new TypeError('A local account identifier is required.');
  }
}

function assertUuid(value: string, field: string): void {
  if (!uuidPattern.test(value)) throw new TypeError(`${field} must be a UUID.`);
}
