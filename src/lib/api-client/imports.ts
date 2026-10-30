import type { ImportResultDto } from '@/lib/contracts/imports';
import { apiRequest } from './client';

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Client for the one-time `.nutridiet` transfer. The file is sent as-is; nothing is parsed in the browser. */
export const importsApi = {
  nutridiet: async (fileText: string, options: { confirmPlaintext?: boolean } = {}) =>
    apiRequest<ImportResultDto>('/api/v1/imports/nutridiet', {
      method: 'POST',
      rawBody: {
        text: fileText,
        headers: {
          'content-type': 'application/octet-stream',
          'idempotency-key': await sha256Hex(fileText),
          ...(options.confirmPlaintext ? { 'x-confirm-plaintext-import': 'true' } : {}),
        },
      },
    }),
};
