'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  href,
  label,
  icon: Icon,
  isActive: customIsActive,
  isCollapsed = false,
}) => {
  const isActive = customIsActive ?? false;

  const link = (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      className={cn('h-control-standard', isCollapsed ? 'mx-auto justify-center' : undefined)}
    >
      <Link href={href} aria-label={isCollapsed ? label : undefined} aria-current={isActive ? 'page' : undefined}>
        <Icon aria-hidden="true" className="size-4" />
        <span className={isCollapsed ? 'sr-only' : 'truncate'}>{label}</span>
      </Link>
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem>
      {isCollapsed ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="bg-primary text-on-primary border-primary">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        link
      )}
    </SidebarMenuItem>
  );
};
