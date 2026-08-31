import { afterEach, describe, expect, it } from 'vitest';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import { SingleTabLock } from '@/lib/infrastructure/local-db/single-tab-lock';

type LockCallback = (lock: Lock | null) => Promise<unknown> | unknown;

let originalLocks: unknown;

afterEach(() => {
  if (originalLocks === undefined) {
    Reflect.deleteProperty(navigator, 'locks');
  } else {
    Object.defineProperty(navigator, 'locks', { configurable: true, value: originalLocks });
  }
  originalLocks = undefined;
});

function installLockManager(manager: { request: (name: string, options: { mode: 'exclusive'; ifAvailable: true }, callback: LockCallback) => Promise<unknown> }): void {
  originalLocks = (navigator as Navigator & { locks?: unknown }).locks;
  Object.defineProperty(navigator, 'locks', { configurable: true, value: manager });
}

describe('single-tab local runtime lock', () => {
  it('fails closed when Web Locks is unavailable', async () => {
    installLockManager({ request: async () => undefined });
    Reflect.deleteProperty(navigator, 'locks');

    await expect(new SingleTabLock('diet-test').acquire()).rejects.toMatchObject({ code: 'PERSISTENCE_UNAVAILABLE' });
  });

  it('blocks a second lease before database initialization and releases after the first closes', async () => {
    let held = false;
    const manager = {
      request: async (_name: string, _options: { mode: 'exclusive'; ifAvailable: true }, callback: LockCallback) => {
        if (held) return callback(null);
        held = true;
        return callback({} as Lock);
      },
    };
    installLockManager(manager);

    const first = await new SingleTabLock('diet-test').acquire();
    await expect(new SingleTabLock('diet-test').acquire()).rejects.toMatchObject({ code: 'PERSISTENCE_UNAVAILABLE' });
    await first.release();
    held = false;
    const second = await new SingleTabLock('diet-test').acquire();
    await second.release();
  });

  it('preserves the typed lock failure rather than exposing a raw browser exception', async () => {
    installLockManager({ request: async () => { throw new DOMException('denied', 'SecurityError'); } });

    const error = await new SingleTabLock('diet-test').acquire().catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(DietDomainError);
    expect(error).toMatchObject({ code: 'PERSISTENCE_UNAVAILABLE' });
  });
});
