'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Users, BookOpen, UtensilsCrossed, Sparkles } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SidebarBrand,
  SidebarNavItem,
  SidebarUserProfile,
  SidebarQuickActions,
} from '../molecules';

export interface SidebarNavProps {
  doctorName?: string;
  doctorRole?: string;
  onSave?: () => void;
  onOpen?: () => void;
  initialCollapsed?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  onSave,
  onOpen,
  initialCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const pathname = usePathname();

  const navItems = [
    { href: '/pacientes', label: 'Pacientes', icon: Users },
    { href: '/presets', label: 'Presets de Dietas', icon: Sparkles },
    { href: '/refeicoes-prontas', label: 'Refeições Prontas', icon: UtensilsCrossed },
    { href: '/alimentos', label: 'Planilha de Alimentos', icon: BookOpen },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={`bg-warm-card border-r border-warm-border h-screen sticky top-0 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20 px-3 py-4' : 'w-64 p-4'
        }`}
      >
        <div className="flex flex-col w-full">
          {/* Brand & Collapse Control */}
          <SidebarBrand
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />

          {/* Navigation Items */}
          <nav className="space-y-1.5 w-full">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/pacientes' && pathname.startsWith(item.href)) ||
                (item.href === '/pacientes' && pathname.startsWith('/pacientes'));

              return (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </nav>
        </div>

        {/* User Profile & Quick Actions */}
        <div className="pt-4 border-t border-warm-border space-y-3 w-full">
          <SidebarUserProfile
            doctorName={doctorName}
            doctorRole={doctorRole}
            isCollapsed={isCollapsed}
          />
          <SidebarQuickActions
            onSave={onSave}
            onOpen={onOpen}
            isCollapsed={isCollapsed}
          />
        </div>
      </aside>
    </TooltipProvider>
  );
};
