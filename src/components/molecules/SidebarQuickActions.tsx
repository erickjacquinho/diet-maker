'use client';

import React from 'react';
import { Download, Upload } from 'lucide-react';

import { Button, IconButton } from '@/components/atoms';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SidebarQuickActionsProps {
  onExportBackup?: () => void | Promise<void>;
  onRestoreBackup?: () => void | Promise<void>;
  isExporting?: boolean;
  isRestoring?: boolean;
  isCollapsed?: boolean;
}

const exportDisabledReason = 'A ação Exportar backup ainda não está disponível nesta tela.';
const restoreDisabledReason = 'A ação Restaurar backup ainda não está disponível nesta tela.';

export const SidebarQuickActions: React.FC<SidebarQuickActionsProps> = ({
  onExportBackup,
  onRestoreBackup,
  isExporting = false,
  isRestoring = false,
  isCollapsed = false,
}) => {
  const exportDisabled = !onExportBackup || isExporting || isRestoring;
  const restoreDisabled = !onRestoreBackup || isExporting || isRestoring;

  if (isCollapsed) {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <IconButton
              type="button"
              onClick={onExportBackup}
              loading={isExporting}
              disabled={exportDisabled}
              variant="secondary"
              className="h-control-compact w-control-compact rounded-control border border-border-subtle text-text-primary hover:bg-surface-hover"
              aria-label="Exportar backup local"
              aria-describedby={!onExportBackup ? 'sidebar-export-unavailable' : undefined}
              icon={<Download aria-hidden="true" className="size-4" />}
            />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-style-legal font-semibold">
            Exportar backup
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <IconButton
              type="button"
              onClick={onRestoreBackup}
              loading={isRestoring}
              disabled={restoreDisabled}
              variant="secondary"
              className="h-control-compact w-control-compact rounded-control border border-border-subtle text-text-primary hover:bg-surface-hover"
              aria-label="Restaurar backup local"
              aria-describedby={!onRestoreBackup ? 'sidebar-restore-unavailable' : undefined}
              icon={<Upload aria-hidden="true" className="size-4" />}
            />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-style-legal font-semibold">
            Restaurar backup
          </TooltipContent>
        </Tooltip>

        {!onExportBackup ? <span id="sidebar-export-unavailable" className="sr-only">{exportDisabledReason}</span> : null}
        {!onRestoreBackup ? <span id="sidebar-restore-unavailable" className="sr-only">{restoreDisabledReason}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Button
        type="button"
        onClick={onExportBackup}
        loading={isExporting}
        disabled={exportDisabled}
        variant="secondary"
        size="compact"
        aria-label="Exportar backup local"
        aria-describedby={!onExportBackup ? 'sidebar-export-unavailable' : undefined}
        className="h-control-compact flex-1 items-center justify-center gap-2 rounded-control text-style-button-label-compact"
      >
        <Download aria-hidden="true" className="size-4" />
        <span>Exportar backup</span>
      </Button>
      <Button
        type="button"
        onClick={onRestoreBackup}
        loading={isRestoring}
        disabled={restoreDisabled}
        variant="secondary"
        size="compact"
        aria-label="Restaurar backup local"
        aria-describedby={!onRestoreBackup ? 'sidebar-restore-unavailable' : undefined}
        className="h-control-compact flex-1 items-center justify-center gap-2 rounded-control text-style-button-label-compact"
      >
        <Upload aria-hidden="true" className="size-4" />
        <span>Restaurar backup</span>
      </Button>
      {!onExportBackup ? <span id="sidebar-export-unavailable" className="sr-only">{exportDisabledReason}</span> : null}
      {!onRestoreBackup ? <span id="sidebar-restore-unavailable" className="sr-only">{restoreDisabledReason}</span> : null}
    </div>
  );
};
