import 'server-only';

import {
  createCipheriv,
  createDecipheriv,
  createSecretKey,
  randomBytes,
  type KeyObject,
} from 'node:crypto';

const FORMAT_VERSION = 0x01;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const HEADER_BYTES = 1 + 4;
const DEK_BYTES = 32;

export interface FieldContext {
  /** `<table>.<column>` */
  column: string;
  accountId: string;
  rowId: string;
}

export interface WrappedDek {
  wrappedDek: Buffer;
  iv: Buffer;
  kekId: string;
}

export interface FieldSchema<T> {
  parse(value: unknown): T;
}

function fieldAad(context: FieldContext, keyVersion: number): Buffer {
  return Buffer.from(`nutridiet:v1|${context.column}|${context.accountId}|${context.rowId}|${keyVersion}`, 'utf8');
}

function dekAad(accountId: string, keyVersion: number, kekId: string): Buffer {
  return Buffer.from(`nutridiet:dek:v1|${accountId}|${keyVersion}|${kekId}`, 'utf8');
}

export function generateDek(): Buffer {
  return randomBytes(DEK_BYTES);
}

/** Layout: 0x01 ‖ key_version (u32 BE) ‖ IV (12) ‖ ciphertext ‖ tag (16). */
export function sealField<T>(dek: Buffer, keyVersion: number, context: FieldContext, value: T): Buffer {
  const iv = randomBytes(IV_BYTES);
  const header = Buffer.alloc(HEADER_BYTES);
  header[0] = FORMAT_VERSION;
  header.writeUInt32BE(keyVersion, 1);
  const cipher = createCipheriv('aes-256-gcm', createSecretKey(dek), iv);
  cipher.setAAD(fieldAad(context, keyVersion));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([header, iv, ciphertext, cipher.getAuthTag()]);
}

export function readFieldKeyVersion(blob: Buffer): number {
  if (blob.length < HEADER_BYTES + IV_BYTES + TAG_BYTES || blob[0] !== FORMAT_VERSION) {
    throw new Error('The sealed field is malformed.');
  }
  return blob.readUInt32BE(1);
}

/** Authenticates against the row, column and account before parsing; fails closed with a generic error. */
export function openField<T>(
  dekForVersion: (keyVersion: number) => Buffer,
  context: FieldContext,
  blob: Buffer,
  schema: FieldSchema<T>,
): T {
  try {
    const keyVersion = readFieldKeyVersion(blob);
    const iv = blob.subarray(HEADER_BYTES, HEADER_BYTES + IV_BYTES);
    const tag = blob.subarray(blob.length - TAG_BYTES);
    const ciphertext = blob.subarray(HEADER_BYTES + IV_BYTES, blob.length - TAG_BYTES);
    const decipher = createDecipheriv('aes-256-gcm', createSecretKey(dekForVersion(keyVersion)), iv);
    decipher.setAAD(fieldAad(context, keyVersion));
    decipher.setAuthTag(tag);
    const clear = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return schema.parse(JSON.parse(clear.toString('utf8')));
  } catch {
    throw new Error('The sealed field could not be opened.');
  }
}

export function wrapDek(kek: KeyObject, kekId: string, accountId: string, keyVersion: number, dek: Buffer): WrappedDek {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', kek, iv);
  cipher.setAAD(dekAad(accountId, keyVersion, kekId));
  const wrapped = Buffer.concat([cipher.update(dek), cipher.final(), cipher.getAuthTag()]);
  return { wrappedDek: wrapped, iv, kekId };
}

export function unwrapDek(kek: KeyObject, accountId: string, keyVersion: number, row: WrappedDek): Buffer {
  try {
    const decipher = createDecipheriv('aes-256-gcm', kek, row.iv);
    decipher.setAAD(dekAad(accountId, keyVersion, row.kekId));
    decipher.setAuthTag(row.wrappedDek.subarray(DEK_BYTES));
    return Buffer.concat([decipher.update(row.wrappedDek.subarray(0, DEK_BYTES)), decipher.final()]);
  } catch {
    throw new Error('The account key could not be unwrapped.');
  }
}

/** Re-wraps a DEK under another KEK id without touching any sealed field. */
export function rewrapDek(
  oldKek: KeyObject,
  newKek: KeyObject,
  newKekId: string,
  accountId: string,
  keyVersion: number,
  row: WrappedDek,
): WrappedDek {
  const dek = unwrapDek(oldKek, accountId, keyVersion, row);
  try {
    return wrapDek(newKek, newKekId, accountId, keyVersion, dek);
  } finally {
    dek.fill(0);
  }
}
