import type { PatientInput } from '@/lib/domain/patient';

/** Wire contracts for `/api/v1/patients`. Shared by browser and server; no database types. */

export interface PatientDto {
  id: string;
  displayCode: string;
  name: string;
  age: number | null;
  gender: string;
  birthDate: string | null;
  isPregnant: boolean;
  pregnancyDueDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  maritalStatus: string | null;
  phone: string | null;
  whatsapp: string | null;
  currentObjective: string | null;
  defaultMacroTargets: { proteinG: number | null; carbsG: number | null; fatsG: number | null; kcal: number | null };
  createdAt: string;
  updatedAt: string;
  version: number;
  archivedAt: string | null;
}

export interface CreatePatientRequest {
  /** Client-generated stable ID; repeating the request returns the same patient. */
  id: string;
  patient: PatientInput;
}

export interface PatientSearchRequest {
  query: string;
  pageIndex: number;
  pageSize: number;
}

export interface PatientPageDto {
  items: PatientDto[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const patientKeys = [
  'name', 'age', 'gender', 'birthDate', 'isPregnant', 'pregnancyDueDate', 'heightCm', 'weightKg',
  'maritalStatus', 'phone', 'whatsapp', 'currentObjective', 'defaultMacroTargets',
] as const;
const macroKeys = ['proteinG', 'carbsG', 'fatsG', 'kcal'] as const;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object.');
  return value as Record<string, unknown>;
}

function assertKeys(value: Record<string, unknown>, allowed: readonly string[]): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError('Unknown field.');
}

function optionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'string' || value.length > 500) throw new TypeError('Invalid text.');
  return value;
}

function optionalNumber(value: unknown): number | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('Invalid number.');
  return value;
}

/** Strict parser: unknown keys (accountId, version, timestamps, displayCode…) are rejected. */
export function parsePatientInput(value: unknown): PatientInput {
  const input = record(value);
  assertKeys(input, patientKeys);
  if (typeof input.name !== 'string' || input.name.length > 200) throw new TypeError('Invalid name.');
  let macros: PatientInput['defaultMacroTargets'];
  if (input.defaultMacroTargets !== undefined && input.defaultMacroTargets !== null) {
    const raw = record(input.defaultMacroTargets);
    assertKeys(raw, macroKeys);
    macros = {
      proteinG: optionalNumber(raw.proteinG), carbsG: optionalNumber(raw.carbsG),
      fatsG: optionalNumber(raw.fatsG), kcal: optionalNumber(raw.kcal),
    };
  }
  if (input.isPregnant !== undefined && typeof input.isPregnant !== 'boolean') throw new TypeError('Invalid flag.');
  return {
    name: input.name,
    age: optionalNumber(input.age),
    gender: optionalString(input.gender),
    birthDate: optionalString(input.birthDate),
    isPregnant: input.isPregnant as boolean | undefined,
    pregnancyDueDate: optionalString(input.pregnancyDueDate),
    heightCm: optionalNumber(input.heightCm),
    weightKg: optionalNumber(input.weightKg),
    maritalStatus: optionalString(input.maritalStatus),
    phone: optionalString(input.phone),
    whatsapp: optionalString(input.whatsapp),
    currentObjective: optionalString(input.currentObjective),
    defaultMacroTargets: macros,
  };
}

export function parseCreatePatientRequest(value: unknown): CreatePatientRequest {
  const body = record(value);
  assertKeys(body, ['id', 'patient']);
  if (typeof body.id !== 'string' || !uuidPattern.test(body.id)) throw new TypeError('Invalid id.');
  return { id: body.id.toLowerCase(), patient: parsePatientInput(body.patient) };
}

export function parsePatientUpdateRequest(value: unknown): PatientInput {
  const body = record(value);
  assertKeys(body, ['patient']);
  return parsePatientInput(body.patient);
}

export function parsePatientSearchRequest(value: unknown): PatientSearchRequest {
  const body = record(value);
  assertKeys(body, ['query', 'pageIndex', 'pageSize']);
  if (typeof body.query !== 'string' || body.query.length > 200) throw new TypeError('Invalid query.');
  const { pageIndex, pageSize } = body;
  if (!Number.isSafeInteger(pageIndex) || (pageIndex as number) < 0) throw new TypeError('Invalid page.');
  if (!Number.isSafeInteger(pageSize) || (pageSize as number) < 1 || (pageSize as number) > 25) throw new TypeError('Invalid page size.');
  return { query: body.query, pageIndex: pageIndex as number, pageSize: pageSize as number };
}

/** Output allowlist: copies only the public fields, whatever the handler returned. */
export function parsePatientDto(value: unknown): PatientDto {
  const p = record(value);
  const macros = record(p.defaultMacroTargets);
  return {
    id: String(p.id), displayCode: String(p.displayCode), name: String(p.name),
    age: (p.age ?? null) as number | null, gender: String(p.gender),
    birthDate: (p.birthDate ?? null) as string | null, isPregnant: Boolean(p.isPregnant),
    pregnancyDueDate: (p.pregnancyDueDate ?? null) as string | null,
    heightCm: (p.heightCm ?? null) as number | null, weightKg: (p.weightKg ?? null) as number | null,
    maritalStatus: (p.maritalStatus ?? null) as string | null, phone: (p.phone ?? null) as string | null,
    whatsapp: (p.whatsapp ?? null) as string | null, currentObjective: (p.currentObjective ?? null) as string | null,
    defaultMacroTargets: {
      proteinG: (macros.proteinG ?? null) as number | null, carbsG: (macros.carbsG ?? null) as number | null,
      fatsG: (macros.fatsG ?? null) as number | null, kcal: (macros.kcal ?? null) as number | null,
    },
    createdAt: String(p.createdAt), updatedAt: String(p.updatedAt),
    version: Number(p.version), archivedAt: (p.archivedAt ?? null) as string | null,
  };
}

export function parsePatientPageDto(value: unknown): PatientPageDto {
  const page = record(value);
  if (!Array.isArray(page.items)) throw new TypeError('Invalid page.');
  return {
    items: page.items.map(parsePatientDto), total: Number(page.total),
    pageIndex: Number(page.pageIndex), pageSize: Number(page.pageSize),
  };
}
