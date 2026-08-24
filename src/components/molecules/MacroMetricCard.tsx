import React from 'react';
import { Badge, BadgeProps, ProgressBar, Surface } from '../atoms';
import { cn } from '@/lib/utils';

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
  subtitle?: string;    // Texto auxiliar alternativo quando não há proporção g/kg
  className?: string;
}

const TEXT_COLORS: Record<MacroMetricCardProps['macroColor'], string> = {
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
  subtitle,
  className,
}) => {
  const colorClass = TEXT_COLORS[macroColor] || 'text-primary';

  return (
    <Surface
      variant="subtle"
      density="standard"
      className={cn('flex flex-col justify-between p-4', className)}
    >
      <div>
        <div className="flex items-center justify-between text-style-legal font-semibold text-text-muted mb-1.5 min-h-6">
          <span className={cn(colorClass, 'font-bold text-style-field-label')}>{label}</span>
          {statusBadgeText && (
            <Badge variant={statusBadgeVariant} className="shrink-0 text-style-legal">
              {statusBadgeText}
            </Badge>
          )}
        </div>

        <div className="text-style-page-title font-bold text-text-primary my-1 tabular-nums">
          {currentValue} <span className="text-style-legal font-normal text-text-muted">/ {targetValue}</span>
        </div>

        <div className="min-h-5 mb-3 flex items-center text-style-legal">
          {gPerKgRatio ? (
            <div className={cn(colorClass, 'font-bold tabular-nums')}>
              {gPerKgRatio}{' '}
              {gPerKgMeta !== undefined && (
                <span className="font-normal text-text-muted">(meta: {gPerKgMeta})</span>
              )}
            </div>
          ) : subtitle ? (
            <span className="text-text-muted font-normal">{subtitle}</span>
          ) : (
            <span className="text-text-muted font-normal">Meta calórica diária</span>
          )}
        </div>
      </div>

      <div className="w-full">
        <ProgressBar
          value={percentage}
          colorVariant={macroColor}
          aria-label={`Progresso de ${label}`}
        />
      </div>
    </Surface>
  );
};
