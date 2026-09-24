import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';

export type BackupErrorCode =
  | 'BACKUP_FORMAT_INVALID'
  | 'BACKUP_APP_MISMATCH'
  | 'BACKUP_VERSION_UNSUPPORTED'
  | 'BACKUP_RELATION_INVALID'
  | 'BACKUP_PENDING_EDITS'
  | 'BACKUP_PENDING_CHECKPOINT'
  | 'BACKUP_CANCELLED'
  | 'BACKUP_RESTORE_FAILED'
  | 'BACKUP_EXPORT_FAILED';

export class BackupRepositoryError extends Error {
  readonly code: BackupErrorCode;
  readonly cause?: unknown;

  constructor(code: BackupErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'BackupRepositoryError';
    this.code = code;
    this.cause = options?.cause;
  }
}

export interface BackupRepository {
  readAccountSnapshot(accountId: string): Promise<BackupEnvelope>;
  replaceAccountSnapshot(accountId: string, snapshot: BackupEnvelope): Promise<void>;
}

export type { BackupEnvelope };

