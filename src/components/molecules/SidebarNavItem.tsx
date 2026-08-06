'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const pathname = usePathname();
  const isActive = customIsActive ?? (
    pathname === href ||
    (href !== '/pacientes' && pathname.startsWith(href)) ||
    (href === '/pacientes' && pathname.startsWith('/pacientes'))
  );
  const activeClass = isActive
    ? 'bg-primary text-on-primary font-bold shadow-floating'
    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover font-semibold';

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            aria-label={label}
            className={`mx-auto flex size-10 items-center justify-center rounded-control text-style-legal transition-colors duration-standard ${activeClass}`}
          >
            <Icon size={18} className="shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="bg-primary text-on-primary border-primary shadow-floating text-style-legal font-bold">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-control px-3.5 py-2.5 text-style-legal transition-colors duration-standard ${activeClass}`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
};
