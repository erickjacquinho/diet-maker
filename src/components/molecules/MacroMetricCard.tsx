import React from 'react';
import { Badge, BadgeProps, ProgressBar, Surface } from '../atoms';

export interface MacroMetricCardProps {
  label: string;
  currentValue: string; // Ex: "168g" ou "2.450"
  targetValue: string;  // Ex: "165g" ou "2.400 kcal"
  statusBadgeText?: string;
  statusBadgeVariant?: BadgeProps['variant'];
  percentage: number;   // 0 a 100+
  gPerKgRatio?: string; // Ex: "2.03 g/kg"
  gPerKgMeta?: string;  // Ex: "2.0"
  macroColor: 'emerald' | 'rose' | 'amber' | 'teal' | 'blue' | 'protein' | 'carbohydrate' | 'fat' | 'primary';
}

export const MacroMetricCard: React.FC<MacroMetricCardProps> = ({
  label,
  currentValue,
  targetValue,
  statusBadgeText,
  statusBadgeVariant = 'emerald',
  percentage,
  gPerKgRatio,
  gPerKgMeta,
  macroColor,
}) => {
  const textColors: Record<string, string> = {
    emerald: 'text-success',
    rose: 'text-error',
    amber: 'text-warning',
    teal: 'text-info',
    blue: 'text-primary',
    primary: 'text-primary',
    protein: 'text-macro-protein',
    carbohydrate: 'text-macro-carbohydrate',
    fat: 'text-macro-fat',
  };

  return (
    <Surface variant="subtle" density="standard" className="p-0">
      <div className="p-4">
        <div className="flex justify-between text-style-legal font-semibold text-text-muted mb-1">
          <span className={`${textColors[macroColor]} font-bold`}>{label}</span>
          {statusBadgeText && (
            <Badge variant={statusBadgeVariant}>{statusBadgeText}</Badge>
          )}
        </div>

        <div className="text-style-page-title font-bold text-text-primary my-1">
          {currentValue} <span className="text-style-legal font-normal text-text-muted">/ {targetValue}</span>
        </div>

        {gPerKgRatio ? (
          <div className={`text-style-legal font-bold ${textColors[macroColor]} mb-2`}>
            {gPerKgRatio} <span className="text-style-legal text-text-muted font-normal">(meta: {gPerKgMeta})</span>
          </div>
        ) : (
          <div className="h-4 mb-2" /> // Spacing preservation
        )}

        <ProgressBar value={percentage} colorVariant={macroColor} />
      </div>
    </Surface>
  );
};
