'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { SelectField } from '@/components/atoms/SelectField';
import { Input } from '@/components/ui/input';
import { textStyle } from '@/design-system';

export type RegistrationFormMode = 'signup' | 'confirm' | 'complete';
type ExperienceKind = 'months_1_6' | 'months_6_12' | 'years';

const experienceOptions = [
  { value: 'months_1_6', label: 'De 1 a 6 meses' },
  { value: 'months_6_12', label: 'De 6 a 12 meses' },
  { value: 'years', label: 'Em anos' },
] as const;

export function RegistrationForm({ mode }: { mode: RegistrationFormMode }) {
  const router = useRouter();
  const id = useId();
  const [csrfToken, setCsrfToken] = useState('');
  const [csrfFailed, setCsrfFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [experience, setExperience] = useState<ExperienceKind | ''>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    void fetch('/api/auth/csrf', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const body = await response.json() as { csrfToken?: unknown };
        if (typeof body.csrfToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.csrfToken)) throw new Error();
        if (active) setCsrfToken(body.csrfToken);
      })
      .catch(() => { if (active) setCsrfFailed(true); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('');
    if (mode === 'confirm') {
      await post('/api/auth/confirm-email', { csrfToken }, 'E-mail confirmado. Agora você já pode entrar.');
      return;
    }

    const form = event.currentTarget;
    const values = new FormData(form);
    const nextErrors = validateProfile(values, mode, experience);
    setFieldErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      window.setTimeout(() => document.getElementById(`${id}-${firstInvalid}`)?.focus(), 0);
      return;
    }
    if (!experience) return;

    const averagePatientsPerMonth = Number(values.get('averagePatientsPerMonth'));
    const experienceValue = experience === 'years'
      ? { kind: 'years', value: Number(values.get('experienceYears')) }
      : { kind: experience };
    const profile = {
      firstName: String(values.get('firstName')).trim(),
      lastName: String(values.get('lastName')).trim(),
      averagePatientsPerMonth,
      experience: experienceValue,
    };

    if (mode === 'signup') {
      await post('/api/auth/signup', {
        ...profile,
        email: String(values.get('email')).trim(),
        emailConfirmation: String(values.get('emailConfirmation')).trim(),
        password: String(values.get('password')),
        passwordConfirmation: String(values.get('passwordConfirmation')),
        csrfToken,
      }, 'Se for possível usar este e-mail, você receberá as instruções.');
      return;
    }

    await post('/api/auth/complete-profile', { ...profile, csrfToken });
  }

  async function post(path: string, body: Record<string, unknown>, successMessage?: string) {
    setPending(true);
    try {
      const response = await fetch(path, {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setError(response.status === 401
          ? 'Sua sessão expirou. Entre novamente.'
          : 'Não foi possível concluir agora. Tente novamente.');
        return;
      }
      if (mode === 'complete') {
        router.replace('/saves');
        return;
      }
      setStatus(successMessage ?? 'E-mail confirmado. Agora você já pode entrar.');
    } catch {
      setError('Não foi possível concluir agora. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  const title = mode === 'confirm'
    ? 'Confirme seu e-mail'
    : mode === 'complete'
      ? 'Conclua seu cadastro'
      : 'Crie sua conta profissional';

  return (
    <section className="flex flex-col gap-6" aria-labelledby={`${id}-title`}>
      <header className="flex flex-col gap-2">
        <h1 id={`${id}-title`} className={textStyle('page-title')}>{title}</h1>
        <p className={textStyle('body-secondary')}>
          {mode === 'confirm'
            ? 'Continue para confirmar o endereço usado na criação da conta.'
            : mode === 'complete'
              ? 'Informe seus dados profissionais para acessar seus saves.'
              : 'Crie seu acesso para organizar seus saves do NutriDiet.'}
        </p>
      </header>

      {status ? (
        <div role="status" className={`${textStyle('body')} rounded-control border border-success-border bg-success-soft p-4 text-success`}>
          <p>{status}</p>
          {mode !== 'complete' && <a href="/login" className={`${textStyle('link-inline')} mt-4 inline-block`}>Ir para o login</a>}
        </div>
      ) : (
        <form onSubmit={submit} aria-labelledby={`${id}-title`} noValidate aria-busy={pending} className="flex flex-col gap-4">
          {csrfFailed && <p role="alert" className={textStyle('validation-error')}>Não foi possível preparar o formulário. Recarregue a página.</p>}
          {error && <p role="alert" tabIndex={-1} className={textStyle('validation-error')}>{error}</p>}

          {mode === 'confirm' ? (
            <Button type="submit" variant="primary" disabled={!csrfToken || pending || csrfFailed} loading={pending}>
              Confirmar e-mail
            </Button>
          ) : (
            <>
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field id={`${id}-email`} label="E-mail" error={fieldErrors.email}>
                    <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required
                      aria-invalid={fieldErrors.email ? true : undefined}
                      aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
                      onChange={() => clearError(setFieldErrors, 'email')} />
                  </Field>
                  <Field id={`${id}-emailConfirmation`} label="Confirme o e-mail" error={fieldErrors.emailConfirmation}>
                    <Input id={`${id}-emailConfirmation`} name="emailConfirmation" type="email" autoComplete="email" required
                      aria-invalid={fieldErrors.emailConfirmation ? true : undefined}
                      aria-describedby={fieldErrors.emailConfirmation ? `${id}-emailConfirmation-error` : undefined}
                      onChange={() => clearError(setFieldErrors, 'emailConfirmation')} />
                  </Field>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field id={`${id}-firstName`} label="Nome" error={fieldErrors.firstName}>
                  <Input id={`${id}-firstName`} name="firstName" autoComplete="given-name" required
                    aria-invalid={fieldErrors.firstName ? true : undefined}
                    aria-describedby={fieldErrors.firstName ? `${id}-firstName-error` : undefined}
                    onChange={() => clearError(setFieldErrors, 'firstName')} />
                </Field>
                <Field id={`${id}-lastName`} label="Sobrenome" error={fieldErrors.lastName}>
                  <Input id={`${id}-lastName`} name="lastName" autoComplete="family-name" required
                    aria-invalid={fieldErrors.lastName ? true : undefined}
                    aria-describedby={fieldErrors.lastName ? `${id}-lastName-error` : undefined}
                    onChange={() => clearError(setFieldErrors, 'lastName')} />
                </Field>
              </div>

              <Field id={`${id}-averagePatientsPerMonth`} label="Média de pacientes por mês" error={fieldErrors.averagePatientsPerMonth}>
                <Input id={`${id}-averagePatientsPerMonth`} name="averagePatientsPerMonth" type="number" min="0" step="any" inputMode="decimal" required
                  aria-invalid={fieldErrors.averagePatientsPerMonth ? true : undefined}
                  aria-describedby={fieldErrors.averagePatientsPerMonth ? `${id}-averagePatientsPerMonth-error` : undefined}
                  onChange={() => clearError(setFieldErrors, 'averagePatientsPerMonth')} />
              </Field>

              <div>
                <SelectField<ExperienceKind | ''>
                  id={`${id}-experience`}
                  label="Experiência profissional"
                  value={experience}
                  onValueChange={(value) => {
                    setExperience(value);
                    clearError(setFieldErrors, 'experience');
                  }}
                  placeholder="Selecione uma faixa"
                  options={experienceOptions}
                  required
                  state={fieldErrors.experience ? 'error' : 'default'}
                  errorMessage={fieldErrors.experience}
                  aria-describedby={fieldErrors.experience ? `${id}-experience-error` : undefined}
                />
              </div>

              {experience === 'years' && (
                <Field id={`${id}-experienceYears`} label="Anos de experiência" error={fieldErrors.experienceYears}>
                  <Input id={`${id}-experienceYears`} name="experienceYears" type="number" min="0" step="any" inputMode="decimal" required
                    aria-invalid={fieldErrors.experienceYears ? true : undefined}
                    aria-describedby={fieldErrors.experienceYears ? `${id}-experienceYears-error` : undefined}
                    onChange={() => clearError(setFieldErrors, 'experienceYears')} />
                </Field>
              )}

              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field id={`${id}-password`} label="Senha" error={fieldErrors.password}>
                    <Input id={`${id}-password`} name="password" type="password" autoComplete="new-password" minLength={12} required
                      aria-invalid={fieldErrors.password ? true : undefined}
                      aria-describedby={fieldErrors.password ? `${id}-password-error` : undefined}
                      onChange={() => clearError(setFieldErrors, 'password')} />
                    <span className={textStyle('helper')}>Use pelo menos 12 caracteres.</span>
                  </Field>
                  <Field id={`${id}-passwordConfirmation`} label="Confirme a senha" error={fieldErrors.passwordConfirmation}>
                    <Input id={`${id}-passwordConfirmation`} name="passwordConfirmation" type="password" autoComplete="new-password" minLength={12} required
                      aria-invalid={fieldErrors.passwordConfirmation ? true : undefined}
                      aria-describedby={fieldErrors.passwordConfirmation ? `${id}-passwordConfirmation-error` : undefined}
                      onChange={() => clearError(setFieldErrors, 'passwordConfirmation')} />
                  </Field>
                </div>
              )}

              <Button type="submit" variant="primary" disabled={!csrfToken || pending || csrfFailed} loading={pending}>
                {mode === 'complete' ? 'Concluir cadastro' : 'Criar conta'}
              </Button>
            </>
          )}
          {!csrfToken && !csrfFailed && <p role="status" className={textStyle('helper')}>Preparando acesso seguro…</p>}
        </form>
      )}
      {mode !== 'confirm' && mode !== 'complete' && <p className={textStyle('body-secondary')}>Já tem uma conta? <a href="/login" className={textStyle('link-inline')}>Entrar</a></p>}
    </section>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={textStyle('field-label')}>{label}</label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className={textStyle('validation-error')}>{error}</p>}
    </div>
  );
}

function validateProfile(values: FormData, mode: RegistrationFormMode, experience: ExperienceKind | ''): Record<string, string> {
  const errors: Record<string, string> = {};
  const value = (name: string) => String(values.get(name) ?? '');
  if (!value('firstName').trim()) errors.firstName = 'Informe seu nome.';
  if (!value('lastName').trim()) errors.lastName = 'Informe seu sobrenome.';

  const average = value('averagePatientsPerMonth');
  if (!average.trim() || !Number.isFinite(Number(average)) || Number(average) < 0) {
    errors.averagePatientsPerMonth = 'Informe um número igual ou maior que zero.';
  }
  if (!experience) errors.experience = 'Selecione sua faixa de experiência.';
  if (experience === 'years') {
    const years = value('experienceYears');
    if (!years.trim() || !Number.isFinite(Number(years)) || Number(years) < 0) {
      errors.experienceYears = 'Informe anos iguais ou maiores que zero.';
    }
  }

  if (mode === 'signup') {
    const email = value('email').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Informe um e-mail válido.';
    if (email !== value('emailConfirmation').trim().toLowerCase()) errors.emailConfirmation = 'Os e-mails precisam ser iguais.';
    const password = value('password');
    if (Array.from(password).length < 12 || new TextEncoder().encode(password).length > 72) {
      errors.password = 'A senha precisa ter pelo menos 12 caracteres e no máximo 72 bytes.';
    }
    if (password !== value('passwordConfirmation')) errors.passwordConfirmation = 'As senhas precisam ser iguais.';
  }
  return errors;
}

function clearError(setErrors: (updater: (current: Record<string, string>) => Record<string, string>) => void, name: string) {
  setErrors((current) => {
    if (!current[name]) return current;
    const next = { ...current };
    delete next[name];
    return next;
  });
}
