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
  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-warm-border gap-3">
    <div className="flex items-center space-x-3.5">
      <Avatar initials={initials} size="lg" variant="inner" />
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-black text-warm-charcoal">{name}</h3>
          <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 border-warm-border">
            {weightKg} kg
          </Badge>
        </div>
        <p className="text-xs text-warm-secondary">{goalDescription}</p>
      </div>
    </div>
    <Button
      onClick={onAdjustGoals}
      variant="secondary"
      size="sm"
      className="flex items-center space-x-1.5"
    >
      <Edit3 size={13} />
      <span>Ajustar Metas</span>
    </Button>
  </div>
);

