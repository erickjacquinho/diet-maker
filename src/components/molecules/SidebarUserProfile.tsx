'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronsUpDown, FileInput, FileOutput, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { Avatar, Button, IconButton } from '@/components/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
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
  onOpenAccount?: () => void;
  onExportBackup?: () => void | Promise<void>;
  onRestoreBackup?: () => void | Promise<void>;
  onSignOut?: () => void | Promise<void>;
  isExporting?: boolean;
  isRestoring?: boolean;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  isCollapsed = false,
  onOpenAccount,
  onExportBackup,
  onRestoreBackup,
  onSignOut,
  isExporting = false,
  isRestoring = false,
}) => {
  const accountLabel = `Abrir menu de conta de ${doctorName}`;
  const hasDropdown = Boolean(onOpenAccount || onExportBackup || onRestoreBackup || onSignOut);
  const hasAction = Boolean(onOpenAccount || onExportBackup || onRestoreBackup || onSignOut);

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
            <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 text-style-legal">
              <Link href="/pacientes">
                <LayoutDashboard className="size-4 text-text-muted" aria-hidden="true" />
                <span>Visão geral</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenAccount} className="flex cursor-pointer items-center gap-2 text-style-legal">
              <Settings className="size-4 text-text-muted" aria-hidden="true" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onExportBackup ? (
              <DropdownMenuItem disabled={isExporting || isRestoring} onClick={onExportBackup} className="flex cursor-pointer items-center gap-2 text-style-legal">
                <FileOutput className="size-4 text-text-muted" aria-hidden="true" />
                <span>Exportar backup</span>
              </DropdownMenuItem>
            ) : null}
            {onRestoreBackup ? (
              <DropdownMenuItem disabled={isExporting || isRestoring} onClick={onRestoreBackup} className="flex cursor-pointer items-center gap-2 text-style-legal">
                <FileInput className="size-4 text-text-muted" aria-hidden="true" />
                <span>Importar backup</span>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="flex cursor-pointer items-center gap-2 text-style-legal text-error">
              <LogOut className="size-4" aria-hidden="true" />
              <span>Sair</span>
            </DropdownMenuItem>
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
          <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 text-style-legal">
            <Link href="/pacientes">
              <LayoutDashboard className="size-4 text-text-muted" aria-hidden="true" />
              <span>Visão geral</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenAccount} className="flex cursor-pointer items-center gap-2 text-style-legal">
            <Settings className="size-4 text-text-muted" aria-hidden="true" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {onExportBackup ? (
            <DropdownMenuItem disabled={isExporting || isRestoring} onClick={onExportBackup} className="flex cursor-pointer items-center gap-2 text-style-legal">
              <FileOutput className="size-4 text-text-muted" aria-hidden="true" />
              <span>Exportar backup</span>
            </DropdownMenuItem>
          ) : null}
          {onRestoreBackup ? (
            <DropdownMenuItem disabled={isExporting || isRestoring} onClick={onRestoreBackup} className="flex cursor-pointer items-center gap-2 text-style-legal">
              <FileInput className="size-4 text-text-muted" aria-hidden="true" />
              <span>Importar backup</span>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="flex cursor-pointer items-center gap-2 text-style-legal text-error">
            <LogOut className="size-4" aria-hidden="true" />
            <span>Sair</span>
          </DropdownMenuItem>
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
