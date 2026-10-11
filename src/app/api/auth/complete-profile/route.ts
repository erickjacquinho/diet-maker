import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  parseJsonBody,
  redactedErrorResponse,
} from '@/lib/server/request-security';
import { completeProfessionalProfile, parseCompleteProfileInput } from '@/lib/server/auth/registration';
import { applyAuthResponseState } from '@/lib/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, 8 * 1024, { parse: parseCompleteProfileInput });
    assertCsrf(request, input.csrfToken);
    const result = await completeProfessionalProfile(request, input);
    if (!result.user) {
      return applyAuthResponseState(
        NextResponse.json({ code: 'AUTH_REQUIRED', message: 'Entre na sua conta verificada.' }, { status: 401 }),
        result,
      );
    }
    return applyAuthResponseState(
      NextResponse.json({ destination: '/saves' }),
      result,
    );
  } catch (error) {
    return redactedErrorResponse(error);
  }
}
