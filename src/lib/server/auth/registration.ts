import 'server-only';

import { bootstrapProfessionalProfile, getProfessionalProfile } from '../online-db/repository';
import { encryptProfessionalProfile } from '../save-keys';
import { RequestSecurityError, getConfiguredAppOrigin } from '../request-security';
import { validateRequestSession, validateSupabaseIdentity } from './session';
import { createRequestSupabaseClient } from './supabase';

export type ProfessionalExperience =
  | { kind: 'months_1_6' }
  | { kind: 'months_6_12' }
  | { kind: 'years'; value: number };

export interface ProfessionalProfileInput {
  firstName: string;
  lastName: string;
  averagePatientsPerMonth: number;
  experience: ProfessionalExperience;
}

export interface SignupInput extends ProfessionalProfileInput {
  email: string;
  emailConfirmation: string;
  password: string;
  passwordConfirmation: string;
  csrfToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
  csrfToken: string;
}

export interface CompleteProfileInput extends ProfessionalProfileInput {
  csrfToken: string;
}

export function parseSignupInput(value: unknown): SignupInput {
  const input = exactObject(value, [
    'firstName', 'lastName', 'email', 'emailConfirmation', 'password', 'passwordConfirmation',
    'averagePatientsPerMonth', 'experience', 'csrfToken',
  ]);
  const profile = parseProfessionalProfile(input);
  const email = parseEmail(input.email);
  const emailConfirmation = parseEmail(input.emailConfirmation);
  const password = parsePassword(input.password);
  const passwordConfirmation = parsePassword(input.passwordConfirmation);
  if (email !== emailConfirmation) throw new TypeError('Email confirmation does not match.');
  if (password !== passwordConfirmation) throw new TypeError('Password confirmation does not match.');
  return { ...profile, email, emailConfirmation, password, passwordConfirmation, csrfToken: parseCsrfToken(input.csrfToken) };
}

export function parseLoginInput(value: unknown): LoginInput {
  const input = exactObject(value, ['email', 'password', 'csrfToken']);
  return {
    email: parseEmail(input.email),
    password: parsePassword(input.password, false),
    csrfToken: parseCsrfToken(input.csrfToken),
  };
}

export function parseCompleteProfileInput(value: unknown): CompleteProfileInput {
  const input = exactObject(value, ['firstName', 'lastName', 'averagePatientsPerMonth', 'experience', 'csrfToken']);
  return { ...parseProfessionalProfile(input), csrfToken: parseCsrfToken(input.csrfToken) };
}

export function parseCsrfInput(value: unknown): { csrfToken: string } {
  const input = exactObject(value, ['csrfToken']);
  return { csrfToken: parseCsrfToken(input.csrfToken) };
}

export async function createProfessionalAccount(request: Request, input: SignupInput): Promise<void> {
  const context = createRequestSupabaseClient(request);
  const origin = getConfiguredAppOrigin();
  const { data, error } = await context.supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { emailRedirectTo: new URL('/auth/confirm', origin).toString() },
  });

  if (error) {
    const status = 'status' in error && typeof error.status === 'number' ? error.status : 0;
    if (status === 429) throw new RequestSecurityError(429, 'RATE_LIMITED', 60);
    if (status >= 500) throw new Error('Supabase Auth is unavailable.');
    return;
  }

  const user = data.user;
  if (
    !user
    || !uuidPattern.test(user.id)
    || user.email?.trim().toLowerCase() !== input.email
    || !user.identities?.length
  ) return;

  const encrypted = encryptProfessionalProfile(user.id, toProfile(input));
  try {
    await bootstrapProfessionalProfile({
      ownerId: user.id,
      profileCipher: encrypted.ciphertext,
      profileIv: encrypted.iv,
      profileKekId: encrypted.kekId,
    });
  } catch {
    // A verified login can complete a profile whose insert failed during signup.
  }
}

export async function loginProfessionalAccount(request: Request, input: LoginInput) {
  const context = createRequestSupabaseClient(request);
  const { data, error } = await context.supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    const status = 'status' in error && typeof error.status === 'number' ? error.status : 0;
    if (status === 429) throw new RequestSecurityError(429, 'RATE_LIMITED', 60);
    if (status >= 500) throw new Error('Supabase Auth is unavailable.');
    return loginResult(context, null, false);
  }
  if (!data.session?.access_token) {
    return loginResult(context, null, false);
  }

  const user = await validateSupabaseIdentity(context.supabase, data.session.access_token);
  if (!user) {
    await context.supabase.auth.signOut({ scope: 'local' });
    return loginResult(context, null, false);
  }

  const profileComplete = Boolean(await getProfessionalProfile(user.id));
  return loginResult(context, user, profileComplete);
}

export async function completeProfessionalProfile(request: Request, input: CompleteProfileInput) {
  const session = await validateRequestSession(request);
  if (!session.user) return { ...session, profileComplete: false };

  const existing = await getProfessionalProfile(session.user.id);
  if (existing) return { ...session, profileComplete: true };

  const encrypted = encryptProfessionalProfile(session.user.id, toProfile(input));
  await bootstrapProfessionalProfile({
    ownerId: session.user.id,
    profileCipher: encrypted.ciphertext,
    profileIv: encrypted.iv,
    profileKekId: encrypted.kekId,
  });
  if (!await getProfessionalProfile(session.user.id)) throw new Error('The professional profile could not be completed.');
  return { ...session, profileComplete: true };
}

function loginResult(
  context: ReturnType<typeof createRequestSupabaseClient>,
  user: { id: string; email: string } | null,
  profileComplete: boolean,
) {
  return {
    user,
    profileComplete,
    cookiesToSet: context.getCookiesToSet(),
    responseHeaders: context.getResponseHeaders(),
  };
}

function parseProfessionalProfile(input: Record<string, unknown>): ProfessionalProfileInput {
  const firstName = parseName(input.firstName);
  const lastName = parseName(input.lastName);
  const averagePatientsPerMonth = input.averagePatientsPerMonth;
  if (typeof averagePatientsPerMonth !== 'number' || !Number.isFinite(averagePatientsPerMonth) || averagePatientsPerMonth < 0) {
    throw new TypeError('Average patient count must be a finite nonnegative number.');
  }

  const rawExperience = input.experience;
  if (!rawExperience || typeof rawExperience !== 'object' || Array.isArray(rawExperience)) {
    throw new TypeError('Professional experience is invalid.');
  }
  const experience = rawExperience as Record<string, unknown>;
  if (experience.kind === 'months_1_6' || experience.kind === 'months_6_12') {
    if (Object.keys(experience).length !== 1) throw new TypeError('Professional experience is invalid.');
    return { firstName, lastName, averagePatientsPerMonth, experience: { kind: experience.kind } };
  }
  if (
    experience.kind !== 'years'
    || Object.keys(experience).length !== 2
    || typeof experience.value !== 'number'
    || !Number.isFinite(experience.value)
    || experience.value < 0
  ) throw new TypeError('Professional experience is invalid.');
  return { firstName, lastName, averagePatientsPerMonth, experience: { kind: 'years', value: experience.value } };
}

function exactObject(value: unknown, allowedKeys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Request body is invalid.');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !allowedKeys.includes(key))) throw new TypeError('Request body is invalid.');
  return input;
}

function parseEmail(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('Email is invalid.');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TypeError('Email is invalid.');
  return email;
}

function parsePassword(value: unknown, enforceNewPasswordRules = true): string {
  if (typeof value !== 'string' || value.length === 0 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new TypeError('Password is invalid.');
  }
  if (enforceNewPasswordRules && Array.from(value).length < 12) throw new TypeError('Password is invalid.');
  return value;
}

function parseName(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('Name is invalid.');
  const name = value.trim();
  if (Array.from(name).length < 1 || Array.from(name).length > 100) throw new TypeError('Name is invalid.');
  return name;
}

function parseCsrfToken(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw new TypeError('CSRF token is invalid.');
  return value;
}

function toProfile(input: ProfessionalProfileInput): ProfessionalProfileInput {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    averagePatientsPerMonth: input.averagePatientsPerMonth,
    experience: input.experience,
  };
}

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
