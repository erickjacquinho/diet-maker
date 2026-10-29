import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  parseJsonBody,
  redactedErrorResponse,
  RequestSecurityError,
} from '@/lib/server/request-security';
import { applyAuthResponseState, validateProfileRequestSession, type ProfileRequestSessionResult } from '@/lib/server/auth/session';
import { encryptServerValue } from '@/lib/server/save-keys';
import { updateSaveLabel } from '@/lib/server/online-db/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Renames a save in the account catalog. The file content is not touched here. */
export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  let session: ProfileRequestSessionResult | undefined;
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, 4 * 1024, { parse: parseRenameSaveInput });
    assertCsrf(request, input.csrfToken);
    const { id: saveId } = await context.params;
    if (!uuidPattern.test(saveId)) throw new RequestSecurityError(404, 'SAVE_UNAVAILABLE');

    session = await validateProfileRequestSession(request);
    if (!session.user) throw new RequestSecurityError(401, 'AUTH_REQUIRED');
    if (!session.profileExists) throw new RequestSecurityError(403, 'PROFILE_REQUIRED');

    const labelBytes = Buffer.from(input.label, 'utf8');
    let encrypted;
    try {
      encrypted = encryptServerValue('save-label', [session.user.id, saveId], labelBytes);
    } finally {
      labelBytes.fill(0);
    }
    const updated = await updateSaveLabel({
      ownerId: session.user.id,
      saveId,
      labelCipher: encrypted.ciphertext,
      labelIv: encrypted.iv,
      labelKekId: encrypted.kekId,
    });
    if (!updated) throw new RequestSecurityError(404, 'SAVE_UNAVAILABLE');

    return applyAuthResponseState(NextResponse.json({ saveId, label: input.label }), session);
  } catch (error) {
    return await errorResponse(error, session);
  }
}

function parseRenameSaveInput(value: unknown): { label: string; csrfToken: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Request body is invalid.');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => key !== 'label' && key !== 'csrfToken')) throw new TypeError('Request body is invalid.');
  const label = typeof input.label === 'string' ? input.label.trim().replace(/\s+/g, ' ') : '';
  if (Array.from(label).length < 1 || Array.from(label).length > 80) throw new TypeError('Save label is invalid.');
  if (typeof input.csrfToken !== 'string' || !csrfPattern.test(input.csrfToken)) throw new TypeError('CSRF token is invalid.');
  return { label, csrfToken: input.csrfToken };
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
