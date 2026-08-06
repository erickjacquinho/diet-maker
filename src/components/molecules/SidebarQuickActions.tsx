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
              variant="secondary"
              className="size-9 rounded-control border border-border-subtle text-text-primary hover:bg-surface-hover"
              aria-label="Salvar Arquivo Local"
              icon={<Save />}
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
              variant="secondary"
              className="size-9 rounded-control border border-border-subtle text-text-primary hover:bg-surface-hover"
              aria-label="Abrir Arquivo .diet"
              icon={<FolderOpen />}
            />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-style-legal font-semibold">
            Abrir Arquivo .diet
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-1.5">
      <Button onClick={onSave} variant="secondary" size="compact" className="flex h-8 flex-1 items-center justify-center gap-1 rounded-control text-style-legal font-semibold">
        <Save />
        <span>Salvar</span>
      </Button>
      <Button onClick={onOpen} variant="secondary" size="compact" className="flex h-8 flex-1 items-center justify-center gap-1 rounded-control text-style-legal font-semibold">
        <FolderOpen />
        <span>Abrir</span>
      </Button>
    </div>
  );
};
