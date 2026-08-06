'use client';

import React from 'react';
import { Avatar } from '@/components/atoms';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SidebarUserProfileProps {
  doctorName?: string;
  doctorRole?: string;
  isCollapsed?: boolean;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  isCollapsed = false,
}) => {
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="mx-auto flex size-10 cursor-pointer items-center justify-center rounded-control border border-border-subtle bg-surface-subtle p-2 transition-colors hover:border-text-muted">
            <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="p-2.5">
          <div className="text-style-legal font-bold text-text-primary">{doctorName}</div>
          <div className="text-style-legal text-text-muted">{doctorRole}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex w-full items-center gap-2.5 rounded-control border border-border-subtle bg-surface-subtle p-2">
      <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
      <div className="min-w-0 flex-1 truncate text-style-legal">
        <div className="truncate font-bold text-text-primary">{doctorName}</div>
        <div className="truncate text-style-legal text-text-muted">{doctorRole}</div>
      </div>
    </div>
  );
};
