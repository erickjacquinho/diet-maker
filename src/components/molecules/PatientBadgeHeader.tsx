import React from 'react';
import { Avatar } from '../atoms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3 } from 'lucide-react';

export interface PatientBadgeHeaderProps {
  initials: string;
  name: string;
  weightKg: number;
  goalDescription: string;
  onAdjustGoals?: () => void;
  compact?: boolean;
  showAdjustGoals?: boolean;
}

export const PatientBadgeHeader: React.FC<PatientBadgeHeaderProps> = ({
  initials,
  name,
  weightKg,
  goalDescription,
  onAdjustGoals,
  compact = false,
  showAdjustGoals = true,
}) => (
  <div
    className={compact
      ? 'flex min-w-0 items-center gap-3.5'
      : 'flex flex-row items-center justify-between gap-3 border-b border-border-subtle pb-4 mb-5'}
  >
    <div className="flex items-center gap-3.5">
      <Avatar initials={initials} size="lg" variant="inner" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-style-body-large font-bold text-text-primary">{name}</h3>
          <Badge variant="outline" className="text-style-legal font-bold px-2.5 py-0.5 border-border-subtle">
            {weightKg} kg
          </Badge>
        </div>
        <p className="text-style-legal text-text-secondary">{goalDescription}</p>
      </div>
    </div>
    {showAdjustGoals && (
      <Button
        onClick={onAdjustGoals}
        variant="secondary"
        size="compact"
        className="flex items-center gap-1.5"
      >
        <Edit3 size={13} aria-hidden="true" />
        <span>Ajustar Metas</span>
      </Button>
    )}
  </div>
);

