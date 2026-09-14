import { PocError } from '../contracts';

export interface LockLease {
  release(): Promise<void>;
}

interface LockManagerLike {
  request<T>(
    name: string,
    options: { mode: 'exclusive'; ifAvailable: true },
    callback: (lock: Lock | null) => Promise<T> | T,
  ): Promise<T>;
}

function getLockManager(): LockManagerLike | undefined {
  if (typeof navigator === 'undefined' || !('locks' in navigator)) {
    return undefined;
  }
  return (navigator as Navigator & { locks: LockManagerLike }).locks;
}

export class SingleTabLock {
  constructor(private readonly name = 'nutridiet:local-db-proof:active') {}

  async acquire(): Promise<LockLease> {
    const manager = getLockManager();
    if (!manager) {
      throw new PocError(
        'LOCK_UNAVAILABLE',
        'acquire-single-tab-lock',
        'Web Locks não está disponível; a PoC não abrirá uma segunda instância.',
        { lockName: this.name },
      );
    }

    let acquiredResolver: (value: boolean) => void = () => undefined;
    const acquiredPromise = new Promise<boolean>((resolve) => {
      acquiredResolver = resolve;
    });
    let releaseResolver: () => void = () => undefined;
    const releasePromise = new Promise<void>((resolve) => {
      releaseResolver = resolve;
    });
    let request: Promise<unknown>;

    try {
      request = manager.request(this.name, { mode: 'exclusive', ifAvailable: true }, async (lock) => {
        if (!lock) {
          acquiredResolver(false);
          return undefined;
        }

        acquiredResolver(true);
        await releasePromise;
        return undefined;
      });
      const acquired = await Promise.race([acquiredPromise, request.then(() => false)]);
      if (!acquired) {
        await request;
        throw new PocError(
          'LOCK_UNAVAILABLE',
          'acquire-single-tab-lock',
          'Acesso bloqueado: outra aba já opera a base local.',
          { lockName: this.name },
        );
      }
    } catch (cause) {
      if (cause instanceof PocError) {
        throw cause;
      }
      throw new PocError(
        'LOCK_UNAVAILABLE',
        'acquire-single-tab-lock',
        'A exclusividade da instância não pôde ser confirmada.',
        { lockName: this.name },
        { cause },
      );
    }

    let released = false;
    const onPageHide = (event: PageTransitionEvent): void => {
      if (!event.persisted) {
        releaseResolver();
      }
    };
    // Complete the lock callback at document termination without starting async
    // filesystem work. A cached (resumable) document must retain its lease.
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', onPageHide);
    }
    return {
      release: async () => {
        if (released) {
          return;
        }
        released = true;
        if (typeof window !== 'undefined') {
          window.removeEventListener('pagehide', onPageHide);
        }
        releaseResolver();
        await request;
      },
    };
  }
}

export function isSingleTabLockSupported(): boolean {
  return getLockManager() !== undefined;
}
