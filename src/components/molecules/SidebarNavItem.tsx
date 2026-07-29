'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
}) => {
  const activeClass = isActive
    ? 'bg-warm-charcoal text-white font-bold shadow-xs'
    : 'text-warm-muted hover:text-warm-charcoal hover:bg-warm-inner font-semibold';

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            aria-label={label}
            className={`flex items-center justify-center size-10 rounded-xl text-xs transition-all mx-auto ${activeClass}`}
          >
            <Icon size={18} className="shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="font-bold text-xs bg-warm-charcoal text-white border-warm-charcoal shadow-md">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all w-full ${activeClass}`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
};
