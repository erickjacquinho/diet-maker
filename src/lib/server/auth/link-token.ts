import 'server-only';

import { decryptServerValue, encryptServerValue } from '../save-keys';

export type AuthLinkPurpose = 'email' | 'recovery';

const lifetimeMs = 15 * 60 * 1000;
const tokenPattern = /^[A-Za-z0-9._~-]{1,512}$/;

export const emailConfirmationCookieName = 'dietmaker_email_confirmation';
export const emailConfirmationCookiePath = '/api/auth/confirm-email';
export const recoveryCookieName = 'dietmaker_password_recovery';
export const recoveryCookiePath = '/api/auth/reset-password';

export function sealAuthLinkToken(tokenHash: string, purpose: AuthLinkPurpose, now = Date.now()): string {
  if (!tokenPattern.test(tokenHash) || !Number.isSafeInteger(now)) throw new TypeError('A valid auth link token is required.');
  const encrypted = encryptServerValue(
    'auth-link-token',
    [purpose],
    Buffer.from(JSON.stringify({ version: 1, purpose, expiresAt: now + lifetimeMs, tokenHash })),
  );
  return `v1.${encrypted.kekId}.${encrypted.iv.toString('base64url')}.${encrypted.ciphertext.toString('base64url')}`;
}

export function openAuthLinkToken(
  sealed: string,
  purpose: AuthLinkPurpose,
  now = Date.now(),
): { purpose: AuthLinkPurpose; tokenHash: string } | null {
  if (sealed.length > 4096 || !Number.isSafeInteger(now)) return null;
  const [version, kekId, ivText, ciphertextText, extra] = sealed.split('.');
  if (
    version !== 'v1'
    || extra !== undefined
    || !/^[\da-zA-Z._-]{1,80}$/.test(kekId ?? '')
    || !/^[A-Za-z0-9_-]{16}$/.test(ivText ?? '')
    || !/^[A-Za-z0-9_-]{22,2048}$/.test(ciphertextText ?? '')
  ) return null;

  const iv = Buffer.from(ivText, 'base64url');
  const ciphertext = Buffer.from(ciphertextText, 'base64url');
  if (iv.toString('base64url') !== ivText || ciphertext.toString('base64url') !== ciphertextText) return null;

  let cleartext: Buffer;
  try {
    cleartext = decryptServerValue({ ciphertext, iv, kekId }, 'auth-link-token', [purpose]);
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(cleartext.toString('utf8')) as Record<string, unknown>;
    if (
      Object.keys(payload).length !== 4
      || payload.version !== 1
      || payload.purpose !== purpose
      || typeof payload.expiresAt !== 'number'
      || !Number.isSafeInteger(payload.expiresAt)
      || payload.expiresAt <= now
      || payload.expiresAt > now + lifetimeMs
      || typeof payload.tokenHash !== 'string'
      || !tokenPattern.test(payload.tokenHash)
    ) return null;
    return { purpose, tokenHash: payload.tokenHash };
  } catch {
    return null;
  } finally {
    cleartext.fill(0);
  }
}
