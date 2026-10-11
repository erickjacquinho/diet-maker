import 'server-only';

import { createRequestSupabaseClient, type AuthCookieUpdate } from './supabase';
import { getConfiguredAppOrigin } from '../request-security';

export interface RecoveryRequestInput {
  email: string;
  csrfToken: string;
}

export interface ResetPasswordInput {
  password: string;
  passwordConfirmation: string;
  csrfToken: string;
}

export class InvalidRecoveryLinkError extends Error {}

export function parseRecoveryRequestInput(value: unknown): RecoveryRequestInput {
  const input = exactObject(value, ['email', 'csrfToken']);
  const email = input.email;
  if (typeof email !== 'string') throw new TypeError('Email is invalid.');
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new TypeError('Email is invalid.');
  }
  return { email: normalizedEmail, csrfToken: parseCsrfToken(input.csrfToken) };
}

export function parseResetPasswordInput(value: unknown): ResetPasswordInput {
  const input = exactObject(value, ['password', 'passwordConfirmation', 'csrfToken']);
  const password = parseNewPassword(input.password);
  const passwordConfirmation = parseNewPassword(input.passwordConfirmation);
  if (password !== passwordConfirmation) throw new TypeError('Password confirmation does not match.');
  return { password, passwordConfirmation, csrfToken: parseCsrfToken(input.csrfToken) };
}

export async function requestPasswordRecovery(request: Request, input: RecoveryRequestInput): Promise<void> {
  const context = createRequestSupabaseClient(request);
  await context.supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: new URL('/auth/recovery', getConfiguredAppOrigin()).toString(),
  });
}

export async function resetProfessionalPassword(
  request: Request,
  input: ResetPasswordInput,
  tokenHash: string,
): Promise<AuthCookieUpdate[]> {
  const context = createRequestSupabaseClient(request);
  const { data, error } = await context.supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
  if (error || !data.session?.access_token) throw new InvalidRecoveryLinkError();

  const { data: updateData, error: updateError } = await context.supabase.auth.updateUser({ password: input.password });
  if (updateError || !updateData.user) {
    await context.supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    throw new InvalidRecoveryLinkError();
  }

  const { error: signOutError } = await context.supabase.auth.signOut({ scope: 'global' });
  if (signOutError) {
    await context.supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    throw new Error('All recovery sessions could not be revoked.');
  }

  return context.getCookiesToSet().filter(isCookieDeletion);
}

function exactObject(value: unknown, allowedKeys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Request body is invalid.');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !allowedKeys.includes(key))) throw new TypeError('Request body is invalid.');
  return input;
}

function parseNewPassword(value: unknown): string {
  if (
    typeof value !== 'string'
    || Array.from(value).length < 12
    || Buffer.byteLength(value, 'utf8') > 72
  ) throw new TypeError('Password is invalid.');
  return value;
}

function parseCsrfToken(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw new TypeError('CSRF token is invalid.');
  return value;
}

function isCookieDeletion(cookie: AuthCookieUpdate): boolean {
  return cookie.value === '' && cookie.options.maxAge === 0;
}
