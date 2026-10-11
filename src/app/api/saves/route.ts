import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  parseJsonBody,
  redactedErrorResponse,
  RequestSecurityError,
} from '@/lib/server/request-security';
import { validateProfileRequestSession, applyAuthResponseState, type ProfileRequestSessionResult } from '@/lib/server/auth/session';
import { decryptServerValue, createBindingProof, createSaveKey, encryptServerValue, verifyBindingProof, wrapSaveKey } from '@/lib/server/save-keys';
import { getSaveCatalogPage, registerSaveRecord } from '@/lib/server/online-db/repository';
import { encodeBindingProof } from '@/lib/domain/protected-save';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  let session: ProfileRequestSessionResult | undefined;
  try {
    const { pageIndex, pageSize } = parseCatalogPagination(request.url);
    session = await validateProfileRequestSession(request);
    if (!session.user) throw new RequestSecurityError(401, 'AUTH_REQUIRED');
    if (!session.profileExists) throw new RequestSecurityError(403, 'PROFILE_REQUIRED');

    const page = await getSaveCatalogPage(session.user.id, pageIndex, pageSize);
    const items = page.items.map((record) => ({
      saveId: record.id,
      label: readSaveLabel(record, session!.user!.id),
      createdAt: record.createdAt.toISOString(),
    }));
    const response = NextResponse.json({ items, totalRows: page.totalRows, pageIndex, pageSize }, {
      headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' },
    });
    return applyAuthResponseState(response, session);
  } catch (error) {
    return await errorResponse(error, session);
  }
}

interface RegisterSaveInput {
  idempotencyKey: string;
  localAccountId: string;
  label: string;
  csrfToken: string;
}

export async function POST(request: Request): Promise<Response> {
  let session: ProfileRequestSessionResult | undefined;
  let dek: Buffer | undefined;
  let proofMac: Buffer | undefined;
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, 8 * 1024, { parse: parseRegisterSaveInput });
    assertCsrf(request, input.csrfToken);
    session = await validateProfileRequestSession(request);
    if (!session.user) throw new RequestSecurityError(401, 'AUTH_REQUIRED');
    if (!session.profileExists) throw new RequestSecurityError(403, 'PROFILE_REQUIRED');

    const saveId = randomUUID();
    const generated = createSaveKey();
    dek = generated.dek;
    const tuple = { ownerId: session.user.id, saveId, localAccountId: input.localAccountId, keyId: generated.keyId };
    const wrapped = wrapSaveKey(dek, tuple);
    const binding = createBindingProof(tuple);
    proofMac = binding.mac;
    const labelBytes = Buffer.from(input.label, 'utf8');
    let encryptedLabel;
    try {
      encryptedLabel = encryptServerValue('save-label', [tuple.ownerId, tuple.saveId], labelBytes);
    } finally {
      labelBytes.fill(0);
    }

    const result = await registerSaveRecord({
      id: saveId,
      ownerId: tuple.ownerId,
      localAccountId: tuple.localAccountId,
      keyId: tuple.keyId,
      wrappedKey: wrapped.wrappedKey,
      wrapIv: wrapped.wrapIv,
      wrapKekId: wrapped.wrapKekId,
      bindingMac: binding.mac,
      bindingKekId: binding.kekId,
      labelCipher: encryptedLabel.ciphertext,
      labelIv: encryptedLabel.iv,
      labelKekId: encryptedLabel.kekId,
      idempotencyKey: input.idempotencyKey,
    });
    if (!result) throw new RequestSecurityError(409, 'SAVE_CONFLICT');

    const record = result.record;
    if (record.idempotencyKey === input.idempotencyKey) {
      if (record.localAccountId !== input.localAccountId || readSaveLabel(record, tuple.ownerId) !== input.label) {
        throw new RequestSecurityError(409, 'SAVE_CONFLICT');
      }
    }
    const recordTuple = {
      ownerId: tuple.ownerId,
      saveId: record.id,
      localAccountId: record.localAccountId,
      keyId: record.keyId,
    };
    if (!verifyBindingProof(recordTuple, record.bindingMac, record.bindingKekId)) {
      throw new Error('The save registration proof could not be verified.');
    }

    const response = NextResponse.json({
      saveId: record.id,
      localAccountId: record.localAccountId,
      keyId: record.keyId,
      bindingProof: encodeBindingProof(record.bindingKekId, record.bindingMac.toString('base64url')),
      label: result.created ? input.label : readSaveLabel(record, tuple.ownerId),
    }, { status: result.created ? 201 : 200 });
    return applyAuthResponseState(response, session);
  } catch (error) {
    return await errorResponse(error, session);
  } finally {
    dek?.fill(0);
    proofMac?.fill(0);
  }
}

function parseRegisterSaveInput(value: unknown): RegisterSaveInput {
  const input = exactObject(value, ['idempotencyKey', 'localAccountId', 'label', 'csrfToken']);
  if (typeof input.idempotencyKey !== 'string' || !uuidPattern.test(input.idempotencyKey)) {
    throw new TypeError('Idempotency key is invalid.');
  }
  if (
    typeof input.localAccountId !== 'string'
    || input.localAccountId.trim().length === 0
    || Buffer.byteLength(input.localAccountId, 'utf8') > 512
  ) throw new TypeError('Local account identifier is invalid.');
  const label = input.label === undefined ? 'Save' : typeof input.label === 'string' ? input.label.trim() : '';
  if (Array.from(label).length < 1 || Array.from(label).length > 80) throw new TypeError('Save label is invalid.');
  if (typeof input.csrfToken !== 'string' || !csrfPattern.test(input.csrfToken)) {
    throw new TypeError('CSRF token is invalid.');
  }
  return { idempotencyKey: input.idempotencyKey, localAccountId: input.localAccountId, label, csrfToken: input.csrfToken };
}

function parseCatalogPagination(requestUrl: string): { pageIndex: number; pageSize: 50 } {
  const url = new URL(requestUrl);
  const rawPage = url.searchParams.get('page') ?? '0';
  const rawPageSize = url.searchParams.get('pageSize') ?? '50';
  if (!/^(0|[1-9]\d{0,14})$/.test(rawPage) || rawPageSize !== '50') {
    throw new RequestSecurityError(400, 'INVALID_REQUEST');
  }
  const pageIndex = Number(rawPage);
  if (!Number.isSafeInteger(pageIndex) || !Number.isSafeInteger(pageIndex * 50)) {
    throw new RequestSecurityError(400, 'INVALID_REQUEST');
  }
  return { pageIndex, pageSize: 50 };
}

function readSaveLabel(
  record: {
    labelCipher: Buffer | null;
    labelIv: Buffer | null;
    labelKekId: string | null;
    id: string;
  },
  ownerId: string,
): string {
  if (record.labelCipher === null && record.labelIv === null && record.labelKekId === null) return 'Save';
  if (!record.labelCipher || !record.labelIv || !record.labelKekId) throw new Error('The save label is invalid.');
  const cleartext = decryptServerValue({ ciphertext: record.labelCipher, iv: record.labelIv, kekId: record.labelKekId }, 'save-label', [ownerId, record.id]);
  try {
    const label = cleartext.toString('utf8');
    if (Array.from(label).length < 1 || Array.from(label).length > 80) throw new Error('The save label is invalid.');
    return label;
  } finally {
    cleartext.fill(0);
  }
}

function exactObject(value: unknown, allowedKeys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Request body is invalid.');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !allowedKeys.includes(key))) throw new TypeError('Request body is invalid.');
  return input;
}

async function errorResponse(error: unknown, session?: ProfileRequestSessionResult): Promise<Response> {
  const response = redactedErrorResponse(error);
  if (!session) return response;
  const body = await response.json();
  return applyAuthResponseState(
    NextResponse.json(body, { status: response.status, headers: response.headers }),
    session,
  );
}

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const csrfPattern = /^[A-Za-z0-9_-]{43}$/;
