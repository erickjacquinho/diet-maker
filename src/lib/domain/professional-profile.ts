/**
 * Professional (nutritionist) profile bound to the online account.
 *
 * Version 1 profiles, written at signup, contain only the four required fields.
 * Every field added later is optional so those profiles keep parsing unchanged.
 */

export type ProfessionalExperience =
  | { kind: 'months_1_6' }
  | { kind: 'months_6_12' }
  | { kind: 'years'; value: number };

export type ProfessionalServiceMode = 'in_person' | 'online' | 'hybrid';

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export type BrazilianState = typeof BRAZILIAN_STATES[number];

export interface ProfessionalProfile {
  firstName: string;
  lastName: string;
  averagePatientsPerMonth: number;
  experience: ProfessionalExperience;
  professionalTitle: string | null;
  crn: string | null;
  specialties: string | null;
  bio: string | null;
  contactEmail: string | null;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  clinicName: string | null;
  city: string | null;
  state: BrazilianState | null;
  serviceMode: ProfessionalServiceMode | null;
  showOnDocuments: boolean;
}

export const DEFAULT_PROFESSIONAL_TITLE = 'Nutricionista';

export const PROFESSIONAL_PROFILE_LIMITS = {
  name: 100,
  professionalTitle: 80,
  crn: 30,
  specialties: 300,
  bio: 600,
  contactEmail: 254,
  phone: 30,
  instagram: 31,
  website: 200,
  clinicName: 120,
  city: 80,
} as const;

export const SERVICE_MODE_LABELS: Record<ProfessionalServiceMode, string> = {
  in_person: 'Presencial',
  online: 'Online',
  hybrid: 'Presencial e online',
};

const OPTIONAL_TEXT_FIELDS = [
  'professionalTitle', 'crn', 'specialties', 'bio', 'phone', 'clinicName', 'city',
] as const;

export const PROFESSIONAL_PROFILE_KEYS = [
  'firstName', 'lastName', 'averagePatientsPerMonth', 'experience',
  ...OPTIONAL_TEXT_FIELDS, 'contactEmail', 'instagram', 'website', 'state', 'serviceMode', 'showOnDocuments',
] as const satisfies readonly (keyof ProfessionalProfile)[];

/** Validates and normalizes any stored or submitted profile; throws TypeError on invalid input. */
export function parseProfessionalProfile(value: unknown): ProfessionalProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Professional profile is invalid.');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !(PROFESSIONAL_PROFILE_KEYS as readonly string[]).includes(key))) {
    throw new TypeError('Professional profile is invalid.');
  }

  const optional = Object.fromEntries(OPTIONAL_TEXT_FIELDS.map((key) => [
    key,
    parseOptionalText(input[key], PROFESSIONAL_PROFILE_LIMITS[key], key === 'bio' || key === 'specialties'),
  ])) as Pick<ProfessionalProfile, typeof OPTIONAL_TEXT_FIELDS[number]>;

  return {
    firstName: parseName(input.firstName),
    lastName: parseName(input.lastName),
    averagePatientsPerMonth: parseNonNegative(input.averagePatientsPerMonth, 'Average patient count'),
    experience: parseExperience(input.experience),
    ...optional,
    contactEmail: parseContactEmail(input.contactEmail),
    instagram: parseInstagram(input.instagram),
    website: parseWebsite(input.website),
    state: parseState(input.state),
    serviceMode: parseServiceMode(input.serviceMode),
    showOnDocuments: input.showOnDocuments === undefined ? true : parseBoolean(input.showOnDocuments),
  };
}

export function getProfessionalFullName(profile: Pick<ProfessionalProfile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName} ${profile.lastName}`.trim().replace(/\s+/g, ' ');
}

export function getProfessionalTitle(profile: Pick<ProfessionalProfile, 'professionalTitle'>): string {
  return profile.professionalTitle ?? DEFAULT_PROFESSIONAL_TITLE;
}

/** One-line professional signature used in exported documents, e.g. "Ana Souza · Nutricionista · CRN-3 12345". */
export function getProfessionalSignature(profile: ProfessionalProfile): string {
  return [getProfessionalFullName(profile), getProfessionalTitle(profile), profile.crn].filter(Boolean).join(' · ');
}

function parseName(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('Name is invalid.');
  const name = value.trim().replace(/\s+/g, ' ');
  const length = Array.from(name).length;
  if (length < 1 || length > PROFESSIONAL_PROFILE_LIMITS.name) throw new TypeError('Name is invalid.');
  return name;
}

function parseNonNegative(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a finite nonnegative number.`);
  }
  return value;
}

function parseExperience(value: unknown): ProfessionalExperience {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Professional experience is invalid.');
  const experience = value as Record<string, unknown>;
  if (experience.kind === 'months_1_6' || experience.kind === 'months_6_12') {
    if (Object.keys(experience).length !== 1) throw new TypeError('Professional experience is invalid.');
    return { kind: experience.kind };
  }
  if (experience.kind !== 'years' || Object.keys(experience).length !== 2) throw new TypeError('Professional experience is invalid.');
  return { kind: 'years', value: parseNonNegative(experience.value, 'Professional experience') };
}

function parseOptionalText(value: unknown, maximum: number, multiline = false): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new TypeError('Profile text is invalid.');
  const text = multiline
    ? value.replace(/\r\n?/g, '\n').split('\n').map((line) => line.trim().replace(/[ \t]+/g, ' ')).join('\n').replace(/\n{3,}/g, '\n\n').trim()
    : value.trim().replace(/\s+/g, ' ');
  if (!text) return null;
  if (Array.from(text).length > maximum) throw new TypeError('Profile text is too long.');
  return text;
}

function parseContactEmail(value: unknown): string | null {
  const email = parseOptionalText(value, PROFESSIONAL_PROFILE_LIMITS.contactEmail)?.toLowerCase() ?? null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TypeError('Contact email is invalid.');
  return email;
}

function parseInstagram(value: unknown): string | null {
  const raw = parseOptionalText(value, PROFESSIONAL_PROFILE_LIMITS.instagram + 1);
  if (!raw) return null;
  const handle = raw.replace(/^@/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) throw new TypeError('Instagram handle is invalid.');
  return `@${handle}`;
}

function parseWebsite(value: unknown): string | null {
  const raw = parseOptionalText(value, PROFESSIONAL_PROFILE_LIMITS.website);
  if (!raw) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new TypeError('Website is invalid.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) {
    throw new TypeError('Website is invalid.');
  }
  return candidate;
}

function parseState(value: unknown): BrazilianState | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !(BRAZILIAN_STATES as readonly string[]).includes(value)) throw new TypeError('State is invalid.');
  return value as BrazilianState;
}

function parseServiceMode(value: unknown): ProfessionalServiceMode | null {
  if (value === undefined || value === null || value === '') return null;
  if (value !== 'in_person' && value !== 'online' && value !== 'hybrid') throw new TypeError('Service mode is invalid.');
  return value;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new TypeError('Profile flag is invalid.');
  return value;
}
