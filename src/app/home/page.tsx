'use client';

import { useSyncExternalStore } from 'react';
import { getBrowserProfileSession } from '@/lib/application/browser-composition';
import { ProfileOnboarding } from '@/components/organisms/profile-onboarding';

export default function HomePage() {
  const session = getBrowserProfileSession();
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);

  return (
    <ProfileOnboarding
      snapshot={snapshot}
      onCreateProfile={session.createProfile}
      onLoadProfile={session.loadProfile}
      onResumeProfile={session.resumeProfile}
    />
  );
}
