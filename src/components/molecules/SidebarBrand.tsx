'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Avatar, IconButton } from '@/components/atoms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface SidebarBrandProps {
  title?: string;
  subtitle?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarBrand: React.FC<SidebarBrandProps> = ({
  title = 'NutriDiet',
  subtitle = 'Pro Local',
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const toggleCollapse = onToggleCollapse ?? (() => undefined);

  return (
    <TooltipProvider delayDuration={150}>
      {isCollapsed ? (
        <div className="flex w-full flex-col items-center gap-3">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Link
                href="/pacientes"
                aria-label={`${title} ${subtitle}`}
                className="flex items-center justify-center rounded-control"
              >
                <Avatar initials="N" variant="charcoal" size="md" className="shrink-0 rounded-control shadow-floating" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-style-legal font-semibold bg-primary text-on-primary border-primary">
              {title} {subtitle}
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <IconButton
                variant="quiet"
                onClick={toggleCollapse}
                className="h-control-compact w-control-compact rounded-control border border-border-subtle p-0 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                aria-label="Expandir Menu"
                icon={<ChevronRight className="size-4" />}
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-style-legal font-semibold">
              Expandir Menu
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between gap-3">
          <Link href="/pacientes" className="group flex min-w-0 items-center gap-3 overflow-hidden">
            <Avatar initials="N" variant="charcoal" size="md" className="shrink-0 rounded-control shadow-floating" />
            <div className="min-w-0">
              <span className="block truncate text-style-subsection-title font-bold text-text-primary">{title}</span>
              <span className="block text-style-caption font-semibold tracking-overline text-success">{subtitle}</span>
            </div>
          </Link>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <IconButton
                variant="quiet"
                onClick={toggleCollapse}
                className="h-control-standard w-control-standard shrink-0 rounded-control border border-border-subtle p-0 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                aria-label="Recolher Menu"
                icon={<ChevronLeft className="size-4" />}
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-style-legal font-semibold">
              Recolher Menu
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </TooltipProvider>
  );
};
