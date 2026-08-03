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
}

export const PatientBadgeHeader: React.FC<PatientBadgeHeaderProps> = ({
  initials,
  name,
  weightKg,
  goalDescription,
  onAdjustGoals,
}) => (
  <div className="flex flex-col flex-row items-center justify-between pb-4 mb-5 border-b border-border-subtle gap-3">
    <div className="flex items-center gap-3.5">
      <Avatar initials={initials} size="lg" variant="inner" />
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-style-body-large font-bold text-text-primary">{name}</h3>
          <Badge variant="outline" className="text-style-legal font-bold px-2.5 py-0.5 border-border-subtle">
            {weightKg} kg
          </Badge>
        </div>
        <p className="text-style-legal text-text-secondary">{goalDescription}</p>
      </div>
    </div>
    <Button
      onClick={onAdjustGoals}
      variant="secondary"
      size="sm"
      className="flex items-center gap-1.5"
    >
      <Edit3 size={13} />
      <span>Ajustar Metas</span>
    </Button>
  </div>
);

