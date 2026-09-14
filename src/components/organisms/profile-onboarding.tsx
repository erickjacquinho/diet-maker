'use client';

import { useState } from 'react';
import { FolderOpen, RotateCcw, UserPlus } from 'lucide-react';
import { Button } from '@/components/atoms';
import { ProfileCreateDialog } from '@/components/molecules/profile-create-dialog';
import { Card } from '@/components/ui/card';
import type {
  CreateProfileInput,
  ProfileSessionHydrationState,
  ProfileSessionStatus,
  ProfileSessionSyncState,
} from '@/lib/application/profile-session';

export interface ProfileOnboardingSnapshot {
  status: ProfileSessionStatus;
  syncState: ProfileSessionSyncState;
  error: string | null;
  hydration?: ProfileSessionHydrationState;
  resumeFileName?: string | null;
}

export interface ProfileOnboardingProps {
  snapshot: ProfileOnboardingSnapshot;
  onCreateProfile(input: CreateProfileInput): Promise<void>;
  onLoadProfile(): Promise<void>;
  onResumeProfile?: () => Promise<void>;
}

export function ProfileOnboarding({ snapshot, onCreateProfile, onLoadProfile, onResumeProfile }: ProfileOnboardingProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create' | 'load' | 'resume' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isHydrating = snapshot.hydration === 'pending';
  const isBusy = pendingAction !== null || snapshot.status === 'busy' || isHydrating;
  const error = actionError ?? snapshot.error;

  const handleLoad = async () => {
    setActionError(null);
    setPendingAction('load');
    try {
      await onLoadProfile();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'O arquivo não pôde ser carregado.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleResume = async () => {
    if (!onResumeProfile) return;
    setActionError(null);
    setPendingAction('resume');
    try {
      await onResumeProfile();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'O último save não pôde ser carregado.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleCreate = async (input: CreateProfileInput) => {
    setActionError(null);
    setPendingAction('create');
    try {
      await onCreateProfile(input);
      setDialogOpen(false);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'O profile não pôde ser criado.');
      throw cause;
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-8" data-route="onboarding">
      <Card className="w-full max-w-profile-onboarding p-6">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-2">
            <p className="text-style-overline font-semibold text-primary">NutriDiet Local Pro</p>
            <h1 className="text-style-page-title font-bold text-text-primary">Acesse o NutriDiet</h1>
            <p className="text-style-body-large text-text-secondary">O último save deste navegador será procurado automaticamente; você também pode criar ou abrir outro arquivo.</p>
          </header>

          <div className="flex items-center justify-center gap-3" aria-busy={isBusy || undefined}>
            <Button type="button" variant="primary" size="compact" onClick={() => { setActionError(null); setDialogOpen(true); }} disabled={isBusy}>
              <UserPlus className="size-4" aria-hidden="true" />
              Criar perfil
            </Button>
            <Button type="button" variant="secondary" size="compact" onClick={handleLoad} loading={pendingAction === 'load'} disabled={isBusy}>
              <FolderOpen className="size-4" aria-hidden="true" />
              Abrir arquivo
            </Button>
            {!isHydrating && snapshot.resumeFileName && onResumeProfile ? (
              <Button type="button" variant="secondary" size="compact" onClick={handleResume} loading={pendingAction === 'resume'} disabled={isBusy}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Reabrir último save
              </Button>
            ) : null}
          </div>

          <div aria-live="polite" className="flex min-h-6 flex-col gap-2">
            {isHydrating ? <p role="status" className="rounded-control border border-info-border bg-info-soft p-3 text-style-body-small text-info">Procurando o último save salvo neste navegador…</p> : null}
            {!isHydrating && snapshot.resumeFileName && onResumeProfile ? <p role="status" className="rounded-control border border-info-border bg-info-soft p-3 text-style-body-small text-info">Encontramos o save <span className="font-semibold">{snapshot.resumeFileName}</span>. Autorize o acesso para reabri-lo.</p> : null}
            {snapshot.syncState === 'paused' ? <p role="status" className="rounded-control border border-warning-border bg-warning-soft p-3 text-style-body-small text-warning">A sincronização pausada mantém o trabalho em memória disponível.</p> : null}
            {error ? <p role="alert" className="rounded-control border border-error-border bg-error-soft p-3 text-style-body-small text-error">{error}</p> : null}
          </div>
        </div>
      </Card>

      <ProfileCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleCreate} />
    </main>
  );
}
