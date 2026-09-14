import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(process.cwd(), 'src');
const uiFiles = [
  'app/navigation/SidebarNavigationAdapter.tsx',
  'components/molecules/SidebarQuickActions.tsx',
  'components/molecules/SidebarUserProfile.tsx',
  'components/organisms/SidebarNav.tsx',
];

function source(relativePath: string): string {
  return readFileSync(join(sourceRoot, relativePath), 'utf8');
}

describe('backup persistence architecture boundary', () => {
  it('keeps the logical export contract single and free of the diet-only shape', () => {
    const logicalSchema = source('lib/infrastructure/local-db/logical-export-schema.ts');
    expect(logicalSchema).toContain('BACKUP_TABLE_NAMES');
    expect(logicalSchema).not.toContain('DIET_LOGICAL_EXPORT_SCHEMA_VERSION');
    expect(logicalSchema).not.toContain('LogicalAccountExport');
  });

  it('keeps UI surfaces free of storage providers, legacy storage and competing .diet actions', () => {
    const uiSource = uiFiles.map(source).join('\n');
    expect(uiSource).not.toMatch(/@electric-sql\/pglite|drizzle-orm|\bindexedDB\b|localStorage|sessionStorage/);
    expect(uiSource).not.toMatch(/nutridiet_(?:custom_foods|recipes|ready_meals)/);
    expect(uiSource).not.toMatch(/Salvar Arquivo Local|Abrir Arquivo \.diet/);
    expect(uiSource).not.toContain("@/lib/infrastructure/local-db/backup-repository");
  });

  it('routes backup persistence through the application seam', () => {
    const adapter = source('app/navigation/SidebarNavigationAdapter.tsx');
    expect(adapter).toContain('@/lib/application/browser-composition');
    expect(adapter).not.toContain('@/lib/infrastructure/local-db');
    expect(adapter).not.toContain('PGliteBackupRepository');
  });
});

