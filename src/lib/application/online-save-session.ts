import {
  assertProtectedSaveGrant,
  type ProtectedSaveGrant,
} from '@/lib/domain/protected-save';

const maximumGrantDuration = 8 * 60 * 60 * 1000;
const allowedClockSkew = 60 * 1000;

export type OnlineSaveSessionErrorCode =
  | 'ONLINE_REQUIRED'
  | 'REVOCATION_PENDING'
  | 'INVALID_GRANT'
  | 'SAVE_LOCKED'
  | 'SESSION_BUSY';

export class OnlineSaveSessionError extends Error {
  constructor(readonly code: OnlineSaveSessionErrorCode) {
    super('A sessão do save não está autorizada para esta operação.');
    this.name = 'OnlineSaveSessionError';
  }
}

export interface OnlineSaveRevocationMarker {
  isPending(): boolean;
  markPending(): void;
  clear(): void;
}

export interface OnlineSaveSessionSnapshot {
  readonly status: 'locked' | 'active';
  readonly expiresAt: number | null;
  readonly revocationPending: boolean;
}

export interface OnlineSaveSessionDependencies {
  now?: () => number;
  monotonicNow?: () => number;
  isOnline?: () => boolean;
  revocationMarker?: OnlineSaveRevocationMarker;
}

export interface OnlineSaveSession {
  getSnapshot(): OnlineSaveSessionSnapshot;
  subscribe(listener: (snapshot: OnlineSaveSessionSnapshot) => void): () => void;
  authorize(grant: ProtectedSaveGrant): Promise<void>;
  isAuthorizedFor(grant: Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'>): boolean;
  withOperation<T>(
    identity: Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'>,
    operation: (grant: ProtectedSaveGrant) => Promise<T> | T,
  ): Promise<T>;
  waitForIdle(): Promise<void>;
  onResume(): void;
  lock(options?: { revocationPending?: boolean }): void;
  acknowledgeRemoteRevocation(): void;
}

/** Captured application methods must check the grant when called, including reads. */
export function guardOnlineSaveApplication<T extends object>(application: T, session: OnlineSaveSession, identity: Parameters<OnlineSaveSession['isAuthorizedFor']>[0]): T {
  return new Proxy(application, {
    get(target, property, receiver) {
      const method = Reflect.get(target, property, receiver);
      if (typeof method !== 'function') return method;
      return (...args: unknown[]) => session.withOperation(identity, () => Reflect.apply(method, target, args));
    },
  });
}

/** A local handle is only a location hint; opening also requires the live owner/save grant. */
export function isSaveOpenableAtLocation(
  session: OnlineSaveSession,
  identity: Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'>,
  hasLocatedHandle: boolean,
): boolean {
  return hasLocatedHandle && session.isAuthorizedFor(identity);
}

function sameTuple(
  active: ProtectedSaveGrant,
  candidate: Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'>,
): boolean {
  return active.ownerId === candidate.ownerId
    && active.saveId === candidate.saveId
    && active.localAccountId === candidate.localAccountId
    && active.keyId === candidate.keyId
    && active.bindingProof === candidate.bindingProof;
}

export function createOnlineSaveSession(dependencies: OnlineSaveSessionDependencies = {}): OnlineSaveSession {
  const now = dependencies.now ?? (() => Date.now());
  const monotonicNow = dependencies.monotonicNow ?? (() => globalThis.performance?.now?.() ?? Date.now());
  const isOnline = dependencies.isOnline ?? (() => typeof navigator === 'undefined' || navigator.onLine !== false);
  const marker = dependencies.revocationMarker;
  const listeners = new Set<(snapshot: OnlineSaveSessionSnapshot) => void>();
  let activeGrant: ProtectedSaveGrant | null = null;
  let status: OnlineSaveSessionSnapshot['status'] = 'locked';
  let expiresAt: number | null = null;
  let monotonicDeadline: number | null = null;
  let inFlight = 0;
  const idleWaiters = new Set<() => void>();
  let revocationPending = readPendingMarker();

  function readPendingMarker(): boolean {
    try {
      return marker?.isPending() ?? false;
    } catch {
      return true;
    }
  }

  function snapshot(): OnlineSaveSessionSnapshot {
    return { status, expiresAt: status === 'active' ? expiresAt : null, revocationPending };
  }

  function notify(): void {
    const current = snapshot();
    for (const listener of listeners) listener(current);
  }

  function discardGrantWhenIdle(): void {
    if (status === 'locked' && inFlight === 0) {
      activeGrant = null;
      expiresAt = null;
      monotonicDeadline = null;
    }
  }

  function lock(options: { revocationPending?: boolean } = {}): void {
    if (options.revocationPending) {
      revocationPending = true;
      try {
        marker?.markPending();
      } catch {
        // The in-memory lock still takes effect when optional marker storage fails.
      }
    }
    status = 'locked';
    discardGrantWhenIdle();
    notify();
  }

  function checkDeadline(): boolean {
    if (status !== 'active' || !activeGrant || expiresAt === null || monotonicDeadline === null) return false;
    const expired = now() >= expiresAt || monotonicNow() >= monotonicDeadline;
    if (expired) lock();
    return !expired;
  }

  function isAuthorizedFor(
    identity: Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'>,
  ): boolean {
    if (!checkDeadline() || !activeGrant || revocationPending) return false;
    return sameTuple(activeGrant, identity);
  }

  return {
    getSnapshot: snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async authorize(grant) {
      if (!isOnline()) throw new OnlineSaveSessionError('ONLINE_REQUIRED');
      if (readPendingMarker() && !revocationPending) {
        revocationPending = true;
        notify();
      }
      if (revocationPending) throw new OnlineSaveSessionError('REVOCATION_PENDING');
      if (inFlight > 0) throw new OnlineSaveSessionError('SESSION_BUSY');
      try {
        assertProtectedSaveGrant(grant);
      } catch {
        throw new OnlineSaveSessionError('INVALID_GRANT');
      }
      const duration = grant.expiresAt - grant.authorizedAt;
      const currentTime = now();
      if (
        duration <= 0
        || duration > maximumGrantDuration
        || grant.authorizedAt > currentTime + allowedClockSkew
        || grant.expiresAt <= currentTime
      ) throw new OnlineSaveSessionError('INVALID_GRANT');

      activeGrant = grant;
      expiresAt = grant.expiresAt;
      monotonicDeadline = monotonicNow() + Math.min(maximumGrantDuration, grant.expiresAt - currentTime);
      status = 'active';
      notify();
    },
    isAuthorizedFor,
    async withOperation(identity, operation) {
      if (!isAuthorizedFor(identity) || !activeGrant) throw new OnlineSaveSessionError('SAVE_LOCKED');
      const acceptedGrant = activeGrant;
      inFlight += 1;
      try {
        return await operation(acceptedGrant);
      } finally {
        inFlight -= 1;
        discardGrantWhenIdle();
        if (inFlight === 0) {
          for (const resolve of idleWaiters) resolve();
          idleWaiters.clear();
        }
        if (status === 'locked') notify();
      }
    },
    waitForIdle() {
      if (inFlight === 0) return Promise.resolve();
      return new Promise((resolve) => idleWaiters.add(resolve));
    },
    onResume() {
      checkDeadline();
    },
    lock,
    acknowledgeRemoteRevocation() {
      try {
        marker?.clear();
      } catch {
        // A later attempt can retry the marker clear; no save grant is created here.
      }
      revocationPending = false;
      notify();
    },
  };
}
