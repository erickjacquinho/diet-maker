'use client';

import React from 'react';
import { Avatar, Button, IconButton } from '@/components/atoms';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SidebarUserProfileProps {
  doctorName?: string;
  doctorRole?: string;
  isCollapsed?: boolean;
  onOpenAccount?: () => void;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  isCollapsed = false,
  onOpenAccount,
}) => {
  const accountLabel = `Abrir menu de conta de ${doctorName}`;

  if (isCollapsed) {
    const trigger = onOpenAccount ? (
      <IconButton
        onClick={onOpenAccount}
        variant="quiet"
        aria-label={accountLabel}
        className="mx-auto size-10 rounded-control border border-border-subtle bg-surface-subtle p-2 text-text-primary hover:border-text-muted"
        icon={<Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />}
      />
    ) : (
      <div className="mx-auto flex size-10 items-center justify-center rounded-control border border-border-subtle bg-surface-subtle p-2">
        <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
      </div>
    );

    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {trigger}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="p-2.5">
          <div className="text-style-legal font-bold text-text-primary">{doctorName}</div>
          <div className="text-style-legal text-text-muted">{doctorRole}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const profileContent = (
    <>
      <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
      <div className="min-w-0 flex-1 truncate text-style-legal">
        <div className="truncate font-bold text-text-primary">{doctorName}</div>
        <div className="truncate text-style-legal text-text-muted">{doctorRole}</div>
      </div>
    </>
  );

  return onOpenAccount ? (
    <Button
      type="button"
      variant="quiet"
      size="standard"
      onClick={onOpenAccount}
      aria-label={accountLabel}
      className="flex h-auto w-full items-center justify-start gap-2.5 rounded-control border border-border-subtle bg-surface-subtle p-2 text-left hover:border-text-muted hover:bg-surface-subtle"
    >
      {profileContent}
    </Button>
  ) : (
    <div className="flex w-full items-center gap-2.5 rounded-control border border-border-subtle bg-surface-subtle p-2">
      {profileContent}
    </div>
  );
};
