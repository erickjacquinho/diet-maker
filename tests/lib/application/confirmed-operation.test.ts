// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { createConfirmedOperationCoordinator } from '@/lib/application/composition-root';

describe('confirmed operation coordinator', () => {
  it('runs the durable sync only after the operation commits and returns its result', async () => {
    const order: string[] = [];
    const coordinator = createConfirmedOperationCoordinator(async () => {
      order.push('sync');
    });

    const result = await coordinator.run(async () => {
      order.push('commit');
      return 'saved';
    });

    expect(result).toBe('saved');
    expect(order).toEqual(['commit', 'sync']);
  });

  it('does not sync when the confirmed operation fails', async () => {
    const sync = vi.fn(async () => undefined);
    const coordinator = createConfirmedOperationCoordinator(sync);

    await expect(coordinator.run(async () => {
      throw new Error('commit failed');
    })).rejects.toThrow('commit failed');

    expect(sync).not.toHaveBeenCalled();
  });
});
