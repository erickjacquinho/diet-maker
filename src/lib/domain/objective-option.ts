export type ObjectiveOrigin = 'SYSTEM' | 'CUSTOM';

export const DEFAULT_OBJECTIVE_LABELS = [
  'Cutting',
  'Bulking',
  'Recomposição Corporal',
  'Manutenção',
] as const;

export interface ObjectiveOption {
  id: string;
  accountId: string;
  label: string;
  normalizedLabel: string;
  origin: ObjectiveOrigin;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function normalizeObjectiveLabel(value: string): { label: string; normalizedLabel: string } {
  const label = value.trim().replace(/\s+/g, ' ');
  return {
    label,
    normalizedLabel: label.toLocaleLowerCase('pt-BR'),
  };
}

export function isObjectiveOptionActive(option: Pick<ObjectiveOption, 'archivedAt'>): boolean {
  return option.archivedAt === null;
}
