import type { NumericAssessmentField } from '@/hooks/useAssessmentForm';

export interface AssessmentFieldConfig {
  field: NumericAssessmentField;
  label: string;
  unit: 'kg' | 'cm';
}

export const TRUNK_FIELDS: AssessmentFieldConfig[] = [
  { field: 'neckCm', label: 'Pescoço', unit: 'cm' },
  { field: 'waistCm', label: 'Cintura', unit: 'cm' },
  { field: 'abdomenCm', label: 'Barriga', unit: 'cm' },
  { field: 'hipCm', label: 'Quadril', unit: 'cm' },
  { field: 'scapulaCm', label: 'Escápula', unit: 'cm' },
  { field: 'bustCm', label: 'Busto', unit: 'cm' },
];

export const UPPER_LIMB_FIELDS: AssessmentFieldConfig[] = [
  { field: 'leftArmCm', label: 'Braço esquerdo', unit: 'cm' },
  { field: 'rightArmCm', label: 'Braço direito', unit: 'cm' },
];

export const LOWER_LIMB_FIELDS: AssessmentFieldConfig[] = [
  { field: 'leftProximalThighCm', label: 'Coxa proximal esq.', unit: 'cm' },
  { field: 'rightProximalThighCm', label: 'Coxa proximal dir.', unit: 'cm' },
  { field: 'leftDistalThighCm', label: 'Coxa distal esq.', unit: 'cm' },
  { field: 'rightDistalThighCm', label: 'Coxa distal dir.', unit: 'cm' },
  { field: 'leftCalfCm', label: 'Panturrilha esq.', unit: 'cm' },
  { field: 'rightCalfCm', label: 'Panturrilha dir.', unit: 'cm' },
];
