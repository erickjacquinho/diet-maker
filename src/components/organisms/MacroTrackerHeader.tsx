import React from 'react';
import { PatientBadgeHeader, MacroMetricCard, MacroMetricCardProps } from '../molecules';
import { Surface } from '@/components/atoms';

export interface MacroTrackerHeaderProps {
  patientInitials: string;
  patientName: string;
  patientWeightKg: number;
  patientGoalDescription: string;
  patientAge?: number;
  patientHeightCm?: number;
  patientGender?: string;
  onAdjustGoals?: () => void;
  metrics: MacroMetricCardProps[];
  showPatientContext?: boolean;
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
  showPatientContext = true,
}) => {
  return (
    <Surface variant="default" density="highlight" className="p-0">
      <div className="p-6">
        {showPatientContext && (
          <PatientBadgeHeader
            initials={patientInitials}
            name={patientName}
            weightKg={patientWeightKg}
            goalDescription={patientGoalDescription}
            age={patientAge}
            heightCm={patientHeightCm}
            onAdjustGoals={onAdjustGoals}
          />
        )}

        <div className="grid grid-cols-1 grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MacroMetricCard key={index} {...metric} />
          ))}
        </div>
      </div>
    </Surface>
  );
};
