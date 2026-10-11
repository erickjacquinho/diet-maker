export const PROTECTED_SAVE_APP_ID = 'nutridiet-local-pro' as const;
export const PROTECTED_SAVE_FORMAT_VERSION = 2 as const;
export const PROTECTED_SAVE_ALGORITHM = 'AES-256-GCM' as const;

export interface ProtectedSaveEnvelope {
  appId: typeof PROTECTED_SAVE_APP_ID;
  formatVersion: typeof PROTECTED_SAVE_FORMAT_VERSION;
  saveId: string;
  algorithm: typeof PROTECTED_SAVE_ALGORITHM;
  bindingProof: string;
  iv: string;
  ciphertext: string;
}

export interface ParsedBindingProof {
  verifierId: string;
  mac: string;
}

export interface ProtectedSaveGrant {
  ownerId: string;
  saveId: string;
  localAccountId: string;
  keyId: string;
  bindingProof: string;
  authorizedAt: number;
  expiresAt: number;
  key: CryptoKey;
}

export type ProtectedSaveErrorCode = 'INVALID_ENVELOPE' | 'IDENTITY_MISMATCH' | 'KEY_INVALID' | 'ENCRYPTION_FAILED' | 'DECRYPTION_FAILED';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const verifierIdPattern = /^[A-Za-z0-9._-]{1,80}$/;
const macPattern = /^[A-Za-z0-9_-]{43}$/;

export class ProtectedSaveError extends Error {
  constructor(readonly code: ProtectedSaveErrorCode) {
    super('O arquivo protegido não pôde ser validado.');
    this.name = 'ProtectedSaveError';
  }
}

export function encodeBindingProof(verifierId: string, mac: string): string {
  if (!verifierIdPattern.test(verifierId) || !macPattern.test(mac) || decodeBase64Url(mac)?.length !== 32) {
    throw new TypeError('A binding proof is invalid.');
  }
  return `v1:${verifierId}:${mac}`;
}

export function parseBindingProof(value: unknown): ParsedBindingProof | null {
  if (typeof value !== 'string') return null;
  const match = /^v1:([A-Za-z0-9._-]{1,80}):([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match || decodeBase64Url(match[2])?.length !== 32) return null;
  return { verifierId: match[1], mac: match[2] };
}

export function parseProtectedSaveEnvelope(value: unknown): ProtectedSaveEnvelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ProtectedSaveError('INVALID_ENVELOPE');
  const envelope = value as Record<string, unknown>;
  const expectedKeys = ['appId', 'formatVersion', 'saveId', 'algorithm', 'bindingProof', 'iv', 'ciphertext'];
  if (
    Object.keys(envelope).length !== expectedKeys.length
    || expectedKeys.some((key) => !Object.prototype.hasOwnProperty.call(envelope, key))
    || envelope.appId !== PROTECTED_SAVE_APP_ID
    || envelope.formatVersion !== PROTECTED_SAVE_FORMAT_VERSION
    || typeof envelope.saveId !== 'string'
    || !uuidPattern.test(envelope.saveId)
    || envelope.algorithm !== PROTECTED_SAVE_ALGORITHM
    || !parseBindingProof(envelope.bindingProof)
    || typeof envelope.iv !== 'string'
    || typeof envelope.ciphertext !== 'string'
  ) throw new ProtectedSaveError('INVALID_ENVELOPE');

  const iv = decodeBase64Url(envelope.iv);
  const ciphertext = decodeBase64Url(envelope.ciphertext);
  if (!iv || iv.length !== 12 || !ciphertext || ciphertext.length < 16) {
    throw new ProtectedSaveError('INVALID_ENVELOPE');
  }
  iv.fill(0);
  ciphertext.fill(0);
  return envelope as unknown as ProtectedSaveEnvelope;
}

export function protectedSaveAdditionalData(envelope: Pick<ProtectedSaveEnvelope, 'appId' | 'formatVersion' | 'saveId' | 'algorithm' | 'bindingProof'>): Uint8Array {
  return new TextEncoder().encode(JSON.stringify([
    envelope.appId,
    envelope.formatVersion,
    envelope.saveId,
    envelope.algorithm,
    envelope.bindingProof,
  ]));
}

export function encodeBase64Url(value: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < value.length; offset += 0x8000) {
    binary += String.fromCharCode(...value.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) return null;
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    if (encodeBase64Url(bytes) !== value) {
      bytes.fill(0);
      return null;
    }
    return bytes;
  } catch {
    return null;
  }
}

export function assertProtectedSaveGrant(grant: ProtectedSaveGrant): void {
  const algorithm = grant?.key?.algorithm as KeyAlgorithm & { length?: number } | undefined;
  if (
    !grant
    || !uuidPattern.test(grant.saveId)
    || !uuidPattern.test(grant.ownerId)
    || !uuidPattern.test(grant.keyId)
    || typeof grant.localAccountId !== 'string'
    || grant.localAccountId.trim().length === 0
    || !parseBindingProof(grant.bindingProof)
    || !Number.isSafeInteger(grant.authorizedAt)
    || !Number.isSafeInteger(grant.expiresAt)
    || !grant.key
    || grant.key.type !== 'secret'
    || grant.key.extractable
    || algorithm?.name !== 'AES-GCM'
    || algorithm.length !== 256
    || !grant.key.usages.includes('encrypt')
    || !grant.key.usages.includes('decrypt')
  ) throw new ProtectedSaveError('KEY_INVALID');
}
