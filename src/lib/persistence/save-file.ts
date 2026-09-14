export interface SaveFile {
  readonly name: string;
}

export type SaveFilePermission = 'granted' | 'denied' | 'prompt';

export type SaveFilePermissionMode = 'read' | 'readwrite';

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
  queryPermission?(file: SaveFile, mode?: SaveFilePermissionMode): Promise<SaveFilePermission>;
}
