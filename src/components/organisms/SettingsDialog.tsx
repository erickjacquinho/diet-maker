'use client';

import React, { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { CreditCard, HardDrive, RefreshCw, UserRound } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { SelectField } from '@/components/atoms/SelectField';
import { ConfirmationAlertDialog } from '@/components/molecules/ConfirmationAlertDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  BRAZILIAN_STATES,
  DEFAULT_PROFESSIONAL_TITLE,
  DOCUMENT_LOGO_MAX_BYTES,
  PROFESSIONAL_PROFILE_LIMITS,
  SERVICE_MODE_LABELS,
  getProfessionalSignature,
  parseDocumentLogo,
  parseProfessionalProfile,
  type ProfessionalProfile,
  type ProfessionalServiceMode,
} from '@/lib/domain/professional-profile';
import { formatWhatsappContact } from '@/lib/whatsapp';

export type SettingsTab = 'profile' | 'save' | 'subscription';
export type SettingsSaveSyncState = 'unbound' | 'syncing' | 'pending' | 'synced' | 'paused';

export interface SettingsProfileState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  profile: ProfessionalProfile | null;
  accountEmail: string | null;
  error: string | null;
}

export interface SettingsSaveState {
  /** Null when no save is open in this session. */
  details: { displayName: string; phone: string | null } | null;
  fileName: string | null;
  syncState: SettingsSaveSyncState;
  editable: boolean;
}

export interface SaveSettingsInput {
  displayName: string;
  phone: string | null;
}

export interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  defaultTab?: SettingsTab;
  profile: SettingsProfileState;
  onRetryProfile: () => void;
  onSaveProfile: (profile: ProfessionalProfile) => Promise<void>;
  onResetPassword: () => Promise<void>;
  save: SettingsSaveState;
  onSaveSettings: (input: SaveSettingsInput) => Promise<void>;
  onSyncSave: () => Promise<void>;
  savesContent?: ReactNode;
  suspended?: boolean;
  busy?: boolean;
}

const SAVE_LABEL_MAX = 80;

const experienceOptions = [
  { value: 'months_1_6', label: 'De 1 a 6 meses' },
  { value: 'months_6_12', label: 'De 6 a 12 meses' },
  { value: 'years', label: 'Em anos' },
] as const;

const serviceModeOptions = (Object.keys(SERVICE_MODE_LABELS) as ProfessionalServiceMode[])
  .map((value) => ({ value, label: SERVICE_MODE_LABELS[value] }));
const stateOptions = BRAZILIAN_STATES.map((value) => ({ value, label: value }));

const syncLabels: Record<SettingsSaveSyncState, string> = {
  unbound: 'Sem arquivo associado',
  syncing: 'Sincronizando…',
  pending: 'Alterações aguardando gravação',
  synced: 'Tudo salvo no arquivo',
  paused: 'Sincronização pausada',
};

type ProfileDraft = Record<
  | 'firstName' | 'lastName' | 'professionalTitle' | 'crn' | 'specialties' | 'bio' | 'contactEmail' | 'phone'
  | 'instagram' | 'website' | 'clinicName' | 'city' | 'averagePatientsPerMonth' | 'experienceYears',
  string
> & {
  experienceKind: ProfessionalProfile['experience']['kind'] | '';
  state: string;
  serviceMode: ProfessionalServiceMode | '';
  showOnDocuments: boolean;
  agendaRemindersEnabled: boolean;
  documentLogo: string | null;
};

function toDraft(profile: ProfessionalProfile): ProfileDraft {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    professionalTitle: profile.professionalTitle ?? '',
    crn: profile.crn ?? '',
    specialties: profile.specialties ?? '',
    bio: profile.bio ?? '',
    contactEmail: profile.contactEmail ?? '',
    phone: profile.phone ?? '',
    instagram: profile.instagram ?? '',
    website: profile.website ?? '',
    clinicName: profile.clinicName ?? '',
    city: profile.city ?? '',
    averagePatientsPerMonth: String(profile.averagePatientsPerMonth),
    experienceKind: profile.experience.kind,
    experienceYears: profile.experience.kind === 'years' ? String(profile.experience.value) : '',
    state: profile.state ?? '',
    serviceMode: profile.serviceMode ?? '',
    showOnDocuments: profile.showOnDocuments,
    agendaRemindersEnabled: profile.agendaRemindersEnabled,
    documentLogo: profile.documentLogo,
  };
}

function validateDraft(draft: ProfileDraft): { profile: ProfessionalProfile | null; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!draft.firstName.trim()) errors.firstName = 'Informe seu nome.';
  if (!draft.lastName.trim()) errors.lastName = 'Informe seu sobrenome.';
  const average = Number(draft.averagePatientsPerMonth);
  if (!draft.averagePatientsPerMonth.trim() || !Number.isFinite(average) || average < 0) {
    errors.averagePatientsPerMonth = 'Informe um número igual ou maior que zero.';
  }
  if (!draft.experienceKind) errors.experienceKind = 'Selecione sua faixa de experiência.';
  const years = Number(draft.experienceYears);
  if (draft.experienceKind === 'years' && (!draft.experienceYears.trim() || !Number.isFinite(years) || years < 0)) {
    errors.experienceYears = 'Informe anos iguais ou maiores que zero.';
  }
  const email = draft.contactEmail.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.contactEmail = 'Informe um e-mail válido.';
  const instagram = draft.instagram.trim().replace(/^@/, '');
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) errors.instagram = 'Use até 30 letras, números, pontos ou sublinhados.';
  if (Object.keys(errors).length > 0 || !draft.experienceKind) return { profile: null, errors };

  try {
    const profile = parseProfessionalProfile({
      firstName: draft.firstName,
      lastName: draft.lastName,
      averagePatientsPerMonth: average,
      experience: draft.experienceKind === 'years' ? { kind: 'years', value: years } : { kind: draft.experienceKind },
      professionalTitle: draft.professionalTitle,
      crn: draft.crn,
      specialties: draft.specialties,
      bio: draft.bio,
      contactEmail: draft.contactEmail,
      phone: draft.phone,
      instagram: draft.instagram,
      website: draft.website,
      clinicName: draft.clinicName,
      city: draft.city,
      state: draft.state || null,
      serviceMode: draft.serviceMode || null,
      showOnDocuments: draft.showOnDocuments,
      agendaRemindersEnabled: draft.agendaRemindersEnabled,
      documentLogo: draft.documentLogo,
    });
    return { profile, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/website/i.test(message)) return { profile: null, errors: { website: 'Informe um endereço válido, como www.seusite.com.br.' } };
    return { profile: null, errors: { form: 'Revise os campos destacados do perfil.' } };
  }
}

function sameDraft(left: ProfileDraft | null, right: ProfileDraft | null): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function SettingsDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
  defaultTab = 'profile',
  profile,
  onRetryProfile,
  onSaveProfile,
  onResetPassword,
  save,
  onSaveSettings,
  onSyncSave,
  savesContent,
  suspended = false,
  busy = false,
}: SettingsDialogProps) {
  const id = useId();
  const [tab, setTab] = useState<SettingsTab>(defaultTab);
  const baseline = useMemo(() => (profile.profile ? toDraft(profile.profile) : null), [profile.profile]);
  const [draft, setDraft] = useState<ProfileDraft | null>(baseline);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileFeedback, setProfileFeedback] = useState<{ kind: 'status' | 'error'; message: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [readingLogo, setReadingLogo] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ kind: 'status' | 'error'; message: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const saveBaseline = useMemo(() => ({
    displayName: save.details?.displayName ?? '',
    phone: formatWhatsappContact(save.details?.phone ?? '') || '',
  }), [save.details]);
  const [saveDraft, setSaveDraft] = useState(saveBaseline);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{ kind: 'status' | 'error'; message: string } | null>(null);
  const [savingSave, setSavingSave] = useState(false);
  /** Set when the last save attempt failed, so the same values can be submitted again even if the baseline caught up. */
  const [saveRetryable, setSaveRetryable] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab(defaultTab);
    setProfileErrors({});
    setProfileFeedback(null);
    setSaveError(null);
    setSaveFeedback(null);
    setPasswordFeedback(null);
    // Runs only when the dialog opens so a later defaultTab change does not switch tabs mid-edit.
  }, [open]);

  useEffect(() => { setDraft(baseline); }, [baseline]);
  useEffect(() => { setSaveDraft(saveBaseline); }, [saveBaseline]);

  const profileDirty = !sameDraft(draft, baseline);
  const saveDirty = save.details !== null
    && (saveDraft.displayName !== saveBaseline.displayName || saveDraft.phone !== saveBaseline.phone);

  const requestOpenChange = (next: boolean) => {
    if (!next && (busy || savingProfile || savingSave || syncing || readingLogo || resettingPassword)) return;
    if (!next && (profileDirty || saveDirty) && !savingProfile && !savingSave) {
      setDiscardOpen(true);
      return;
    }
    onOpenChange(next);
  };

  const discardChanges = () => {
    setDraft(baseline);
    setSaveDraft(saveBaseline);
    setDiscardOpen(false);
    onOpenChange(false);
  };

  const setField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setProfileFeedback(null);
    setProfileErrors((current) => {
      if (!current[key as string] && !current.form) return current;
      const next = { ...current };
      delete next[key as string];
      delete next.form;
      return next;
    });
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || savingProfile || readingLogo) return;
    const { profile: next, errors } = validateDraft(draft);
    setProfileErrors(errors);
    if (!next) {
      const first = Object.keys(errors).find((key) => key !== 'form');
      if (first) window.setTimeout(() => document.getElementById(`${id}-${first}`)?.focus(), 0);
      return;
    }
    setSavingProfile(true);
    setProfileFeedback(null);
    try {
      await onSaveProfile(next);
      setProfileFeedback({ kind: 'status', message: 'Perfil profissional atualizado.' });
    } catch (error) {
      setProfileFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar o perfil.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const readLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || readingLogo) return;
    setReadingLogo(true);
    setProfileErrors((current) => ({ ...current, documentLogo: '' }));
    try {
      if (file.type !== 'image/png' || file.size > DOCUMENT_LOGO_MAX_BYTES) throw new Error();
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error());
        reader.readAsDataURL(file);
      });
      const logo = parseDocumentLogo(content);
      const preview = new Image();
      preview.src = content;
      await preview.decode();
      setField('documentLogo', logo);
    } catch {
      setProfileErrors((current) => ({ ...current, documentLogo: 'Selecione um PNG válido de até 128 KB e 1024 × 1024 pixels.' }));
    } finally {
      setReadingLogo(false);
    }
  };

  const resetPassword = async () => {
    if (resettingPassword) return;
    setResettingPassword(true);
    setPasswordFeedback(null);
    try {
      await onResetPassword();
      setPasswordFeedback({ kind: 'status', message: 'Se o endereço puder receber uma recuperação, as instruções serão enviadas.' });
    } catch (error) {
      setPasswordFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível solicitar a recuperação agora. Tente novamente.' });
    } finally {
      setResettingPassword(false);
    }
  };

  const submitSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingSave || !save.details) return;
    const displayName = saveDraft.displayName.trim().replace(/\s+/g, ' ');
    if (!displayName) {
      setSaveError('Informe o nome do save.');
      window.setTimeout(() => document.getElementById(`${id}-saveName`)?.focus(), 0);
      return;
    }
    setSavingSave(true);
    setSaveFeedback(null);
    try {
      await onSaveSettings({ displayName, phone: saveDraft.phone.trim() || null });
      setSaveRetryable(false);
      setSaveFeedback({ kind: 'status', message: 'Configurações do save atualizadas.' });
    } catch (error) {
      setSaveRetryable(true);
      setSaveFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar as configurações do save.' });
    } finally {
      setSavingSave(false);
    }
  };

  const syncNow = async () => {
    if (syncing) return;
    setSyncing(true);
    setSaveFeedback(null);
    try {
      await onSyncSave();
      setSaveFeedback({ kind: 'status', message: 'Save sincronizado no arquivo.' });
    } catch (error) {
      setSaveFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'A sincronização continua pausada.' });
    } finally {
      setSyncing(false);
    }
  };

  const fieldProps = (key: string) => ({
    id: `${id}-${key}`,
    'aria-invalid': profileErrors[key] ? true : undefined,
    'aria-describedby': profileErrors[key] ? `${id}-${key}-error` : undefined,
  });

  const signaturePreview = (() => {
    if (!draft) return '';
    const { profile: preview } = validateDraft(draft);
    return preview ? getProfessionalSignature(preview) : '';
  })();

  return (
    <>
      <Dialog open={open && !suspended && !discardOpen} onOpenChange={requestOpenChange}>
        <DialogContent className="settings-dialog flex max-h-screen max-w-3xl flex-col overflow-hidden" onCloseAutoFocus={(event) => {
          if (suspended || discardOpen) event.preventDefault();
          else onCloseAutoFocus?.(event);
        }}>
          <DialogHeader>
            <DialogTitle className={textStyle('dialog-title')}>Configurações</DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              Gerencie seu perfil profissional, sua assinatura e os saves da conta.
            </DialogDescription>
          </DialogHeader>

          <fieldset disabled={busy} className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Tabs value={tab} onValueChange={(value) => setTab(value as SettingsTab)} className="flex min-h-0 flex-1 flex-col gap-4">
              <TabsList className="shrink-0 self-start">
                <TabsTrigger value="profile" className="gap-2">
                  <UserRound className="size-4" aria-hidden="true" />
                  Perfil profissional
                </TabsTrigger>
                <TabsTrigger value="save" className="gap-2">
                  <HardDrive className="size-4" aria-hidden="true" />
                  Saves
                </TabsTrigger>
                <TabsTrigger value="subscription" className="gap-2">
                  <CreditCard className="size-4" aria-hidden="true" />
                  Assinatura
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="min-h-0 flex-1 overflow-y-auto">
                {!draft ? (
                  <div className="flex flex-col items-start gap-3 py-4">
                    {profile.status === 'error' ? (
                      <>
                        <p role="alert" className={textStyle('validation-error')}>{profile.error ?? 'Não foi possível carregar seu perfil.'}</p>
                        <Button type="button" variant="secondary" size="compact" onClick={onRetryProfile}>Tentar novamente</Button>
                      </>
                    ) : (
                      <p role="status" className={textStyle('helper')}>Carregando seu perfil…</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={submitProfile} noValidate aria-busy={savingProfile || readingLogo || resettingPassword} aria-label="Perfil profissional" className="flex flex-col gap-6">
                    <Section title="Conta e acesso">
                      <Field id={`${id}-accountEmail`} label="E-mail de acesso" hint="Usado para entrar na conta; não pode ser alterado aqui.">
                        <Input id={`${id}-accountEmail`} value={profile.accountEmail ?? ''} readOnly />
                      </Field>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button type="button" variant="secondary" size="compact" onClick={() => void resetPassword()}
                          disabled={!profile.accountEmail || resettingPassword} loading={resettingPassword}>
                          Redefinir senha
                        </Button>
                        <p className={textStyle('helper')}>Receba no e-mail de acesso as instruções para escolher uma nova senha.</p>
                      </div>
                      {passwordFeedback && <p role={passwordFeedback.kind === 'error' ? 'alert' : 'status'}
                        className={textStyle(passwordFeedback.kind === 'error' ? 'validation-error' : 'validation-success')}>
                        {passwordFeedback.message}
                      </p>}
                    </Section>

                    <Section title="Identificação">
                      <div className="grid grid-cols-2 gap-4">
                        <Field id={`${id}-firstName`} label="Nome" error={profileErrors.firstName} required>
                          <Input {...fieldProps('firstName')} autoComplete="given-name" maxLength={PROFESSIONAL_PROFILE_LIMITS.name}
                            value={draft.firstName} onChange={(event) => setField('firstName', event.target.value)} />
                        </Field>
                        <Field id={`${id}-lastName`} label="Sobrenome" error={profileErrors.lastName} required>
                          <Input {...fieldProps('lastName')} autoComplete="family-name" maxLength={PROFESSIONAL_PROFILE_LIMITS.name}
                            value={draft.lastName} onChange={(event) => setField('lastName', event.target.value)} />
                        </Field>
                        <Field id={`${id}-professionalTitle`} label="Título profissional" hint="Aparece no menu e nos documentos.">
                          <Input {...fieldProps('professionalTitle')} placeholder={DEFAULT_PROFESSIONAL_TITLE} maxLength={PROFESSIONAL_PROFILE_LIMITS.professionalTitle}
                            value={draft.professionalTitle} onChange={(event) => setField('professionalTitle', event.target.value)} />
                        </Field>
                        <Field id={`${id}-crn`} label="Registro profissional (CRN)">
                          <Input {...fieldProps('crn')} placeholder="CRN-3 12345" maxLength={PROFESSIONAL_PROFILE_LIMITS.crn}
                            value={draft.crn} onChange={(event) => setField('crn', event.target.value)} />
                        </Field>
                      </div>
                    </Section>

                    <Section title="Atuação">
                      <div className="grid grid-cols-2 gap-4">
                        <SelectField<ProfileDraft['experienceKind']>
                          id={`${id}-experienceKind`}
                          label="Experiência profissional"
                          value={draft.experienceKind}
                          onValueChange={(value) => setField('experienceKind', value)}
                          placeholder="Selecione uma faixa"
                          options={experienceOptions}
                          layer="modal"
                          required
                          state={profileErrors.experienceKind ? 'error' : 'default'}
                          errorMessage={profileErrors.experienceKind}
                        />
                        {draft.experienceKind === 'years' ? (
                          <Field id={`${id}-experienceYears`} label="Anos de experiência" error={profileErrors.experienceYears} required>
                            <Input {...fieldProps('experienceYears')} type="number" min="0" step="any" inputMode="decimal"
                              value={draft.experienceYears} onChange={(event) => setField('experienceYears', event.target.value)} />
                          </Field>
                        ) : <div aria-hidden="true" />}
                        <Field id={`${id}-averagePatientsPerMonth`} label="Média de pacientes por mês" error={profileErrors.averagePatientsPerMonth} required>
                          <Input {...fieldProps('averagePatientsPerMonth')} type="number" min="0" step="any" inputMode="decimal"
                            value={draft.averagePatientsPerMonth} onChange={(event) => setField('averagePatientsPerMonth', event.target.value)} />
                        </Field>
                        <SelectField<ProfessionalServiceMode | ''>
                          id={`${id}-serviceMode`}
                          label="Modalidade de atendimento"
                          value={draft.serviceMode}
                          onValueChange={(value) => setField('serviceMode', value)}
                          placeholder="Selecione"
                          options={serviceModeOptions}
                          layer="modal"
                        />
                      </div>
                      <Field id={`${id}-specialties`} label="Especialidades e áreas de atuação" hint="Ex.: nutrição esportiva, clínica, materno-infantil.">
                        <Textarea {...fieldProps('specialties')} rows={2} maxLength={PROFESSIONAL_PROFILE_LIMITS.specialties}
                          value={draft.specialties} onChange={(event) => setField('specialties', event.target.value)} />
                      </Field>
                      <Field id={`${id}-bio`} label="Apresentação" hint={`${Array.from(draft.bio).length}/${PROFESSIONAL_PROFILE_LIMITS.bio} caracteres`}>
                        <Textarea {...fieldProps('bio')} rows={3} maxLength={PROFESSIONAL_PROFILE_LIMITS.bio}
                          value={draft.bio} onChange={(event) => setField('bio', event.target.value)} />
                      </Field>
                    </Section>

                    <Section title="Contato e consultório">
                      <div className="grid grid-cols-2 gap-4">
                        <Field id={`${id}-contactEmail`} label="E-mail de contato" error={profileErrors.contactEmail}>
                          <Input {...fieldProps('contactEmail')} type="email" autoComplete="email" maxLength={PROFESSIONAL_PROFILE_LIMITS.contactEmail}
                            value={draft.contactEmail} onChange={(event) => setField('contactEmail', event.target.value)} />
                        </Field>
                        <Field id={`${id}-phone`} label="Telefone / WhatsApp">
                          <Input {...fieldProps('phone')} type="tel" inputMode="numeric" autoComplete="tel" placeholder="(11) 99999-9999"
                            value={draft.phone} onChange={(event) => setField('phone', formatWhatsappContact(event.target.value))} />
                        </Field>
                        <Field id={`${id}-instagram`} label="Instagram" error={profileErrors.instagram}>
                          <Input {...fieldProps('instagram')} placeholder="@seuperfil" maxLength={PROFESSIONAL_PROFILE_LIMITS.instagram}
                            value={draft.instagram} onChange={(event) => setField('instagram', event.target.value)} />
                        </Field>
                        <Field id={`${id}-website`} label="Site" error={profileErrors.website}>
                          <Input {...fieldProps('website')} type="url" inputMode="url" placeholder="www.seusite.com.br" maxLength={PROFESSIONAL_PROFILE_LIMITS.website}
                            value={draft.website} onChange={(event) => setField('website', event.target.value)} />
                        </Field>
                        <Field id={`${id}-clinicName`} label="Consultório ou clínica">
                          <Input {...fieldProps('clinicName')} autoComplete="organization" maxLength={PROFESSIONAL_PROFILE_LIMITS.clinicName}
                            value={draft.clinicName} onChange={(event) => setField('clinicName', event.target.value)} />
                        </Field>
                        <Field id={`${id}-city`} label="Cidade">
                          <Input {...fieldProps('city')} autoComplete="address-level2" maxLength={PROFESSIONAL_PROFILE_LIMITS.city}
                            value={draft.city} onChange={(event) => setField('city', event.target.value)} />
                        </Field>
                        <SelectField
                          id={`${id}-state`}
                          label="UF"
                          value={draft.state}
                          onValueChange={(value) => setField('state', value)}
                          placeholder="Selecione"
                          options={stateOptions}
                          layer="modal"
                        />
                      </div>
                    </Section>

                    <Section title="Lembretes da agenda">
                      <div className="flex items-start gap-2">
                        <Checkbox id={`${id}-agendaRemindersEnabled`} checked={draft.agendaRemindersEnabled}
                          onCheckedChange={(checked) => setField('agendaRemindersEnabled', checked)}
                          aria-label="Exibir lembretes da agenda" className="-m-2 shrink-0" />
                        <label htmlFor={`${id}-agendaRemindersEnabled`} className={textStyle('body')}>Exibir lembretes da agenda</label>
                      </div>
                      <p className={textStyle('helper')}>Os avisos aparecem com a aplicação aberta. Desativar silencia os avisos e preserva os lembretes agendados.</p>
                    </Section>

                    <Section title="Documentos">
                      <Field id={`${id}-documentLogo`} label="Logotipo do consultório" error={profileErrors.documentLogo}
                        hint="PNG de até 128 KB e 1024 × 1024 pixels. O logotipo acompanha a identificação do profissional nos PDFs.">
                        <Input ref={logoInputRef} id={`${id}-documentLogo`} type="file" accept="image/png" disabled={readingLogo || savingProfile}
                          className="hidden" tabIndex={-1}
                          aria-invalid={profileErrors.documentLogo ? true : undefined}
                          aria-describedby={profileErrors.documentLogo ? `${id}-documentLogo-error` : undefined}
                          onChange={(event) => void readLogo(event)} />
                        <Button type="button" variant="secondary" size="compact" disabled={readingLogo || savingProfile}
                          onClick={() => logoInputRef.current?.click()}>
                          Selecionar logotipo
                        </Button>
                      </Field>
                      {readingLogo && <p role="status" className={textStyle('helper')}>Carregando logotipo…</p>}
                      {draft.documentLogo && <div className="flex items-center gap-4">
                        {/* Inline PNG preview uses the same bytes persisted for the PDF. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={draft.documentLogo} alt="Prévia do logotipo do consultório" className="h-16 w-32 object-contain object-left" />
                        <Button type="button" variant="quiet" size="compact" disabled={readingLogo || savingProfile}
                          onClick={() => { setField('documentLogo', null); if (logoInputRef.current) logoInputRef.current.value = ''; }}>
                          Remover logotipo
                        </Button>
                      </div>}

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={`${id}-showOnDocuments`}
                          checked={draft.showOnDocuments}
                          onCheckedChange={(checked) => setField('showOnDocuments', checked)}
                          aria-label="Exibir meus dados profissionais nos PDFs de dieta"
                          className="-m-2 shrink-0"
                        />
                        <div className="flex flex-col gap-1">
                          <span className={textStyle('body')}>Exibir meus dados profissionais nos PDFs de dieta</span>
                          <span className={textStyle('helper')}>
                            {draft.showOnDocuments && signaturePreview ? `Assinatura: ${signaturePreview}` : 'Os PDFs não identificam o profissional responsável.'}
                          </span>
                        </div>
                      </div>
                    </Section>

                    <FormFooter feedback={profileFeedback} formError={profileErrors.form}>
                      <Button type="button" variant="secondary" size="standard" disabled={!profileDirty || savingProfile || readingLogo}
                        onClick={() => { setDraft(baseline); setProfileErrors({}); setProfileFeedback(null); }}>
                        Descartar alterações
                      </Button>
                      <Button type="submit" variant="primary" size="standard" disabled={!profileDirty || savingProfile || readingLogo} loading={savingProfile}>
                        Salvar perfil
                      </Button>
                    </FormFooter>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="subscription" className="min-h-0 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-2 py-4">
                  <p className={textStyle('body')}>A gestão da assinatura estará disponível em breve.</p>
                  <p className={textStyle('body-secondary')}>
                    Aqui você poderá gerenciar plano, ciclo de cobrança, renovação automática, pagamento, faturas e cancelamento.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="save" className="min-h-0 flex-1 space-y-6 overflow-y-auto">
                <fieldset disabled={profileDirty || saveDirty || savingProfile || savingSave || syncing || readingLogo || resettingPassword} className="min-w-0">
                  <legend className="sr-only">Gerenciar saves e backups</legend>
                  {savesContent}
                </fieldset>
                {(profileDirty || saveDirty) && <p role="status" className={textStyle('helper')}>Salve ou descarte as alterações das configurações antes de gerenciar os arquivos.</p>}
                {!save.details ? (
                  <div className="flex flex-col items-start gap-2 py-4">
                    <p className={textStyle('body')}>Nenhum save está aberto nesta sessão.</p>
                    <p className={textStyle('helper')}>
                      Abra ou crie um save nesta aba para editar as configurações dele.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submitSave} noValidate aria-busy={savingSave} aria-label="Configurações do save" className="flex flex-col gap-6">
                    <Section title="Identificação do save">
                      <div className="grid grid-cols-2 gap-4">
                        <Field id={`${id}-saveName`} label="Nome do save" error={saveError ?? undefined} required hint="Também aparece na lista de saves da conta.">
                          <Input id={`${id}-saveName`} maxLength={SAVE_LABEL_MAX} disabled={!save.editable || busy}
                            aria-invalid={saveError ? true : undefined} aria-describedby={saveError ? `${id}-saveName-error` : undefined}
                            value={saveDraft.displayName}
                            onChange={(event) => { setSaveDraft({ ...saveDraft, displayName: event.target.value }); setSaveError(null); setSaveFeedback(null); }} />
                        </Field>
                        <Field id={`${id}-savePhone`} label="Telefone do consultório">
                          <Input id={`${id}-savePhone`} type="tel" inputMode="numeric" placeholder="(11) 99999-9999" disabled={!save.editable || busy}
                            value={saveDraft.phone}
                            onChange={(event) => { setSaveDraft({ ...saveDraft, phone: formatWhatsappContact(event.target.value) }); setSaveFeedback(null); }} />
                        </Field>
                      </div>
                    </Section>

                    <Section title="Arquivo e sincronização">
                      <dl className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <dt className={textStyle('field-label')}>Arquivo</dt>
                          <dd className={textStyle('field-value')}>{save.fileName ?? 'Não associado'}</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                          <dt className={textStyle('field-label')}>Estado</dt>
                          <dd className={textStyle('field-value')} data-sync-state={save.syncState}>{syncLabels[save.syncState]}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button type="button" variant="secondary" size="compact" onClick={() => void syncNow()} disabled={!save.editable || syncing || busy} loading={syncing}>
                          <RefreshCw className="size-4" aria-hidden="true" />
                          Sincronizar agora
                        </Button>
                      </div>
                    </Section>

                    <FormFooter feedback={saveFeedback}>
                      <Button type="button" variant="secondary" size="standard" disabled={!saveDirty || savingSave}
                        onClick={() => { setSaveDraft(saveBaseline); setSaveError(null); setSaveFeedback(null); }}>
                        Descartar alterações
                      </Button>
                      <Button type="submit" variant="primary" size="standard" disabled={busy || !save.editable || !(saveDirty || saveRetryable) || savingSave} loading={savingSave}>
                        Salvar configurações do save
                      </Button>
                    </FormFooter>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </fieldset>
        </DialogContent>
      </Dialog>

      <ConfirmationAlertDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Descartar alterações?"
        description="Há alterações não salvas nas configurações. Deseja descartá-las e fechar?"
        confirmLabel="Sim, descartar"
        cancelLabel="Continuar editando"
        confirmVariant="destructive"
        overlayLayer="modal"
        onConfirm={discardChanges}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-border-divider pt-4 first:border-t-0 first:pt-0">
      <legend className={`${textStyle('subsection-title')} float-left w-full`}>{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ id, label, error, hint, required = false, children }: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={textStyle('field-label')}>
        {label}
        {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className={textStyle('validation-error')}>{error}</p>
      ) : hint ? (
        <p className={textStyle('helper')}>{hint}</p>
      ) : null}
    </div>
  );
}

function FormFooter({ feedback, formError, children }: {
  feedback: { kind: 'status' | 'error'; message: string } | null;
  formError?: string;
  children: ReactNode;
}) {
  const message = formError ?? feedback?.message;
  const isError = Boolean(formError) || feedback?.kind === 'error';
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border-divider pt-4">
      <p role={isError ? 'alert' : 'status'} className={textStyle(isError ? 'validation-error' : 'validation-success')}>
        {message ?? ''}
      </p>
      <div className="flex shrink-0 gap-2">{children}</div>
    </div>
  );
}
