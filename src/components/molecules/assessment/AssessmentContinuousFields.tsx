import React from 'react';
import { Scale, Ruler } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Surface } from '@/components/atoms';
import type { BodyAssessment } from '@/lib/patientsStore';
import type { NumericAssessmentField } from '@/hooks/useAssessmentForm';
import { AssessmentMeasurementField } from './AssessmentMeasurementField';
import { LimbSectionCard } from './LimbSectionCard';
import { TRUNK_FIELDS, UPPER_LIMB_FIELDS, LOWER_LIMB_FIELDS } from './assessmentFieldsConfig';

export interface AssessmentContinuousFieldsProps {
  draft: BodyAssessment;
  updateNumericField: (field: NumericAssessmentField, value: string) => void;
  className?: string;
}

export function AssessmentContinuousFields({
  draft,
  updateNumericField,
  className = '',
}: AssessmentContinuousFieldsProps) {
  const field = (name: NumericAssessmentField, label: string, unit: string, fieldClassName?: string) => (
    <AssessmentMeasurementField
      key={name}
      id={`assessment-${name}`}
      label={label}
      unit={unit}
      value={draft[name]}
      onChange={(value) => updateNumericField(name, value)}
      className={fieldClassName}
    />
  );

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Seção 1: Balança e Tronco Superior */}
      <Surface variant="subtle" className="flex flex-col gap-3 p-4 rounded-surface border border-border-subtle">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
          <Scale className="size-4 text-success" aria-hidden="true" />
          <span className={textStyle('caption-strong')}>Balança & Tronco Superior</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field('weightKg', 'Peso atual', 'kg', 'sm:col-span-2')}
          {TRUNK_FIELDS.slice(0, 3).map(({ field: name, label, unit }) => field(name, label, unit))}
        </div>
      </Surface>

      {/* Seção 2: Membros Superiores */}
      <LimbSectionCard title="Membros Superiores" subtitle="E / D (Auto-espelhado)">
        {UPPER_LIMB_FIELDS.map(({ field: name, label, unit }) => field(name, label, unit))}
      </LimbSectionCard>

      {/* Seção 3: Circunferências Centrais / US Navy */}
      <Surface variant="subtle" className="flex flex-col gap-3 p-4 rounded-surface border border-border-subtle">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
          <Ruler className="size-4 text-success" aria-hidden="true" />
          <span className={textStyle('caption-strong')}>Circunferências Centrais (US Navy)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRUNK_FIELDS.slice(3).map(({ field: name, label, unit }) => field(name, label, unit))}
        </div>
      </Surface>

      {/* Seção 4: Membros Inferiores */}
      <LimbSectionCard title="Membros Inferiores" subtitle="E / D (Auto-espelhado)">
        {LOWER_LIMB_FIELDS.map(({ field: name, label, unit }) => field(name, label, unit))}
      </LimbSectionCard>
    </div>
  );
}
