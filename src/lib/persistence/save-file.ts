export interface SaveFile {
  readonly name: string;
}

export type SaveFilePermission = 'granted' | 'denied' | 'prompt';

export type SaveFilePermissionMode = 'read' | 'readwrite';

export interface SaveFileAssociationIdentity {
  readonly ownerId: string;
  readonly saveId: string;
}

export interface SaveFileRetryMetadata {
  readonly localAccountId: string;
  readonly idempotencyKey?: string;
  readonly bindingProof?: string;
}

export interface SaveFileAssociation extends SaveFileAssociationIdentity, SaveFileRetryMetadata {
  readonly file: SaveFile;
}

export interface PendingSaveRegistration extends SaveFileRetryMetadata {
  readonly ownerId: string;
  readonly idempotencyKey: string;
  readonly file: SaveFile;
  readonly sourceFile?: SaveFile;
}

export interface SaveFilePort {
  chooseExisting(): Promise<SaveFile | null>;
  chooseNew(): Promise<SaveFile | null>;
  read(file: SaveFile): Promise<string>;
  requestWritePermission(file: SaveFile): Promise<SaveFilePermission>;
  write(file: SaveFile, content: string): Promise<void>;
  /**
   * Persists the browser file association without making it part of the
   * portable .nutridiet document. Implementations may not support this.
   */
  persistActiveFile?(file: SaveFile): Promise<void>;
  restoreActiveFile?(): Promise<SaveFile | null>;
  clearActiveFile?(): Promise<void>;
  /** Durable, non-secret browser association, scoped to one online owner/save tuple. */
  persistFileAssociation?(
    identity: SaveFileAssociationIdentity,
    file: SaveFile,
    retry: SaveFileRetryMetadata,
  ): Promise<void>;
  restoreFileAssociation?(identity: SaveFileAssociationIdentity): Promise<SaveFileAssociation | null>;
  clearFileAssociation?(identity: SaveFileAssociationIdentity): Promise<void>;
  persistPendingRegistration?(attempt: PendingSaveRegistration): Promise<void>;
  restorePendingRegistration?(ownerId: string, localAccountId: string): Promise<PendingSaveRegistration | null>;
  listPendingRegistrations?(ownerId: string): Promise<PendingSaveRegistration[]>;
  clearPendingRegistration?(ownerId: string, localAccountId: string): Promise<void>;
  isSameEntry?(first: SaveFile, second: SaveFile): Promise<boolean>;
  queryPermission?(file: SaveFile, mode?: SaveFilePermissionMode): Promise<SaveFilePermission>;
}
