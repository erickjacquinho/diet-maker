/**
 * `online` keeps every record in the user's account on the server (Supabase) and needs no save file;
 * `local` is the legacy browser workspace (PGlite + `.nutridiet` file) that the F5 cleanup removes.
 * The default stays `local` until the online path has been exercised end to end.
 */
export type PersistenceMode = 'online' | 'local';

export function getPersistenceMode(): PersistenceMode {
  return process.env.NEXT_PUBLIC_PERSISTENCE === 'online' ? 'online' : 'local';
}

export function isOnlinePersistence(): boolean {
  return getPersistenceMode() === 'online';
}
