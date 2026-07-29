import React from 'react';
import { PatientBadgeHeader, MacroMetricCard, MacroMetricCardProps } from '../molecules';
import { Card, CardContent } from '@/components/ui/card';

export interface MacroTrackerHeaderProps {
  patientInitials: string;
  patientName: string;
  patientWeightKg: number;
  patientGoalDescription: string;
  onAdjustGoals?: () => void;
  metrics: MacroMetricCardProps[];
}

export const MacroTrackerHeader: React.FC<MacroTrackerHeaderProps> = ({
  patientInitials,
  patientName,
  patientWeightKg,
  patientGoalDescription,
  onAdjustGoals,
  metrics,
}) => {
  return (
    <Card className="bg-warm-card border-warm-border rounded-2xl p-0">
      <CardContent className="p-6">
        <PatientBadgeHeader
          initials={patientInitials}
          name={patientName}
          weightKg={patientWeightKg}
          goalDescription={patientGoalDescription}
          onAdjustGoals={onAdjustGoals}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MacroMetricCard key={index} {...metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

