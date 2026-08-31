import { describe, expect, it, vi } from 'vitest';
import { createPatientDietReader } from '@/lib/infrastructure/local-db/diets/pglite-patient-diet-reader';
import type { DietRepository } from '@/lib/application/diets/diet-ports';
import { activeDietFixture, historicalDietFixture } from '../fixtures/diets';

describe('patient diet reader', () => {
  it('projects current/history in descending activation order with explicit capabilities', async () => {
    const repository: DietRepository = {
      getById: vi.fn(async (_account, _patient, id) => id === activeDietFixture.id ? structuredClone(activeDietFixture) : id === historicalDietFixture.id ? structuredClone(historicalDietFixture) : null),
      listConfirmed: vi.fn(async () => [structuredClone(activeDietFixture), structuredClone(historicalDietFixture)]),
      countConfirmed: vi.fn(async () => 2), confirmActive: vi.fn(),
    };
    const reader = createPatientDietReader(repository);
    const summary = await reader.getPatientDietSummary('account-a', 'patient-a');
    expect(summary.current).toMatchObject({ id: activeDietFixture.id, canEdit: true, canDelete: false });
    expect(summary.history[0]).toMatchObject({ id: historicalDietFixture.id, canEdit: false, canOpenReadOnly: true, canUseAsSource: true });
    expect(summary.confirmedCount).toBe(2);
  });

  it('does not expose another scope and only returns immutable snapshots', async () => {
    const repository: DietRepository = {
      getById: vi.fn(async () => null), listConfirmed: vi.fn(async () => []), countConfirmed: vi.fn(async () => 0), confirmActive: vi.fn(),
    };
    const reader = createPatientDietReader(repository);
    await expect(reader.getSnapshot('account-b', 'patient-b', activeDietFixture.id)).resolves.toBeNull();
    await expect(reader.listPreviousSources('account-b', 'patient-b')).resolves.toEqual([]);
  });
});
