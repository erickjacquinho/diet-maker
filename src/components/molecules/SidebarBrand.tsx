'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, Button } from '../atoms';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface SidebarBrandProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarBrand: React.FC<SidebarBrandProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3 w-full mb-6">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Link href="/pacientes" className="flex items-center justify-center rounded-xl transition-transform hover:scale-105">
              <Avatar initials="N" variant="charcoal" size="md" className="rounded-xl shrink-0 shadow-xs" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-xs bg-warm-charcoal text-white border-warm-charcoal">
            NutriDiet Pro Local
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-7 w-7 border border-warm-border text-warm-muted hover:text-warm-charcoal hover:bg-warm-inner rounded-lg p-0"
              aria-label="Expandir Menu"
            >
              <ChevronRight size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-xs">
            Expandir Menu
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6 w-full">
      <Link href="/pacientes" className="flex items-center space-x-3 overflow-hidden group">
        <Avatar initials="N" variant="charcoal" size="md" className="rounded-xl shrink-0 shadow-xs group-hover:scale-105 transition-transform" />
        <div className="transition-opacity duration-200 min-w-0">
          <h1 className="font-black text-base text-warm-charcoal tracking-tight leading-none truncate">NutriDiet</h1>
          <span className="text-[10px] font-bold text-warm-emerald uppercase tracking-wider block">Pro Local</span>
        </div>
      </Link>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 border border-warm-border p-0 text-warm-muted hover:text-warm-charcoal hover:bg-warm-inner rounded-xl shrink-0"
            aria-label="Recolher Menu"
          >
            <ChevronLeft size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-semibold text-xs">
          Recolher Menu
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
