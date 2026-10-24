'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { SidebarNav, type SidebarNavProps } from '@/components/organisms/SidebarNav';
import { SettingsDialog, type SaveSettingsInput } from '@/components/organisms/SettingsDialog';
import type { ProfileSessionSnapshot } from '@/lib/application/profile-session';
import { getBrowserProfessionalProfileStore } from '@/lib/application/professional-profile-store';
import { getProfessionalFullName, getProfessionalTitle, type ProfessionalProfile } from '@/lib/domain/professional-profile';
import * as browserComposition from '@/lib/application/browser-composition';
import type { BrowserPatientRuntime } from '@/lib/application/browser-composition';
import { useSaveManagement } from './useSaveManagement';
import { SIDEBAR_NAVIGATION_ITEMS } from './sidebar-navigation-config';

export type SidebarNavigationAdapterProps = Omit<SidebarNavProps, 'pathname' | 'navigationItems'>;

const EMPTY_PROFILE_SNAPSHOT: ProfileSessionSnapshot<BrowserPatientRuntime> = { status: 'empty', authorizationExpiresAt: null, syncState: 'unbound', account: null, accountId: null, runtime: null, fileName: null, hydration: 'ready', resumeFileName: null, error: null, protectedCopyRequired: false };
const EMPTY_PROFILE_SESSION = {
  getSnapshot: () => EMPTY_PROFILE_SNAPSHOT,
  subscribe: (_listener: (snapshot: ProfileSessionSnapshot<BrowserPatientRuntime>) => void) => () => undefined,
  sync: async () => undefined,
  updateProfileDetails: async (_input: SaveSettingsInput) => undefined,
};

export const SidebarNavigationAdapter: React.FC<SidebarNavigationAdapterProps> = (props) => {
  const pathname = usePathname() ?? '';
  let getProfileSession: typeof browserComposition.getBrowserProfileSession | undefined;
  try {
    getProfileSession = browserComposition.getBrowserProfileSession;
  } catch {
    // Older test adapters may only provide the backup application seam.
  }
  const hasProfileSession = typeof getProfileSession === 'function';
  const profileSession = getProfileSession?.() ?? EMPTY_PROFILE_SESSION;
  const profileSnapshot = useSyncExternalStore(profileSession.subscribe, profileSession.getSnapshot, profileSession.getSnapshot);
  const professionalProfileStore = getBrowserProfessionalProfileStore();
  const professionalProfile = useSyncExternalStore(
    professionalProfileStore.subscribe,
    professionalProfileStore.getSnapshot,
    professionalProfileStore.getSnapshot,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'save'>('profile');
  const saveManagement = useSaveManagement(settingsOpen || pathname === '/dashboard');
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isRetryingProfileSync, setIsRetryingProfileSync] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'status' | 'error'; message: string }>();

  useEffect(() => {
    const openSaves = () => {
      settingsTriggerRef.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
      setSettingsTab('save');
      setSettingsOpen(true);
    };
    window.addEventListener('nutridiet:open-saves', openSaves);
    return () => window.removeEventListener('nutridiet:open-saves', openSaves);
  }, []);

  useEffect(() => {
    void professionalProfileStore.load();
  }, [professionalProfileStore]);

  const handleSaveProfessionalProfile = async (profile: ProfessionalProfile): Promise<void> => {
    await professionalProfileStore.save(profile);
  };

  const handleSaveSettings = async (input: SaveSettingsInput): Promise<void> => {
    await profileSession.updateProfileDetails(input);
  };

  const loadedProfile = professionalProfile.profile;
  const doctorName = loadedProfile
    ? getProfessionalFullName(loadedProfile)
    : profileSnapshot.account?.displayName ?? 'Profile ativo';
  const saveEditable = Boolean(profileSnapshot.runtime)
    && (profileSnapshot.status === 'active' || profileSnapshot.status === 'paused');

  const handleRetryProfileSync = async (): Promise<void> => {
    if (isRetryingProfileSync) return;
    setIsRetryingProfileSync(true);
    setFeedback(undefined);
    try {
      await profileSession.sync();
      setFeedback({ kind: 'status', message: 'Profile sincronizado no arquivo.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'A sincronização continua pausada.';
      setFeedback({ kind: 'error', message });
      toast.error(message);
    } finally {
      setIsRetryingProfileSync(false);
    }
  };

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
        profileSyncState={hasProfileSession ? profileSnapshot.syncState : undefined}
        onRetryProfileSync={hasProfileSession ? handleRetryProfileSync : undefined}
        isRetryingProfileSync={hasProfileSession ? isRetryingProfileSync : undefined}
      />

      <SettingsDialog
        open={settingsOpen}
        defaultTab={settingsTab}
        savesContent={saveManagement.content}
        suspended={saveManagement.overlayOpen}
        busy={saveManagement.busy}
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
        save={{
          details: profileSnapshot.account
            ? { displayName: profileSnapshot.account.displayName, phone: profileSnapshot.account.phone ?? null }
            : null,
          fileName: profileSnapshot.fileName,
          syncState: profileSnapshot.syncState,
          editable: saveEditable,
        }}
        onSaveSettings={handleSaveSettings}
        onSyncSave={() => profileSession.sync()}
      />

      {saveManagement.dialogs}

      <div
        aria-live="polite"
        className="sr-only"
        data-profile-sync-feedback={feedback?.kind ?? 'none'}
        role={feedback?.kind === 'error' ? 'alert' : 'status'}
      >
        {feedback?.message ?? ''}
      </div>
    </>
  );
};
