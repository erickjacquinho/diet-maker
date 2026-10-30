import 'server-only';

import { createDecipheriv, timingSafeEqual } from 'node:crypto';
import { BackupApplicationError, validateBackupEnvelope } from './legacy-save/backup-format';
import type { BackupEnvelope } from './legacy-save/logical-export-schema';
import {
  decodeBase64Url,
  parseBindingProof,
  parseProtectedSaveEnvelope,
  protectedSaveAdditionalData,
  ProtectedSaveError,
} from '@/lib/domain/protected-save';
import { getSaveRecord, type SaveRegistryRecord } from '../online-db/repository';
import { unwrapSaveKey, verifyBindingProof } from '../save-keys';
import { ApiError, NotFoundError } from '../api/api-errors';

export type NutridietFormat = 'nutridiet-v1-plaintext' | 'nutridiet-v2-protected';

export interface ReadNutridietOptions {
  ownerId: string;
  /** The user explicitly confirmed importing an unencrypted (legacy v1) file. */
  confirmPlaintext: boolean;
  loadSave?: (ownerId: string, saveId: string) => Promise<SaveRegistryRecord | null>;
}

const unprocessable = (reason: string) => new ApiError(422, 'UNPROCESSABLE', { reason });

function validate(value: unknown): BackupEnvelope {
  try {
    return validateBackupEnvelope(value);
  } catch (error) {
    if (error instanceof BackupApplicationError) throw unprocessable(error.code);
    throw error;
  }
}

/**
 * Turns the uploaded `.nutridiet` text into a validated logical envelope.
 * v2 files are decrypted here with the save key held by the server, so the browser needs no grant;
 * v1 files are plaintext and require explicit confirmation.
 */
export async function readNutridiet(
  text: string,
  options: ReadNutridietOptions,
): Promise<{ format: NutridietFormat; envelope: BackupEnvelope }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, 'INVALID_REQUEST');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw unprocessable('BACKUP_FORMAT_INVALID');

  if ((parsed as { formatVersion?: unknown }).formatVersion === 2) {
    return { format: 'nutridiet-v2-protected', envelope: validate(await decryptProtected(parsed, options)) };
  }
  if (!options.confirmPlaintext) throw unprocessable('CONFIRMATION_REQUIRED');
  return { format: 'nutridiet-v1-plaintext', envelope: validate(parsed) };
}

async function decryptProtected(value: unknown, options: ReadNutridietOptions): Promise<unknown> {
  let envelope;
  try {
    envelope = parseProtectedSaveEnvelope(value);
  } catch (error) {
    if (error instanceof ProtectedSaveError) throw unprocessable('INVALID_ENVELOPE');
    throw error;
  }
  const proof = parseBindingProof(envelope.bindingProof)!;
  const suppliedMac = decodeBase64Url(proof.mac);
  const record = await (options.loadSave ?? getSaveRecord)(options.ownerId, envelope.saveId);
  // The same 404 for a missing save, another owner's save and a wrong proof.
  if (!suppliedMac || !record || proof.verifierId !== record.bindingKekId || record.bindingMac.length !== 32
    || !timingSafeEqual(Buffer.from(suppliedMac), record.bindingMac)) {
    suppliedMac?.fill(0);
    throw new NotFoundError();
  }
  suppliedMac.fill(0);
  const tuple = { ownerId: options.ownerId, saveId: record.id, localAccountId: record.localAccountId, keyId: record.keyId };
  if (!verifyBindingProof(tuple, record.bindingMac, record.bindingKekId)) throw new NotFoundError();

  const dek = unwrapSaveKey({ wrappedKey: record.wrappedKey, wrapIv: record.wrapIv, wrapKekId: record.wrapKekId }, tuple);
  const iv = decodeBase64Url(envelope.iv);
  const sealed = decodeBase64Url(envelope.ciphertext);
  try {
    if (!iv || !sealed || sealed.length < 16) throw unprocessable('INVALID_ENVELOPE');
    const decipher = createDecipheriv('aes-256-gcm', dek, iv);
    decipher.setAAD(Buffer.from(protectedSaveAdditionalData(envelope)));
    decipher.setAuthTag(Buffer.from(sealed.subarray(sealed.length - 16)));
    const cleartext = Buffer.concat([decipher.update(sealed.subarray(0, sealed.length - 16)), decipher.final()]);
    try {
      return JSON.parse(cleartext.toString('utf8')) as unknown;
    } finally {
      cleartext.fill(0);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw unprocessable('DECRYPTION_FAILED');
  } finally {
    dek.fill(0);
    iv?.fill(0);
    sealed?.fill(0);
  }
}
