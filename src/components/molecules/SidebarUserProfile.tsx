'use client';

import React from 'react';
import { ChevronsUpDown, FolderOpen, Save, User } from 'lucide-react';
import { Avatar, Button, IconButton } from '@/components/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SidebarUserProfileProps {
  doctorName?: string;
  doctorRole?: string;
  isCollapsed?: boolean;
  onOpenAccount?: () => void;
  onSave?: () => void;
  onOpen?: () => void;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  isCollapsed = false,
  onOpenAccount,
  onSave,
  onOpen,
}) => {
  const accountLabel = `Abrir menu de conta de ${doctorName}`;
  const hasDropdown = Boolean(onSave || onOpen);
  const hasAction = Boolean(onOpenAccount || onSave || onOpen);

  if (isCollapsed) {
    if (!hasAction) {
      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div className="mx-auto flex size-9 items-center justify-center rounded-control border border-border-subtle bg-surface-subtle">
              <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="p-2.5">
            <div className="text-style-legal font-bold text-text-primary">{doctorName}</div>
            <div className="text-style-caption text-text-muted">{doctorRole}</div>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (hasDropdown) {
      return (
        <DropdownMenu>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <IconButton
                  variant="quiet"
                  aria-label={accountLabel}
                  className="mx-auto size-9 rounded-control border border-border-subtle bg-surface-subtle p-0 text-text-primary hover:border-text-muted hover:bg-surface-hover"
                  icon={<Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />}
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
                <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-style-legal font-bold text-text-primary">{doctorName}</p>
                  <p className="truncate text-style-caption text-text-muted">{doctorRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onSave ? (
              <DropdownMenuItem onClick={onSave} className="flex cursor-pointer items-center gap-2 text-style-legal">
                <Save className="size-4 text-text-muted" aria-hidden="true" />
                <span>Salvar Arquivo Local</span>
                <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
              </DropdownMenuItem>
            ) : null}
            {onOpen ? (
              <DropdownMenuItem onClick={onOpen} className="flex cursor-pointer items-center gap-2 text-style-legal">
                <FolderOpen className="size-4 text-text-muted" aria-hidden="true" />
                <span>Abrir Arquivo .diet</span>
                <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
              </DropdownMenuItem>
            ) : null}
            {onOpenAccount ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenAccount} className="flex cursor-pointer items-center gap-2 text-style-legal">
                  <User className="size-4 text-text-muted" aria-hidden="true" />
                  <span>Configurações da Conta</span>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <IconButton
            onClick={onOpenAccount}
            variant="quiet"
            aria-label={accountLabel}
            className="mx-auto size-9 rounded-control border border-border-subtle bg-surface-subtle p-0 text-text-primary hover:border-text-muted hover:bg-surface-hover"
            icon={<Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />}
          />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="p-2.5">
          <div className="text-style-legal font-bold text-text-primary">{doctorName}</div>
          <div className="text-style-caption text-text-muted">{doctorRole}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const profileDetails = (
    <>
      <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-style-legal font-bold text-text-primary leading-tight">{doctorName}</div>
        <div className="truncate text-style-caption text-text-muted leading-tight">{doctorRole}</div>
      </div>
    </>
  );

  if (!hasAction) {
    return (
      <div className="flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-style-legal">
        {profileDetails}
      </div>
    );
  }

  if (hasDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
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
              <Avatar initials="DR" variant="emerald" size="sm" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-style-legal font-bold text-text-primary">{doctorName}</p>
                <p className="truncate text-style-caption text-text-muted">{doctorRole}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onSave ? (
            <DropdownMenuItem onClick={onSave} className="flex cursor-pointer items-center gap-2 text-style-legal">
              <Save className="size-4 text-text-muted" aria-hidden="true" />
              <span>Salvar Arquivo Local</span>
              <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : null}
          {onOpen ? (
            <DropdownMenuItem onClick={onOpen} className="flex cursor-pointer items-center gap-2 text-style-legal">
              <FolderOpen className="size-4 text-text-muted" aria-hidden="true" />
              <span>Abrir Arquivo .diet</span>
              <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : null}
          {onOpenAccount ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenAccount} className="flex cursor-pointer items-center gap-2 text-style-legal">
                <User className="size-4 text-text-muted" aria-hidden="true" />
                <span>Configurações da Conta</span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      type="button"
      variant="quiet"
      size="standard"
      onClick={onOpenAccount}
      aria-label={accountLabel}
      className="flex h-10 w-full items-center justify-start gap-2.5 rounded-control px-2 py-1.5 text-left hover:bg-surface-hover transition-colors"
    >
      {profileDetails}
    </Button>
  );
};
