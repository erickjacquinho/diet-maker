'use client';

import React from 'react';

import { Button } from '@/components/atoms';
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
  onExportBackup?: () => void | Promise<void>;
  onRestoreBackup?: () => void | Promise<void>;
  isExporting?: boolean;
  isRestoring?: boolean;
  profileSyncState?: 'unbound' | 'syncing' | 'pending' | 'synced' | 'paused';
  onRetryProfileSync?: () => void | Promise<void>;
  isRetryingProfileSync?: boolean;
  onOpenAccount?: () => void;
  onSignOut?: () => void | Promise<void>;
  initialCollapsed?: boolean;
  children?: React.ReactNode;
}

function SidebarNavContent({
  doctorName,
  doctorRole,
  pathname,
  onExportBackup,
  onRestoreBackup,
  isExporting,
  isRestoring,
  profileSyncState,
  onRetryProfileSync,
  isRetryingProfileSync,
  onOpenAccount,
  onSignOut,
  navigationItems,
  children,
}: Required<Pick<SidebarNavProps, 'doctorName' | 'doctorRole' | 'navigationItems'>> &
  Pick<SidebarNavProps, 'pathname' | 'onExportBackup' | 'onRestoreBackup' | 'isExporting' | 'isRestoring' | 'profileSyncState' | 'onRetryProfileSync' | 'isRetryingProfileSync' | 'onOpenAccount' | 'onSignOut' | 'children'>) {
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
              {profileSyncState ? (
                <div
                  aria-live="polite"
                  className={`mx-2 mb-2 rounded-control border p-2 text-style-legal ${profileSyncState === 'paused' ? 'border-warning-border bg-warning-soft text-warning' : 'border-border-subtle bg-surface-subtle text-text-muted'}`}
                  data-profile-sync-state={profileSyncState}
                  role="status"
                >
                  {profileSyncState === 'pending'
                    ? 'Alterações locais pendentes no arquivo principal.'
                    : profileSyncState === 'paused'
                    ? 'Sincronização pausada — reautorize o arquivo para continuar.'
                    : profileSyncState === 'syncing'
                      ? 'Sincronizando o profile…'
                      : profileSyncState === 'synced'
                        ? 'Profile sincronizado no arquivo.'
                        : 'Arquivo do profile não associado.'}
                  {(profileSyncState === 'pending' || profileSyncState === 'paused') && onRetryProfileSync ? (
                    <Button
                      className="mt-2 w-full"
                      disabled={isRetryingProfileSync}
                      loading={isRetryingProfileSync}
                      onClick={onRetryProfileSync}
                      size="compact"
                      type="button"
                      variant="secondary"
                    >
                      {profileSyncState === 'paused' ? 'Reautorizar arquivo' : 'Salvar alterações'}
                    </Button>
                  ) : null}
                </div>
              ) : null}
              <SidebarUserProfile
                doctorName={doctorName}
                doctorRole={doctorRole}
                isCollapsed={isCollapsed}
                onOpenAccount={onOpenAccount}
                onExportBackup={onExportBackup}
                onRestoreBackup={onRestoreBackup}
                isExporting={isExporting}
                isRestoring={isRestoring}
                onSignOut={onSignOut}
              />
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
  onExportBackup,
  onRestoreBackup,
  isExporting,
  isRestoring,
  profileSyncState,
  onRetryProfileSync,
  isRetryingProfileSync,
  onOpenAccount,
  onSignOut,
  initialCollapsed = false,
  children,
}) => {
  return (
    <SidebarProvider defaultOpen={!initialCollapsed} className="shrink-0">
      <SidebarNavContent
        doctorName={doctorName}
        doctorRole={doctorRole}
        pathname={pathname}
        onExportBackup={onExportBackup}
        onRestoreBackup={onRestoreBackup}
        isExporting={isExporting}
        isRestoring={isRestoring}
        profileSyncState={profileSyncState}
        onRetryProfileSync={onRetryProfileSync}
        isRetryingProfileSync={isRetryingProfileSync}
        onOpenAccount={onOpenAccount}
        onSignOut={onSignOut}
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
