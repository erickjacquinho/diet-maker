import { BackupApplicationError, validateBackupEnvelope } from './backup-format';
import type { BackupEnvelope } from './logical-export-schema';
import {
  assertProtectedSaveGrant,
  decodeBase64Url,
  encodeBase64Url,
  parseProtectedSaveEnvelope,
  protectedSaveAdditionalData,
  PROTECTED_SAVE_ALGORITHM,
  PROTECTED_SAVE_APP_ID,
  PROTECTED_SAVE_FORMAT_VERSION,
  ProtectedSaveError,
  type ProtectedSaveEnvelope,
  type ProtectedSaveGrant,
} from '@/lib/domain/protected-save';

const ivLength = 12;
const tagLength = 128;

export async function encryptProtectedSave(payload: unknown, grant: ProtectedSaveGrant): Promise<string> {
  assertProtectedSaveGrant(grant);
  const normalized = validateBackupEnvelope(payload, { accountId: grant.localAccountId });
  const header = {
    appId: PROTECTED_SAVE_APP_ID,
    formatVersion: PROTECTED_SAVE_FORMAT_VERSION,
    saveId: grant.saveId,
    algorithm: PROTECTED_SAVE_ALGORITHM,
    bindingProof: grant.bindingProof,
  } satisfies Pick<ProtectedSaveEnvelope, 'appId' | 'formatVersion' | 'saveId' | 'algorithm' | 'bindingProof'>;
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const plaintext = new TextEncoder().encode(JSON.stringify(normalized));
  let encrypted: Uint8Array | undefined;
  try {
    encrypted = new Uint8Array(await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv,
      additionalData: protectedSaveAdditionalData(header),
      tagLength,
    }, grant.key, plaintext));
    return JSON.stringify({ ...header, iv: encodeBase64Url(iv), ciphertext: encodeBase64Url(encrypted) });
  } catch {
    throw new ProtectedSaveError('ENCRYPTION_FAILED');
  } finally {
    plaintext.fill(0);
    encrypted?.fill(0);
  }
}

export async function decryptProtectedSave(serialized: string, grant: ProtectedSaveGrant): Promise<BackupEnvelope> {
  assertProtectedSaveGrant(grant);
  let raw: unknown;
  try {
    if (typeof serialized !== 'string' || serialized.trim() === '') throw new Error();
    raw = JSON.parse(serialized) as unknown;
  } catch {
    throw new ProtectedSaveError('INVALID_ENVELOPE');
  }

  const envelope = parseProtectedSaveEnvelope(raw);
  if (envelope.saveId !== grant.saveId || envelope.bindingProof !== grant.bindingProof) {
    throw new ProtectedSaveError('IDENTITY_MISMATCH');
  }
  const iv = decodeBase64Url(envelope.iv);
  const ciphertext = decodeBase64Url(envelope.ciphertext);
  if (!iv || iv.length !== ivLength || !ciphertext || ciphertext.length < tagLength / 8) {
    iv?.fill(0);
    ciphertext?.fill(0);
    throw new ProtectedSaveError('INVALID_ENVELOPE');
  }

  let cleartext: Uint8Array;
  try {
    cleartext = new Uint8Array(await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv,
      additionalData: protectedSaveAdditionalData(envelope),
      tagLength,
    }, grant.key, ciphertext));
  } catch {
    iv.fill(0);
    ciphertext.fill(0);
    throw new ProtectedSaveError('DECRYPTION_FAILED');
  }
  iv.fill(0);
  ciphertext.fill(0);

  try {
    let payload: unknown;
    try {
      payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(cleartext)) as unknown;
    } catch {
      throw new ProtectedSaveError('INVALID_ENVELOPE');
    }
    return validateBackupEnvelope(payload, { accountId: grant.localAccountId });
  } catch (error) {
    if (error instanceof ProtectedSaveError || error instanceof BackupApplicationError) throw error;
    throw new ProtectedSaveError('INVALID_ENVELOPE');
  } finally {
    cleartext.fill(0);
  }
}
