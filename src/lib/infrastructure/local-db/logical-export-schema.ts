import type { DietPlan } from '@/lib/domain/diets/diet-model';

export const DIET_LOGICAL_EXPORT_SCHEMA_VERSION = 2 as const;

export interface LogicalDietExport {
  schemaVersion: typeof DIET_LOGICAL_EXPORT_SCHEMA_VERSION;
  diets: DietPlan[];
}

export interface LogicalAccountExport {
  schemaVersion: typeof DIET_LOGICAL_EXPORT_SCHEMA_VERSION;
  accounts: unknown[];
  patients: unknown[];
  diets: LogicalDietExport;
}
