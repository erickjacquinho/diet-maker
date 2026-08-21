'use client';

import React from 'react';
import { FolderOpen, Save } from 'lucide-react';

import { Button, IconButton } from '@/components/atoms';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SidebarQuickActionsProps {
  onSave?: () => void;
  onOpen?: () => void;
  isCollapsed?: boolean;
}

const saveDisabledReason = 'A ação Salvar ainda não está disponível nesta tela.';
const openDisabledReason = 'A ação Abrir ainda não está disponível nesta tela.';

export const SidebarQuickActions: React.FC<SidebarQuickActionsProps> = ({
  onSave,
  onOpen,
  isCollapsed = false,
}) => {
  if (isCollapsed) {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <IconButton
              onClick={onSave}
              disabled={!onSave}
              variant="secondary"
              className="h-control-compact w-control-compact rounded-control border border-border-subtle text-text-primary hover:bg-surface-hover"
              aria-label="Salvar Arquivo Local"
              aria-describedby={!onSave ? 'sidebar-save-unavailable' : undefined}
              icon={<Save aria-hidden="true" className="size-4" />}
            />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-style-legal font-semibold">
            Salvar Arquivo Local
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <IconButton
              onClick={onOpen}
              disabled={!onOpen}
              variant="secondary"
              className="h-control-compact w-control-compact rounded-control border border-border-subtle text-text-primary hover:bg-surface-hover"
              aria-label="Abrir Arquivo .diet"
              aria-describedby={!onOpen ? 'sidebar-open-unavailable' : undefined}
              icon={<FolderOpen aria-hidden="true" className="size-4" />}
            />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-style-legal font-semibold">
            Abrir Arquivo .diet
          </TooltipContent>
        </Tooltip>

        {!onSave ? <span id="sidebar-save-unavailable" className="sr-only">{saveDisabledReason}</span> : null}
        {!onOpen ? <span id="sidebar-open-unavailable" className="sr-only">{openDisabledReason}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Button
        onClick={onSave}
        disabled={!onSave}
        variant="secondary"
        size="compact"
        aria-label="Salvar Arquivo Local"
        aria-describedby={!onSave ? 'sidebar-save-unavailable' : undefined}
        className="h-control-compact flex-1 items-center justify-center gap-2 rounded-control text-style-button-label-compact"
      >
        <Save aria-hidden="true" className="size-4" />
        <span>Salvar</span>
      </Button>
      <Button
        onClick={onOpen}
        disabled={!onOpen}
        variant="secondary"
        size="compact"
        aria-label="Abrir Arquivo .diet"
        aria-describedby={!onOpen ? 'sidebar-open-unavailable' : undefined}
        className="h-control-compact flex-1 items-center justify-center gap-2 rounded-control text-style-button-label-compact"
      >
        <FolderOpen aria-hidden="true" className="size-4" />
        <span>Abrir</span>
      </Button>
      {!onSave ? <span id="sidebar-save-unavailable" className="sr-only">{saveDisabledReason}</span> : null}
      {!onOpen ? <span id="sidebar-open-unavailable" className="sr-only">{openDisabledReason}</span> : null}
    </div>
  );
};
