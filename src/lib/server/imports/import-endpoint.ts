import 'server-only';

import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { NUTRIDIET_IMPORT_MAX_BYTES, parseImportResultDto, type ImportResultDto } from '@/lib/contracts/imports';
import { defineEndpoint } from '../api/define-endpoint';
import { ApiError } from '../api/api-errors';
import { accountKeys } from '../crypto/account-keys';
import { importNutridietEnvelope } from './nutridiet-importer';
import { readNutridiet } from './nutridiet-reader';

/**
 * The browser sends the `.nutridiet` file as-is. `Idempotency-Key` must be the file's SHA-256 (hex):
 * the server recomputes it, so a retry of the same file returns the stored summary without writing again.
 */
export const importNutridietEndpoint = defineEndpoint({
  input: { parse: (text: unknown) => ({ text: String(text) }) },
  rawBody: { maxBytes: NUTRIDIET_IMPORT_MAX_BYTES },
  output: { parse: parseImportResultDto },
  rateLimit: 'mutation',
  async handler(context): Promise<ImportResultDto> {
    const { text } = context.input;
    const digest = createHash('sha256').update(text, 'utf8').digest('hex');
    if (context.request.headers.get('idempotency-key')?.toLowerCase() !== digest) throw new ApiError(400, 'INVALID_REQUEST');

    const accountId = context.account.id;
    const previous = await context.tx.execute(sql`
      SELECT source_format, summary FROM app.import_runs WHERE account_id = ${accountId} AND idempotency_key = ${digest}`);
    const stored = previous.rows[0] as { source_format: ImportResultDto['format']; summary: ImportResultDto['summary'] } | undefined;
    if (stored) return { replayed: true, format: stored.source_format, summary: stored.summary };

    const { format, envelope } = await readNutridiet(text, {
      ownerId: context.user.id,
      confirmPlaintext: context.request.headers.get('x-confirm-plaintext-import') === 'true',
    });
    const summary = await importNutridietEnvelope(context.tx, accountKeys.createSealer(context.tx, accountId), accountId, envelope);
    await context.tx.execute(sql`
      INSERT INTO app.import_runs (account_id, idempotency_key, source_format, summary)
      VALUES (${accountId}, ${digest}, ${format}, ${JSON.stringify(summary)}::jsonb)`);
    return { replayed: false, format, summary };
  },
});
