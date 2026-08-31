import { DietDomainError } from '@/lib/domain/diets/diet-errors';

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
  if (typeof navigator === 'undefined' || !('locks' in navigator)) return undefined;
  return (navigator as Navigator & { locks: LockManagerLike }).locks;
}

export class SingleTabLock {
  constructor(private readonly name = 'nutridiet:local-db:active') {}

  async acquire(): Promise<LockLease> {
    const manager = getLockManager();
    if (!manager) {
      throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'Web Locks não está disponível; a base local não será aberta nesta aba.', { lockName: this.name });
    }

    let acquiredResolver: (value: boolean) => void = () => undefined;
    const acquiredPromise = new Promise<boolean>((resolve) => { acquiredResolver = resolve; });
    let releaseResolver: () => void = () => undefined;
    const releasePromise = new Promise<void>((resolve) => { releaseResolver = resolve; });
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
        throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'Acesso bloqueado: outra aba já opera a base local.', { lockName: this.name });
      }
    } catch (cause) {
      if (cause instanceof DietDomainError) throw cause;
      throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'A exclusividade da base local não pôde ser confirmada.', { lockName: this.name, cause });
    }

    let released = false;
    const onPageHide = (event: PageTransitionEvent): void => {
      if (!event.persisted) releaseResolver();
    };
    if (typeof window !== 'undefined') window.addEventListener('pagehide', onPageHide);

    return {
      release: async () => {
        if (released) return;
        released = true;
        if (typeof window !== 'undefined') window.removeEventListener('pagehide', onPageHide);
        releaseResolver();
        await request;
      },
    };
  }
}

export function isSingleTabLockSupported(): boolean {
  return getLockManager() !== undefined;
}
