import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  parseJsonBody,
  redactedErrorResponse,
  RequestSecurityError,
} from '@/lib/server/request-security';
import { applyAuthResponseState, validateProfileRequestSession, type ProfileRequestSessionResult } from '@/lib/server/auth/session';
import { unwrapSaveKey, verifyBindingProof } from '@/lib/server/save-keys';
import { getSaveRecord } from '@/lib/server/online-db/repository';
import { decodeBase64Url, parseBindingProof } from '@/lib/domain/protected-save';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AuthorizeSaveInput {
  bindingProof: string;
  csrfToken: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  let session: ProfileRequestSessionResult | undefined;
  let suppliedProof: Buffer | undefined;
  let dek: Buffer | undefined;
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, 8 * 1024, { parse: parseAuthorizeSaveInput });
    assertCsrf(request, input.csrfToken);
    const { id: saveId } = await context.params;
    if (!uuidPattern.test(saveId)) throw new RequestSecurityError(404, 'SAVE_UNAVAILABLE');

    session = await validateProfileRequestSession(request);
    if (!session.user) throw new RequestSecurityError(401, 'AUTH_REQUIRED');
    if (!session.profileExists) throw new RequestSecurityError(403, 'PROFILE_REQUIRED');

    const proof = parseBindingProof(input.bindingProof);
    if (!proof) throw new RequestSecurityError(400, 'INVALID_REQUEST');
    const parsedMac = decodeBase64Url(proof.mac);
    if (!parsedMac || parsedMac.length !== 32) throw new RequestSecurityError(400, 'INVALID_REQUEST');
    suppliedProof = Buffer.from(parsedMac);
    parsedMac.fill(0);
    const record = await getSaveRecord(session.user.id, saveId);
    if (
      !record
      || proof.verifierId !== record.bindingKekId
      || record.bindingMac.length !== 32
      || !timingSafeEqual(suppliedProof, record.bindingMac)
    ) {
      throw new RequestSecurityError(404, 'SAVE_UNAVAILABLE');
    }

    const tuple = {
      ownerId: session.user.id,
      saveId: record.id,
      localAccountId: record.localAccountId,
      keyId: record.keyId,
    };
    if (!verifyBindingProof(tuple, record.bindingMac, record.bindingKekId)) {
      throw new RequestSecurityError(404, 'SAVE_UNAVAILABLE');
    }

    dek = unwrapSaveKey({
      wrappedKey: record.wrappedKey,
      wrapIv: record.wrapIv,
      wrapKekId: record.wrapKekId,
    }, tuple);
    const authorizedAt = Date.now();
    const response = NextResponse.json({
      ownerId: session.user.id,
      saveId: record.id,
      localAccountId: record.localAccountId,
      keyId: record.keyId,
      bindingProof: input.bindingProof,
      authorizedAt,
      expiresAt: authorizedAt + 8 * 60 * 60 * 1000,
      key: dek.toString('base64url'),
    });
    return applyAuthResponseState(response, session);
  } catch (error) {
    return await errorResponse(error, session);
  } finally {
    suppliedProof?.fill(0);
    dek?.fill(0);
  }
}

function parseAuthorizeSaveInput(value: unknown): AuthorizeSaveInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Request body is invalid.');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => key !== 'bindingProof' && key !== 'csrfToken')) {
    throw new TypeError('Request body is invalid.');
  }
  if (typeof input.bindingProof !== 'string' || !parseBindingProof(input.bindingProof)) {
    throw new TypeError('Binding proof is invalid.');
  }
  if (typeof input.csrfToken !== 'string' || !csrfPattern.test(input.csrfToken)) {
    throw new TypeError('CSRF token is invalid.');
  }
  return { bindingProof: input.bindingProof, csrfToken: input.csrfToken };
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
