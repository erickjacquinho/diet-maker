import React from 'react';
import { Scale, Ruler } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Surface, Badge } from '@/components/atoms';
import type { BodyAssessment } from '@/lib/patientsStore';
import type { AssessmentType } from '@/lib/domain/clinical';
import type { NumericAssessmentField } from '@/hooks/useAssessmentForm';
import { AssessmentMeasurementField } from './AssessmentMeasurementField';
import { LimbSectionCard } from './LimbSectionCard';
import { TRUNK_FIELDS, UPPER_LIMB_FIELDS, LOWER_LIMB_FIELDS } from './assessmentFieldsConfig';

export const REQUIRED_ASSESSMENT_FIELDS = new Set<string>([
  'weightKg',
  'scapulaCm',
  'bustCm',
  'waistCm',
  'abdomenCm',
  'hipCm',
  'leftProximalThighCm',
  'rightProximalThighCm',
]);

export interface AssessmentContinuousFieldsProps {
  draft: BodyAssessment;
  previousAssessment?: BodyAssessment | null;
  updateNumericField: (field: NumericAssessmentField, value: string) => void;
  mode?: AssessmentType;
  className?: string;
}

export function AssessmentContinuousFields({
  draft,
  previousAssessment,
  updateNumericField,
  mode = 'complete',
  className = '',
}: AssessmentContinuousFieldsProps) {
  const isRequiredField = (name: NumericAssessmentField) => {
    return mode === 'simplified'
      ? name === 'weightKg' || name === 'heightCm'
      : REQUIRED_ASSESSMENT_FIELDS.has(name);
  };

  const isFieldAutoFilled = (name: NumericAssessmentField) => {
    return Boolean(draft.autoFilledFields?.includes(name));
  };

  const field = (name: NumericAssessmentField, label: string, unit: string, fieldClassName?: string) => (
    <AssessmentMeasurementField
      key={name}
      id={`assessment-${name}`}
      label={label}
      unit={unit}
      value={draft[name]}
      previousValue={mode === 'complete' && previousAssessment ? previousAssessment[name] : undefined}
      isRequired={isRequiredField(name)}
      isAutoFilled={isFieldAutoFilled(name)}
      onChange={(value) => updateNumericField(name, value)}
      className={fieldClassName}
    />
  );

  if (mode === 'simplified') {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <Surface variant="default" density="highlight" className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Scale className="size-4 text-success" aria-hidden="true" />
            <span className={textStyle('caption-strong')}>Medidas essenciais</span>
          </div>
          <div className="grid grid-cols-2 gap-3 items-start">
            {field('weightKg', 'Peso atual', 'kg')}
            {field('heightCm', 'Altura', 'cm')}
          </div>
          <div className="flex flex-col gap-3 border-t border-border-subtle pt-3">
            <span className={textStyle('caption-strong')}>Medidas opcionais</span>
            <div className="grid grid-cols-3 gap-3 items-start">
              {field('waistCm', 'Cintura', 'cm')}
              {field('abdomenCm', 'Barriga', 'cm')}
              {field('hipCm', 'Quadril', 'cm')}
            </div>
          </div>
        </Surface>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Seção 1: Balança e Tronco Superior */}
      <Surface variant="default" density="highlight" className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <Scale className="size-4 text-success" aria-hidden="true" />
          <span className={textStyle('caption-strong')}>Balança & Tronco Superior</span>
        </div>
        <div className="flex flex-col gap-3">
          {field('weightKg', 'Peso atual', 'kg')}
          <div className="grid grid-cols-3 gap-3 items-start">
            {TRUNK_FIELDS.slice(0, 3).map(({ field: name, label, unit }) => field(name, label, unit))}
          </div>
        </div>
      </Surface>

      {/* Seção 2: Membros Superiores */}
      <LimbSectionCard title="Membros Superiores" subtitle="Esquerdo / Direito">
        {UPPER_LIMB_FIELDS.map(({ field: name, label, unit }) => field(name, label, unit))}
      </LimbSectionCard>

      {/* Seção 3: Circunferências Centrais / US Navy */}
      <Surface variant="default" density="highlight" className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Ruler className="size-4 text-success" aria-hidden="true" />
            <span className={textStyle('caption-strong')}>Circunferências Centrais</span>
          </div>
          <Badge variant="blue" className="text-style-chart-micro font-medium">
            Equação US Navy
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 items-start">
          {TRUNK_FIELDS.slice(3).map(({ field: name, label, unit }) => field(name, label, unit))}
        </div>
      </Surface>

      {/* Seção 4: Membros Inferiores */}
      <LimbSectionCard title="Membros Inferiores" subtitle="Esquerdo / Direito">
        {LOWER_LIMB_FIELDS.map(({ field: name, label, unit }) => field(name, label, unit))}
      </LimbSectionCard>
    </div>
  );
}
