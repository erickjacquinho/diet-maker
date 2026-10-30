'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

import { SidebarNav, type SidebarNavProps } from '@/components/organisms/SidebarNav';
import { SettingsDialog, type SettingsTab } from '@/components/organisms/SettingsDialog';
import { getBrowserProfessionalProfileStore } from '@/lib/application/professional-profile-store';
import { getProfessionalFullName, getProfessionalTitle, type ProfessionalProfile } from '@/lib/domain/professional-profile';
import { getBrowserProfileSession } from '@/lib/application/browser-composition';
import { importsApi } from '@/lib/api-client/imports';
import { SIDEBAR_NAVIGATION_ITEMS } from './sidebar-navigation-config';

export type SidebarNavigationAdapterProps = Omit<SidebarNavProps, 'pathname' | 'navigationItems'>;

export const SidebarNavigationAdapter: React.FC<SidebarNavigationAdapterProps> = (props) => {
  const pathname = usePathname() ?? '';
  const profileSession = getBrowserProfileSession();
  const profileSnapshot = useSyncExternalStore(profileSession.subscribe, profileSession.getSnapshot, profileSession.getSnapshot);
  const professionalProfileStore = getBrowserProfessionalProfileStore();
  const professionalProfile = useSyncExternalStore(
    professionalProfileStore.subscribe,
    professionalProfileStore.getSnapshot,
    professionalProfileStore.getSnapshot,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const openSubscription = () => {
      settingsTriggerRef.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
      setSettingsTab('subscription');
      setSettingsOpen(true);
    };
    window.addEventListener('nutridiet:open-subscription', openSubscription);
    return () => window.removeEventListener('nutridiet:open-subscription', openSubscription);
  }, []);

  useEffect(() => {
    void professionalProfileStore.load();
  }, [professionalProfileStore]);

  const handleSaveProfessionalProfile = async (profile: ProfessionalProfile): Promise<void> => {
    await professionalProfileStore.save(profile);
  };

  const loadedProfile = professionalProfile.profile;
  const doctorName = loadedProfile
    ? getProfessionalFullName(loadedProfile)
    : profileSnapshot.account?.displayName ?? 'Minha conta';

  return (
    <>
      <SidebarNav
        {...props}
        pathname={pathname}
        navigationItems={SIDEBAR_NAVIGATION_ITEMS}
        onOpenAccount={props.onOpenAccount ?? ((trigger) => {
          settingsTriggerRef.current = trigger ?? null;
          setSettingsTab('profile');
          setSettingsOpen(true);
        })}
        doctorName={doctorName}
        doctorRole={loadedProfile ? getProfessionalTitle(loadedProfile) : undefined}
      />

      <SettingsDialog
        open={settingsOpen}
        defaultTab={settingsTab}
        onOpenChange={(open) => {
          setSettingsOpen(open);
          if (open && professionalProfile.status !== 'ready') void professionalProfileStore.load();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          settingsTriggerRef.current?.focus();
        }}
        profile={professionalProfile}
        onRetryProfile={() => void professionalProfileStore.load({ force: true })}
        onSaveProfile={handleSaveProfessionalProfile}
        onResetPassword={() => professionalProfileStore.requestPasswordReset()}
        onImportNutridiet={async (fileText, options) => {
          const result = await importsApi.nutridiet(fileText, options);
          const { summary } = result;
          return { replayed: result.replayed, patients: summary.patients, dietPlans: summary.dietPlans, foodCatalogItems: summary.foodCatalogItems, recipes: summary.recipes, readyMeals: summary.readyMeals };
        }}
      />
    </>
  );
};
