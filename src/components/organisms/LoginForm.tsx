'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/ui/input';
import { textStyle } from '@/design-system';
import { useRouter } from 'next/navigation';
import { revokePendingBrowserSession } from '@/lib/application/browser-composition';

export function LoginForm() {
  const router = useRouter();
  const id = useId();
  const [csrfToken, setCsrfToken] = useState('');
  const [csrfFailed, setCsrfFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    void revokePendingBrowserSession()
      .then(() => fetch('/api/auth/csrf', { cache: 'no-store', credentials: 'same-origin' }))
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
    const form = event.currentTarget;
    const values = new FormData(form);
    const email = String(values.get('email') ?? '').trim();
    const password = String(values.get('password') ?? '');
    const nextErrors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Informe um e-mail válido.';
    if (!password) nextErrors.password = 'Informe sua senha.';
    setFieldErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      window.setTimeout(() => document.getElementById(`${id}-${firstInvalid}`)?.focus(), 0);
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, csrfToken }),
      });
      const body = await response.json() as { destination?: unknown };
      if (!response.ok) {
        setError(response.status === 401 ? 'E-mail ou senha inválidos.' : 'Não foi possível entrar agora. Tente novamente.');
        return;
      }
      const destination = body.destination;
      router.replace(destination === '/criar-conta?completar=1' ? destination : '/dashboard');
    } catch {
      setError('Não foi possível entrar agora. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} aria-label="Entrar na sua conta" noValidate aria-busy={pending} className="flex flex-col gap-4">
      {csrfFailed && <p role="alert" className={textStyle('validation-error')}>Não foi possível preparar o formulário. Recarregue a página.</p>}
      {error && <p role="alert" tabIndex={-1} className={textStyle('validation-error')}>{error}</p>}
      <Field id={`${id}-email`} label="E-mail" error={fieldErrors.email}>
        <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
          onChange={() => setFieldErrors((current) => ({ ...current, email: '' }))} />
      </Field>
      <Field id={`${id}-password`} label="Senha" error={fieldErrors.password}>
        <Input id={`${id}-password`} name="password" type="password" autoComplete="current-password" required
          aria-invalid={fieldErrors.password ? true : undefined}
          aria-describedby={fieldErrors.password ? `${id}-password-error` : undefined}
          onChange={() => setFieldErrors((current) => ({ ...current, password: '' }))} />
      </Field>
      <Button type="submit" variant="primary" disabled={!csrfToken || pending || csrfFailed} loading={pending}>
        Entrar
      </Button>
      <a href="/recuperar-senha" className={`${textStyle('link-inline')} self-start`}>
        Esqueceu a senha?
      </a>
      {!csrfToken && !csrfFailed && <p role="status" className={textStyle('helper')}>Preparando acesso seguro…</p>}
    </form>
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
