import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  parseJsonBody,
  redactedErrorResponse,
  RequestSecurityError,
} from '@/lib/server/request-security';
import { applyAuthResponseState, validateRequestSession, type RequestSessionResult } from '@/lib/server/auth/session';
import { readProfessionalProfile, writeProfessionalProfile } from '@/lib/server/professional-profile';
import { DOCUMENT_LOGO_MAX_LENGTH, PROFESSIONAL_PROFILE_KEYS, parseProfessionalProfile, type ProfessionalProfile } from '@/lib/domain/professional-profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  let session: RequestSessionResult | undefined;
  try {
    session = await validateRequestSession(request);
    if (!session.user) throw new RequestSecurityError(401, 'AUTH_REQUIRED');
    const profile = await readProfessionalProfile(session.user.id);
    if (!profile) throw new RequestSecurityError(403, 'PROFILE_REQUIRED');
    return applyAuthResponseState(NextResponse.json({ profile, accountEmail: session.user.email }), session);
  } catch (error) {
    return await errorResponse(error, session);
  }
}

export async function PUT(request: Request): Promise<Response> {
  let session: RequestSessionResult | undefined;
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, DOCUMENT_LOGO_MAX_LENGTH + 16 * 1024, { parse: parseUpdateProfileInput });
    assertCsrf(request, input.csrfToken);
    session = await validateRequestSession(request);
    if (!session.user) throw new RequestSecurityError(401, 'AUTH_REQUIRED');
    if (!await writeProfessionalProfile(session.user.id, input.profile)) throw new RequestSecurityError(403, 'PROFILE_REQUIRED');
    const profile = await readProfessionalProfile(session.user.id);
    if (!profile) throw new Error('The professional profile could not be read after the update.');
    return applyAuthResponseState(NextResponse.json({ profile, accountEmail: session.user.email }), session);
  } catch (error) {
    return await errorResponse(error, session);
  }
}

function parseUpdateProfileInput(value: unknown): { profile: ProfessionalProfile; csrfToken: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Request body is invalid.');
  const { csrfToken, ...profile } = value as Record<string, unknown>;
  if (typeof csrfToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(csrfToken)) throw new TypeError('CSRF token is invalid.');
  if (Object.keys(profile).some((key) => !(PROFESSIONAL_PROFILE_KEYS as readonly string[]).includes(key))) {
    throw new TypeError('Request body is invalid.');
  }
  return { profile: parseProfessionalProfile(profile), csrfToken };
}

async function errorResponse(error: unknown, session?: RequestSessionResult): Promise<Response> {
  const response = redactedErrorResponse(error);
  if (!session) return response;
  const body = await response.json();
  return applyAuthResponseState(
    NextResponse.json(body, { status: response.status, headers: response.headers }),
    session,
  );
}
