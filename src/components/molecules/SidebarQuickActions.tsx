'use client';

import React from 'react';
import { Button } from '../atoms';
import { Save, FolderOpen } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface SidebarQuickActionsProps {
  onSave?: () => void;
  onOpen?: () => void;
  isCollapsed: boolean;
}

export const SidebarQuickActions: React.FC<SidebarQuickActionsProps> = ({
  onSave,
  onOpen,
  isCollapsed,
}) => {
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              onClick={onSave}
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-xl border border-warm-border text-warm-charcoal hover:bg-warm-inner"
              aria-label="Salvar Arquivo Local"
            >
              <Save size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-semibold text-xs">
            Salvar Arquivo Local
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              onClick={onOpen}
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-xl border border-warm-border text-warm-charcoal hover:bg-warm-inner"
              aria-label="Abrir Arquivo .diet"
            >
              <FolderOpen size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-semibold text-xs">
            Abrir Arquivo .diet
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-full">
      <Button
        onClick={onSave}
        variant="secondary"
        size="sm"
        className="flex-1 flex items-center justify-center gap-1 text-[11px] h-8 rounded-xl font-semibold"
      >
        <Save size={14} />
        <span>Salvar</span>
      </Button>
      <Button
        onClick={onOpen}
        variant="secondary"
        size="sm"
        className="flex-1 flex items-center justify-center gap-1 text-[11px] h-8 rounded-xl font-semibold"
      >
        <FolderOpen size={14} />
        <span>Abrir</span>
      </Button>
    </div>
  );
};
