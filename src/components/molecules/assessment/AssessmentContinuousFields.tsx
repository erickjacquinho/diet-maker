import React from 'react';
import { Scale, Ruler } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Surface, Badge } from '@/components/atoms';
import type { BodyAssessment } from '@/lib/patientsStore';
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
  className?: string;
}

export function AssessmentContinuousFields({
  draft,
  previousAssessment,
  updateNumericField,
  className = '',
}: AssessmentContinuousFieldsProps) {
  const isRequiredField = (name: NumericAssessmentField) => {
    return REQUIRED_ASSESSMENT_FIELDS.has(name);
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
      previousValue={previousAssessment ? previousAssessment[name] : undefined}
      isRequired={isRequiredField(name)}
      isAutoFilled={isFieldAutoFilled(name)}
      onChange={(value) => updateNumericField(name, value)}
      className={fieldClassName}
    />
  );

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Seção 1: Balança e Tronco Superior */}
      <Surface variant="subtle" className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-surface border border-border-subtle shadow-xs">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
          <Scale className="size-4 text-success" aria-hidden="true" />
          <span className={textStyle('caption-strong')}>Balança & Tronco Superior</span>
        </div>
        <div className="flex flex-col gap-3">
          {field('weightKg', 'Peso atual', 'kg')}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            {TRUNK_FIELDS.slice(0, 3).map(({ field: name, label, unit }) => field(name, label, unit))}
          </div>
        </div>
      </Surface>

      {/* Seção 2: Membros Superiores */}
      <LimbSectionCard title="Membros Superiores" subtitle="Esquerdo / Direito">
        {UPPER_LIMB_FIELDS.map(({ field: name, label, unit }) => field(name, label, unit))}
      </LimbSectionCard>

      {/* Seção 3: Circunferências Centrais / US Navy */}
      <Surface variant="subtle" className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-surface border border-border-subtle shadow-xs">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            <Ruler className="size-4 text-success" aria-hidden="true" />
            <span className={textStyle('caption-strong')}>Circunferências Centrais</span>
          </div>
          <Badge variant="blue" className="text-[10px] font-medium">
            Equação US Navy
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
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
