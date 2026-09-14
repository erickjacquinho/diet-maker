/**
 * Compatibility entry point for external callers. New application code uses
 * the pure legacy-diet-copy module or canonical diet commands directly.
 */
export {
  buildPreviousDietSummaries,
  cloneMealsWithFreshIds,
  cloneDietForNewDraft,
  extractMacrosFromPreviousDiet,
  type ImportActionType,
  type PreviousDietSummary,
} from './legacy-diet-copy';
