'use client';

import React from 'react';

import { SidebarBrand } from '@/components/molecules/SidebarBrand';
import { SidebarNavItem } from '@/components/molecules/SidebarNavItem';
import { SidebarQuickActions } from '@/components/molecules/SidebarQuickActions';
import { SidebarUserProfile } from '@/components/molecules/SidebarUserProfile';
import { type SidebarNavigationItem } from '@/components/organisms/sidebar-navigation-model';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarNavigation } from './sidebar-navigation-items';

export interface SidebarContextValue {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function useSidebarContext(): SidebarContextValue | undefined {
  try {
    const { state, toggleSidebar } = useSidebar();
    return { isCollapsed: state === 'collapsed', toggleCollapse: toggleSidebar };
  } catch (error) {
    if (error instanceof Error && error.message === 'useSidebar must be used within a SidebarProvider') {
      return undefined;
    }
    throw error;
  }
}

export interface SidebarNavProps {
  pathname: string;
  navigationItems: SidebarNavigationItem[];
  doctorName?: string;
  doctorRole?: string;
  onSave?: () => void;
  onOpen?: () => void;
  onOpenAccount?: () => void;
  initialCollapsed?: boolean;
  children?: React.ReactNode;
}

function SidebarNavContent({
  doctorName,
  doctorRole,
  pathname,
  onSave,
  onOpen,
  onOpenAccount,
  navigationItems,
  children,
}: Required<Pick<SidebarNavProps, 'doctorName' | 'doctorRole' | 'navigationItems'>> &
  Pick<SidebarNavProps, 'pathname' | 'onSave' | 'onOpen' | 'onOpenAccount' | 'children'>) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <TooltipProvider delayDuration={150}>
      <Sidebar collapsible="icon">
        {children || (
          <>
            <SidebarHeader>
              <SidebarBrand isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
            </SidebarHeader>

            <SidebarContent>
              <SidebarNavigation
                items={navigationItems}
                pathname={pathname}
                isCollapsed={isCollapsed}
              />
            </SidebarContent>

            <SidebarFooter>
              <SidebarUserProfile
                doctorName={doctorName}
                doctorRole={doctorRole}
                isCollapsed={isCollapsed}
                onOpenAccount={onOpenAccount}
              />
              <SidebarQuickActions onSave={onSave} onOpen={onOpen} isCollapsed={isCollapsed} />
            </SidebarFooter>
          </>
        )}
      </Sidebar>
    </TooltipProvider>
  );
}

export const SidebarNavComponent: React.FC<SidebarNavProps> & {
  Brand: typeof SidebarBrand;
  Item: typeof SidebarNavItem;
  UserProfile: typeof SidebarUserProfile;
  QuickActions: typeof SidebarQuickActions;
} = ({
  pathname,
  navigationItems,
  doctorName = 'Dr. Lucas',
  doctorRole = 'Nutricionista',
  onSave,
  onOpen,
  onOpenAccount,
  initialCollapsed = false,
  children,
}) => {
  return (
    <SidebarProvider defaultOpen={!initialCollapsed} className="shrink-0">
      <SidebarNavContent
        doctorName={doctorName}
        doctorRole={doctorRole}
        pathname={pathname}
        onSave={onSave}
        onOpen={onOpen}
        onOpenAccount={onOpenAccount}
        navigationItems={navigationItems}
      >
        {children}
      </SidebarNavContent>
    </SidebarProvider>
  );
};

SidebarNavComponent.Brand = SidebarBrand;
SidebarNavComponent.Item = SidebarNavItem;
SidebarNavComponent.UserProfile = SidebarUserProfile;
SidebarNavComponent.QuickActions = SidebarQuickActions;

export const SidebarNav = SidebarNavComponent;
