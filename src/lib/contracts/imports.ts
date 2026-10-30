/** Wire contract for `POST /api/v1/imports/nutridiet`. */

export interface ImportSummaryDto {
  patients: number;
  bodyAssessments: number;
  nextFollowUps: number;
  dietPlans: number;
  foodCatalogItems: number;
  recipes: number;
  readyMeals: number;
  readyDiets: number;
  favorites: number;
  agendaReminders: number;
  skipped: { account: number; objectiveOptions: number };
}

export interface ImportResultDto {
  /** `true` when the same file (same SHA-256) had already been imported and nothing was written again. */
  replayed: boolean;
  format: 'nutridiet-v1-plaintext' | 'nutridiet-v2-protected';
  summary: ImportSummaryDto;
}

const countKeys = [
  'patients', 'bodyAssessments', 'nextFollowUps', 'dietPlans', 'foodCatalogItems', 'recipes', 'readyMeals',
  'readyDiets', 'favorites', 'agendaReminders',
] as const;

function count(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new TypeError('Invalid count.');
  return value as number;
}

/** Output allowlist: only counters leave the server, never imported content. */
export function parseImportResultDto(value: unknown): ImportResultDto {
  const v = value as { replayed?: unknown; format?: unknown; summary?: Record<string, unknown> & { skipped?: Record<string, unknown> } };
  if (!v || typeof v !== 'object' || !v.summary || typeof v.summary !== 'object') throw new TypeError('Invalid result.');
  if (v.format !== 'nutridiet-v1-plaintext' && v.format !== 'nutridiet-v2-protected') throw new TypeError('Invalid format.');
  const summary = Object.fromEntries(countKeys.map((key) => [key, count(v.summary![key])])) as unknown as ImportSummaryDto;
  summary.skipped = { account: count(v.summary.skipped?.account), objectiveOptions: count(v.summary.skipped?.objectiveOptions) };
  return { replayed: v.replayed === true, format: v.format, summary };
}

export const NUTRIDIET_IMPORT_MAX_BYTES = 4_000_000;
