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
  hasTarget?: boolean;  // Indica se existe meta cadastrada
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
  hasTarget = true,
  className,
}) => {
  const isTargetActive = hasTarget && Boolean(targetValue);
  const colorClass = TEXT_COLORS[macroColor] || 'text-primary';

  return (
    <Surface
      variant="subtle"
      density="standard"
      className={cn(
        'flex flex-col justify-between p-4 transition-colors duration-fast',
        !isTargetActive && 'opacity-subdued border border-dashed border-border-control-essential/50 bg-surface-subtle/40 shadow-none select-none',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between text-style-legal font-semibold text-text-muted mb-1.5 min-h-6">
          <span className={cn(colorClass, 'font-bold text-style-field-label', !isTargetActive && 'opacity-subdued')}>
            {label}
          </span>
          {statusBadgeText && (
            <Badge
              variant={isTargetActive ? statusBadgeVariant : 'default'}
              className={cn(
                'shrink-0 text-style-legal font-medium',
                (statusBadgeVariant === 'default' || !isTargetActive || statusBadgeText.startsWith('Faltam')) &&
                  'bg-surface border-border-subtle text-text-muted shadow-none'
              )}
            >
              {statusBadgeText}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-style-page-title font-bold text-text-primary my-1 tabular-nums">
          <span>{currentValue}</span>
          {isTargetActive ? (
            <span className="text-style-legal font-normal text-text-muted">/ {targetValue}</span>
          ) : gPerKgRatio ? (
            <span className="text-style-legal font-normal text-text-muted">
              {gPerKgRatio} <span className="text-style-chart-micro opacity-subdued">(sem meta g/kg)</span>
            </span>
          ) : subtitle ? (
            <span className="text-style-legal font-normal text-text-muted">{subtitle}</span>
          ) : (
            <span className="text-style-legal font-normal italic text-text-muted">Definir em Ajustar Metas</span>
          )}
          {isTargetActive && gPerKgRatio && (
            <span className={cn(colorClass, 'text-style-legal font-bold inline-flex items-baseline gap-1.5 ml-auto')}>
              <span>{gPerKgRatio}</span>
            </span>
          )}
        </div>
      </div>

      <div className="w-full">
        <ProgressBar
          value={isTargetActive ? percentage : 0}
          colorVariant={isTargetActive ? macroColor : 'primary'}
          className={!isTargetActive ? 'opacity-disabled' : ''}
          aria-label={`Progresso de ${label}`}
        />
      </div>
    </Surface>
  );
};
