import React from 'react';
import { Badge, ProgressBar } from '../atoms';
import { Card, CardContent } from '@/components/ui/card';

export interface MacroMetricCardProps {
  label: string;
  currentValue: string; // Ex: "168g" ou "2.450"
  targetValue: string;  // Ex: "165g" ou "2.400 kcal"
  statusBadgeText?: string;
  statusBadgeVariant?: 'emerald' | 'rose' | 'amber' | 'teal' | 'blue' | 'neutral';
  percentage: number;   // 0 a 100+
  gPerKgRatio?: string; // Ex: "2.03 g/kg"
  gPerKgMeta?: string;  // Ex: "2.0"
  macroColor: 'emerald' | 'rose' | 'amber' | 'teal' | 'blue';
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
  const textColors = {
    emerald: 'text-warm-emerald',
    rose: 'text-warm-rose',
    amber: 'text-warm-amber',
    teal: 'text-warm-teal',
    blue: 'text-blue-600',
  };

  return (
    <Card className="bg-warm-inner border-warm-border p-0">
      <CardContent className="p-4">
        <div className="flex justify-between text-xs font-semibold text-warm-muted mb-1">
          <span className={`${textColors[macroColor]} font-bold`}>{label}</span>
          {statusBadgeText && (
            <Badge variant={statusBadgeVariant}>{statusBadgeText}</Badge>
          )}
        </div>

        <div className="text-3xl font-black text-warm-charcoal my-1">
          {currentValue} <span className="text-xs font-normal text-warm-muted">/ {targetValue}</span>
        </div>

        {gPerKgRatio ? (
          <div className={`text-xs font-bold ${textColors[macroColor]} mb-2`}>
            {gPerKgRatio} <span className="text-[10px] text-warm-muted font-normal">(meta: {gPerKgMeta})</span>
          </div>
        ) : (
          <div className="h-4 mb-2" /> // Spacing preservation
        )}

        <ProgressBar value={percentage} colorVariant={macroColor} />
      </CardContent>
    </Card>
  );
};
