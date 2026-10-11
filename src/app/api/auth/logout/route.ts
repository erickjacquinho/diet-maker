import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  parseJsonBody,
  redactedErrorResponse,
} from '@/lib/server/request-security';
import { parseCsrfInput } from '@/lib/server/auth/registration';
import { createRequestSupabaseClient } from '@/lib/server/auth/supabase';
import { applyAuthResponseState } from '@/lib/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const { csrfToken } = await parseJsonBody(request, 8 * 1024, { parse: parseCsrfInput });
    assertCsrf(request, csrfToken);
    const context = createRequestSupabaseClient(request);
    const { error } = await context.supabase.auth.signOut({ scope: 'local' });
    const response = new NextResponse(null, { status: error ? 503 : 204 });
    const state = { cookiesToSet: context.getCookiesToSet(), responseHeaders: context.getResponseHeaders() };
    applyAuthResponseState(response, state);
    return response;
  } catch (error) {
    return redactedErrorResponse(error);
  }
}
