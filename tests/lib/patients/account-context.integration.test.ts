import { describe, expect, it } from 'vitest';
import { createActiveAccountContext } from '@/lib/application/account/get-active-account';

describe('active account context', () => {
  it('keeps one stable local account identity across repeated openings', async () => {
    let calls = 0;
    const account = {
      id: 'account-stable',
      displayName: 'Consultório local',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    };
    const context = createActiveAccountContext({
      getActiveOrCreate: async () => {
        calls += 1;
        return account;
      },
    });

    const first = await context.requireActive();
    const second = await context.requireActive();

    expect(first.accountId).toBe('account-stable');
    expect(second).toEqual(first);
    expect(calls).toBe(1);
  });

  it('fails closed when the account cannot be established', async () => {
    const context = createActiveAccountContext({
      getActiveOrCreate: async () => { throw new Error('database unavailable'); },
    });

    await expect(context.requireActive()).rejects.toMatchObject({ code: 'ACCOUNT_CONTEXT_UNAVAILABLE' });
  });
});
