import type { NumericAssessmentField } from '@/hooks/useAssessmentForm';

export interface AssessmentFieldConfig {
  field: NumericAssessmentField;
  label: string;
  unit: 'kg' | 'cm';
}

export const TRUNK_FIELDS: AssessmentFieldConfig[] = [
  { field: 'neckCm', label: 'Pescoço', unit: 'cm' },
  { field: 'scapulaCm', label: 'Escápula', unit: 'cm' },
  { field: 'bustCm', label: 'Busto', unit: 'cm' },
  { field: 'waistCm', label: 'Cintura', unit: 'cm' },
  { field: 'abdomenCm', label: 'Barriga', unit: 'cm' },
  { field: 'hipCm', label: 'Quadril', unit: 'cm' },
];

export const UPPER_LIMB_FIELDS: AssessmentFieldConfig[] = [
  { field: 'leftArmCm', label: 'Braço esquerdo', unit: 'cm' },
  { field: 'rightArmCm', label: 'Braço direito', unit: 'cm' },
];

export const LOWER_LIMB_FIELDS: AssessmentFieldConfig[] = [
  { field: 'leftProximalThighCm', label: 'Coxa proximal esquerda', unit: 'cm' },
  { field: 'rightProximalThighCm', label: 'Coxa proximal direita', unit: 'cm' },
  { field: 'leftDistalThighCm', label: 'Coxa distal esquerda', unit: 'cm' },
  { field: 'rightDistalThighCm', label: 'Coxa distal direita', unit: 'cm' },
  { field: 'leftCalfCm', label: 'Panturrilha esquerda', unit: 'cm' },
  { field: 'rightCalfCm', label: 'Panturrilha direita', unit: 'cm' },
];
