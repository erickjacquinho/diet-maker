'use client';

import React from 'react';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { Avatar, Button, IconButton } from '@/components/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SidebarUserProfileProps {
  doctorName?: string;
  doctorRole?: string;
  isCollapsed?: boolean;
  onOpenAccount?: (trigger?: HTMLButtonElement) => void;
  onSignOut?: () => void | Promise<void>;
}

/** Two-letter initials for the avatar ("Ana Maria Souza" → "AS"). */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'DR';
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] ?? '' : Array.from(words[0])[1] ?? '';
  return `${first}${last}`.toLocaleUpperCase('pt-BR');
}

function ProfileMenuItems({ onOpenAccount, onSignOut }: Pick<SidebarUserProfileProps, 'onOpenAccount' | 'onSignOut'>) {
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => onOpenAccount?.()} className="flex cursor-pointer items-center gap-2 text-style-legal">
          <Settings className="size-4 text-text-muted" aria-hidden="true" />
          <span>Configurações</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={onSignOut} className="flex cursor-pointer items-center gap-2 text-style-legal text-error">
          <LogOut className="size-4" aria-hidden="true" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  isCollapsed = false,
  onOpenAccount,
  onSignOut,
}) => {
  const accountLabel = `Abrir menu de conta de ${doctorName}`;
  const initials = getInitials(doctorName);
  const accountTriggerRef = React.useRef<HTMLButtonElement>(null);
  const handleOpenAccount = () => onOpenAccount?.(accountTriggerRef.current ?? undefined);
  const hasAction = Boolean(onOpenAccount || onSignOut);

  if (isCollapsed && !hasAction) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="mx-auto flex size-9 items-center justify-center rounded-control border border-border-subtle bg-surface-subtle">
            <Avatar initials={initials} variant="emerald" size="sm" className="shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="p-2.5">
          <div className="text-style-legal font-bold text-text-primary">{doctorName}</div>
          <div className="text-style-caption text-text-muted">{doctorRole}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <IconButton
                ref={accountTriggerRef}
                variant="quiet"
                aria-label={accountLabel}
                className="mx-auto size-9 rounded-control border border-border-subtle bg-surface-subtle p-0 text-text-primary hover:border-text-muted hover:bg-surface-hover"
                icon={<Avatar initials={initials} variant="emerald" size="sm" className="shrink-0" />}
              />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="p-2.5">
            <div className="text-style-legal font-bold text-text-primary">{doctorName}</div>
            <div className="text-style-caption text-text-muted">{doctorRole}</div>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-56 p-1.5 shadow-floating">
          <DropdownMenuLabel className="p-1">
            <div className="flex items-center gap-2.5">
              <Avatar initials={initials} variant="emerald" size="sm" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-style-legal font-bold text-text-primary">{doctorName}</p>
                <p className="truncate text-style-caption text-text-muted">{doctorRole}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ProfileMenuItems onOpenAccount={handleOpenAccount} onSignOut={onSignOut} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const profileDetails = (
    <>
      <Avatar initials={initials} variant="emerald" size="sm" className="shrink-0" />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-style-legal font-bold text-text-primary leading-tight">{doctorName}</div>
        <div className="truncate text-style-caption text-text-muted leading-tight">{doctorRole}</div>
      </div>
    </>
  );

  if (!hasAction) {
    return <div className="flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-style-legal">{profileDetails}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={accountTriggerRef}
          type="button"
          variant="quiet"
          size="standard"
          aria-label={accountLabel}
          className="flex h-10 w-full items-center justify-start gap-2.5 rounded-control px-2 py-1.5 text-left hover:bg-surface-hover transition-colors group"
        >
          {profileDetails}
          <ChevronsUpDown className="size-4 shrink-0 text-text-muted group-hover:text-text-primary" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56 p-1.5 shadow-floating">
        <DropdownMenuLabel className="p-1">
          <div className="flex items-center gap-2.5">
            <Avatar initials={initials} variant="emerald" size="sm" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-style-legal font-bold text-text-primary">{doctorName}</p>
              <p className="truncate text-style-caption text-text-muted">{doctorRole}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ProfileMenuItems onOpenAccount={handleOpenAccount} onSignOut={onSignOut} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
