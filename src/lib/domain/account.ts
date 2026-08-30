export interface Account {
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export function normalizeAccountDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isAccount(value: Pick<Account, 'id' | 'displayName'>): boolean {
  return value.id.trim().length > 0 && normalizeAccountDisplayName(value.displayName).length > 0;
}
