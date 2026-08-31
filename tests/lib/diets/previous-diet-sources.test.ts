import { describe, expect, it, vi } from 'vitest';
import { createDietCopyCommands } from '@/lib/application/diets/diet-copy-commands';

describe('previous diet sources', () => {
  it('delegates a same-scope, newest-first confirmed projection and never includes drafts', async () => {
    const reader = { listPreviousSources: vi.fn(async () => [{ plan: { id: 'new', activatedAt: '2026-08-30', status: 'ACTIVE' } as never, activeVariation: null }]) };
    const dependencies = { accountContext: { requireActive: vi.fn(async () => ({ accountId: 'account-a', account: {} as never })), getActive: vi.fn() }, patientReader: { getById: vi.fn(async () => ({ archivedAt: null })) } as never, repository: {} as never, draftStore: {} as never, dietReader: reader as never };
    await expect(createDietCopyCommands(dependencies).listPreviousDietSources('patient-a')).resolves.toEqual([{ plan: expect.objectContaining({ id: 'new' }), activeVariation: null }]);
  });
});
