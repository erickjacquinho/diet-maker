'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/ui/input';
import { textStyle } from '@/design-system';

export function RecoveryPasswordForm() {
  const id = useId();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [csrfFailed, setCsrfFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

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
    if (pending) return;
    setError('');
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Informe um e-mail válido.');
      window.setTimeout(() => document.getElementById(`${id}-email`)?.focus(), 0);
      return;
    }

    setFieldError('');
    setPending(true);
    try {
      const response = await fetch('/api/auth/recovery', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, csrfToken }),
      });
      if (response.status === 202) {
        setSent(true);
      } else if (response.status === 429) {
        setError('Muitas tentativas. Aguarde antes de solicitar outro link.');
      } else {
        setError('Não foi possível solicitar a recuperação agora. Tente novamente.');
      }
    } catch {
      setError('Não foi possível solicitar a recuperação agora. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-6" aria-labelledby={`${id}-title`}>
      <header className="flex flex-col gap-2">
        <h1 id={`${id}-title`} className={textStyle('page-title')}>Recuperar senha</h1>
        <p className={textStyle('body-secondary')}>Informe o e-mail da sua conta profissional para receber as instruções, se ela puder receber uma recuperação.</p>
      </header>

      {sent ? (
        <div role="status" className={`${textStyle('body')} rounded-control border border-info-border bg-info-soft p-4 text-info`}>
          <p>Se o endereço puder receber uma recuperação, as instruções serão enviadas.</p>
          <a href="/login" className={`${textStyle('link-inline')} mt-4 inline-block`}>Voltar para o login</a>
        </div>
      ) : (
        <form onSubmit={submit} aria-label="Recuperar senha" noValidate aria-busy={pending} className="flex flex-col gap-4">
          {csrfFailed && <p role="alert" className={textStyle('validation-error')}>Não foi possível preparar o formulário. Recarregue a página.</p>}
          {error && <p ref={errorRef} role="alert" tabIndex={-1} className={textStyle('validation-error')}>{error}</p>}
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-email`} className={textStyle('field-label')}>E-mail</label>
            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? `${id}-email-error` : undefined}
              onChange={() => setFieldError('')}
            />
            {fieldError && <p id={`${id}-email-error`} role="alert" className={textStyle('validation-error')}>{fieldError}</p>}
          </div>
          <Button type="submit" variant="primary" disabled={!csrfToken || pending || csrfFailed} loading={pending}>
            Enviar instruções
          </Button>
          {!csrfToken && !csrfFailed && <p role="status" className={textStyle('helper')}>Preparando acesso seguro…</p>}
        </form>
      )}
      {!sent && <a href="/login" className={`${textStyle('link-inline')} self-start`}>Voltar para o login</a>}
    </section>
  );
}
