'use client';

import React, { createContext, useContext, useState } from 'react';
import { BookOpen, Palette, Sparkles, Utensils, UtensilsCrossed, Users } from 'lucide-react';

import { SidebarBrand } from '@/components/molecules/SidebarBrand';
import { SidebarNavItem } from '@/components/molecules/SidebarNavItem';
import { SidebarQuickActions } from '@/components/molecules/SidebarQuickActions';
import { SidebarUserProfile } from '@/components/molecules/SidebarUserProfile';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SidebarContextValue {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useSidebarContext(): SidebarContextValue | undefined {
  return useContext(SidebarContext);
}

export interface SidebarNavProps {
  doctorName?: string;
  doctorRole?: string;
  onSave?: () => void;
  onOpen?: () => void;
  initialCollapsed?: boolean;
  children?: React.ReactNode;
}

const navItems = [
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/presets', label: 'Presets de Dietas', icon: Sparkles },
  { href: '/refeicoes-prontas', label: 'RefeiÃ§Ãµes Prontas', icon: UtensilsCrossed },
  { href: '/receitas', label: 'Receitas CulinÃ¡rias', icon: Utensils },
  { href: '/alimentos', label: 'Planilha de Alimentos', icon: BookOpen },
  { href: '/design-system', label: 'Guia Design System', icon: Palette },
];

export const SidebarNavComponent: React.FC<SidebarNavProps> & {
  Brand: typeof SidebarBrand;
  Item: typeof SidebarNavItem;
  UserProfile: typeof SidebarUserProfile;
  QuickActions: typeof SidebarQuickActions;
} = ({
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  onSave,
  onOpen,
  initialCollapsed = false,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const toggleCollapse = () => setIsCollapsed((previous) => !previous);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
      <TooltipProvider delayDuration={150}>
        <aside
          className={`sticky top-0 z-navigation flex h-screen shrink-0 flex-col justify-between border-r border-border-subtle bg-surface transition-colors duration-standard ${
            isCollapsed ? 'w-20 px-3 py-4' : 'w-64 p-4'
          }`}
        >
          {children || (
            <>
              <div className="flex w-full flex-col">
                <SidebarBrand isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
                <nav className="flex w-full flex-col gap-1.5">
                  {navItems.map((item) => (
                    <SidebarNavItem key={item.href} {...item} isCollapsed={isCollapsed} />
                  ))}
                </nav>
              </div>

              <div className="flex w-full flex-col gap-3 border-t border-border-subtle pt-4">
                <SidebarUserProfile
                  doctorName={doctorName}
                  doctorRole={doctorRole}
                  isCollapsed={isCollapsed}
                />
                <SidebarQuickActions onSave={onSave} onOpen={onOpen} isCollapsed={isCollapsed} />
              </div>
            </>
          )}
        </aside>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};

SidebarNavComponent.Brand = SidebarBrand;
SidebarNavComponent.Item = SidebarNavItem;
SidebarNavComponent.UserProfile = SidebarUserProfile;
SidebarNavComponent.QuickActions = SidebarQuickActions;

export const SidebarNav = SidebarNavComponent;
