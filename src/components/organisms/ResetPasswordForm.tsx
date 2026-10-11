'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/ui/input';
import { textStyle } from '@/design-system';

export function ResetPasswordForm() {
  const id = useId();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [csrfFailed, setCsrfFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [complete, setComplete] = useState(false);

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

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setExpired(false);
    const values = new FormData(event.currentTarget);
    const password = String(values.get('password') ?? '');
    const passwordConfirmation = String(values.get('passwordConfirmation') ?? '');
    const nextErrors: Record<string, string> = {};
    if (Array.from(password).length < 12 || new TextEncoder().encode(password).length > 72) {
      nextErrors.password = 'A senha precisa ter pelo menos 12 caracteres e no máximo 72 bytes.';
    }
    if (password !== passwordConfirmation) nextErrors.passwordConfirmation = 'As senhas precisam ser iguais.';
    setFieldErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      window.setTimeout(() => document.getElementById(`${id}-${firstInvalid}`)?.focus(), 0);
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password, passwordConfirmation, csrfToken }),
      });
      const body = await response.json() as { code?: unknown; message?: unknown };
      if (response.ok) {
        setComplete(true);
      } else if (body.code === 'RECOVERY_LINK_INVALID') {
        setExpired(true);
        setError('Este link expirou ou já foi usado. Solicite uma nova recuperação.');
      } else {
        setError(body.code === 'RECOVERY_UNAVAILABLE' && typeof body.message === 'string'
          ? body.message
          : 'Não foi possível redefinir a senha agora. Tente novamente.');
      }
    } catch {
      setError('Não foi possível redefinir a senha agora. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-6" aria-labelledby={`${id}-title`}>
      <header className="flex flex-col gap-2">
        <h1 id={`${id}-title`} className={textStyle('page-title')}>Defina uma nova senha</h1>
        <p className={textStyle('body-secondary')}>Escolha uma senha com pelo menos 12 caracteres para sua conta profissional.</p>
      </header>

      {complete ? (
        <div role="status" className={`${textStyle('body')} rounded-control border border-success-border bg-success-soft p-4 text-success`}>
          <p>Sua senha foi alterada. Entre com a nova senha.</p>
          <a href="/login" className={`${textStyle('link-inline')} mt-4 inline-block`}>Ir para o login</a>
        </div>
      ) : (
        <form onSubmit={submit} aria-label="Definir nova senha" noValidate aria-busy={pending} className="flex flex-col gap-4">
          {csrfFailed && <p role="alert" className={textStyle('validation-error')}>Não foi possível preparar o formulário. Recarregue a página.</p>}
          {error && <p ref={errorRef} role="alert" tabIndex={-1} className={textStyle('validation-error')}>{error}</p>}

          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-password`} className={textStyle('field-label')}>Nova senha</label>
            <Input
              id={`${id}-password`}
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? `${id}-password-error` : undefined}
              onChange={() => setFieldErrors((current) => ({ ...current, password: '' }))}
            />
            <span className={textStyle('helper')}>Use pelo menos 12 caracteres.</span>
            {fieldErrors.password && <p id={`${id}-password-error`} role="alert" className={textStyle('validation-error')}>{fieldErrors.password}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-passwordConfirmation`} className={textStyle('field-label')}>Confirme a nova senha</label>
            <Input
              id={`${id}-passwordConfirmation`}
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              aria-invalid={fieldErrors.passwordConfirmation ? true : undefined}
              aria-describedby={fieldErrors.passwordConfirmation ? `${id}-passwordConfirmation-error` : undefined}
              onChange={() => setFieldErrors((current) => ({ ...current, passwordConfirmation: '' }))}
            />
            {fieldErrors.passwordConfirmation && <p id={`${id}-passwordConfirmation-error`} role="alert" className={textStyle('validation-error')}>{fieldErrors.passwordConfirmation}</p>}
          </div>

          <Button type="submit" variant="primary" disabled={!csrfToken || pending || csrfFailed} loading={pending}>
            Alterar senha
          </Button>
          {!csrfToken && !csrfFailed && <p role="status" className={textStyle('helper')}>Preparando acesso seguro…</p>}
          {expired && <a href="/recuperar-senha" className={textStyle('link-inline')}>Solicitar outra recuperação</a>}
        </form>
      )}
      {!complete && <a href="/login" className={`${textStyle('link-inline')} self-start`}>Voltar para o login</a>}
    </section>
  );
}
