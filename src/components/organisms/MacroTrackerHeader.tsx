import React from 'react';
import { PatientBadgeHeader, MacroMetricCard, MacroMetricCardProps } from '../molecules';
import { Surface } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface MacroTrackerHeaderProps {
  patientInitials?: string;
  patientName?: string;
  patientWeightKg?: number;
  patientGoalDescription?: string;
  patientAge?: number;
  patientHeightCm?: number;
  patientGender?: string;
  onAdjustGoals?: () => void;
  metrics: MacroMetricCardProps[];
  showPatientContext?: boolean;
  className?: string;
}

export const MacroTrackerHeader: React.FC<MacroTrackerHeaderProps> = ({
  patientInitials,
  patientName,
  patientWeightKg,
  patientGoalDescription,
  patientAge,
  patientHeightCm,
  patientGender,
  onAdjustGoals,
  metrics,
  showPatientContext = false,
  className,
}) => {
  return (
    <Surface
      variant="default"
      density="standard"
      className={cn('p-5 sm:p-6 flex flex-col gap-4', className)}
      aria-label="Resumo de metas nutricionais"
    >
      {showPatientContext && patientName && (
        <PatientBadgeHeader
          initials={patientInitials || 'P'}
          name={patientName}
          weightKg={patientWeightKg || 0}
          goalDescription={patientGoalDescription || 'Prescrição Alimentar'}
          age={patientAge}
          heightCm={patientHeightCm}
          onAdjustGoals={onAdjustGoals}
        />
      )}

      <div
        data-testid="macro-metrics-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metrics.map((metric, index) => (
          <MacroMetricCard key={`${metric.label}-${index}`} {...metric} />
        ))}
      </div>
    </Surface>
  );
};
