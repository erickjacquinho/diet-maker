import React from 'react';
import { PatientProfileHeader } from '../organisms/PatientProfileHeader';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';

export interface PatientBadgeHeaderProps {
  initials: string;
  name: string;
  weightKg?: number;
  goalDescription: string;
  age?: number;
  heightCm?: number;
  onAdjustGoals?: () => void;
  compact?: boolean;
  showAdjustGoals?: boolean;
}

export const PatientBadgeHeader: React.FC<PatientBadgeHeaderProps> = ({
  initials,
  name,
  weightKg,
  goalDescription,
  age,
  heightCm,
  onAdjustGoals,
  compact = false,
  showAdjustGoals = true,
}) => (
  <PatientProfileHeader.Root
    patient={{
      name,
      initials,
      objective: goalDescription,
      age,
      heightCm,
      weightKg,
    }}
    className={compact ? 'border-b-0 pb-0 gap-3' : 'border-b border-border-subtle pb-4 mb-5'}
  >
    <PatientProfileHeader.Identity>
      <PatientProfileHeader.Avatar size={compact ? 'md' : 'lg'} variant="inner" />
      <PatientProfileHeader.Info>
        <div className="flex flex-wrap items-center gap-2">
          <PatientProfileHeader.Name />
          <PatientProfileHeader.Badge />
        </div>
        <PatientProfileHeader.Meta />
      </PatientProfileHeader.Info>
    </PatientProfileHeader.Identity>
    {showAdjustGoals && onAdjustGoals && (
      <PatientProfileHeader.Actions>
        <Button
          onClick={onAdjustGoals}
          variant="secondary"
          size="compact"
          className="flex items-center gap-1.5"
        >
          <Edit3 size={13} aria-hidden="true" />
          <span>Ajustar Metas</span>
        </Button>
      </PatientProfileHeader.Actions>
    )}
  </PatientProfileHeader.Root>
);
