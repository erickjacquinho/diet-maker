'use client';

import React from 'react';
import { Avatar } from '../atoms';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface SidebarUserProfileProps {
  doctorName?: string;
  doctorRole?: string;
  isCollapsed: boolean;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  isCollapsed,
}) => {
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-2 bg-warm-inner border border-warm-border rounded-xl size-10 mx-auto cursor-pointer hover:border-warm-muted transition-colors">
            <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="p-2.5">
          <div className="text-xs font-bold text-warm-charcoal">{doctorName}</div>
          <div className="text-[10px] text-warm-muted">{doctorRole}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center p-2 bg-warm-inner border border-warm-border rounded-xl gap-2.5 w-full">
      <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
      <div className="text-xs truncate min-w-0 flex-1">
        <div className="font-bold text-warm-charcoal truncate">{doctorName}</div>
        <div className="text-[10px] text-warm-muted truncate">{doctorRole}</div>
      </div>
    </div>
  );
};
