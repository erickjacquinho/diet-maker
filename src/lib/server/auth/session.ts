import 'server-only';

import { NextResponse } from 'next/server';
import type { JwtPayload, SupabaseClient, User } from '@supabase/supabase-js';
import { findAuthSessionOwner, getProfessionalProfile } from '../online-db/repository';
import { createRequestSupabaseClient, type AuthCookieUpdate } from './supabase';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

export interface RequestSessionResult {
  user: { id: string; email: string } | null;
  cookiesToSet: AuthCookieUpdate[];
  responseHeaders: Record<string, string>;
}

export interface ProfileRequestSessionResult extends RequestSessionResult {
  profileExists: boolean;
}

export async function validateRequestSession(request: Request): Promise<RequestSessionResult> {
  const context = createRequestSupabaseClient(request);
  const result = (user: RequestSessionResult['user']): RequestSessionResult => ({
    user,
    cookiesToSet: context.getCookiesToSet(),
    responseHeaders: context.getResponseHeaders(),
  });

  return result(await validateSupabaseIdentity(context.supabase));
}

export async function validateProfileRequestSession(request: Request): Promise<ProfileRequestSessionResult> {
  const session = await validateRequestSession(request);
  if (!session.user) return { ...session, profileExists: false };
  return { ...session, profileExists: Boolean(await getProfessionalProfile(session.user.id)) };
}

export async function validateSupabaseIdentity(
  supabase: SupabaseClient,
  jwt?: string,
): Promise<{ id: string; email: string } | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
  const user = userData.user;
  if (userError || !isVerifiedProfessional(user)) return null;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(jwt);
  const claims = claimsData?.claims;
  if (claimsError || !isValidClaims(claims, user)) return null;

  const sessionOwner = await findAuthSessionOwner(claims.session_id);
  if (sessionOwner !== user.id) return null;
  return { id: user.id, email: user.email };
}

export function applyAuthResponseState(
  response: NextResponse,
  state: Pick<RequestSessionResult, 'cookiesToSet' | 'responseHeaders'>,
): NextResponse {
  for (const cookie of state.cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  for (const [name, value] of Object.entries(state.responseHeaders)) {
    response.headers.set(name, value);
  }
  response.headers.set('cache-control', 'private, no-store, max-age=0');
  response.headers.set('pragma', 'no-cache');
  return response;
}

function isVerifiedProfessional(user: User | null): user is User & { email: string } {
  return Boolean(
    user
    && user.id
    && user.email
    && user.email_confirmed_at
    && user.is_anonymous !== true,
  );
}

function isValidClaims(claims: JwtPayload | null | undefined, user: User): claims is JwtPayload & { session_id: string } {
  return Boolean(
    claims
    && claims.sub === user.id
    && typeof claims.session_id === 'string'
    && uuidPattern.test(claims.session_id)
    && claims.is_anonymous !== true,
  );
}
