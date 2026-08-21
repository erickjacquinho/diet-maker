import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const sourceFiles = (directory: string): string[] =>
  readdirSync(path.join(root, directory), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
    .map((entry) => path.join(root, directory, entry.name));

const readSources = (directory: string): Array<{ file: string; source: string }> =>
  sourceFiles(directory).map((file) => ({ file, source: readFileSync(file, 'utf8') }));

describe('Atomic layer boundaries', () => {
  it('keeps ui primitives free of higher layers and domain imports', () => {
    for (const { file, source } of readSources('src/components/ui')) {
      expect(source, file).not.toMatch(/@\/components\/(atoms|molecules|organisms|templates)/);
      expect(source, file).not.toMatch(/@\/(app|data)\//);
      expect(source, file).not.toMatch(/@\/lib\/(dietStore|patientsStore|tacoStore|recipesStore)/);
    }
  });

  it('keeps atoms and molecules pointed down the hierarchy', () => {
    for (const { file, source } of readSources('src/components/atoms')) {
      expect(source, file).not.toMatch(/@\/components\/(molecules|organisms|templates)/);
      expect(source, file).not.toMatch(/@\/(app|data)\//);
    }

    for (const { file, source } of readSources('src/components/molecules')) {
      expect(source, file).not.toMatch(/@\/components\/(organisms|templates)/);
      expect(source, file).not.toMatch(/@\/(app|data)\//);
    }
  });

  it('requires maintained atoms to declare product value in the registry', () => {
    const registry = JSON.parse(
      readFileSync(path.join(root, 'design-system/components/registry.json'), 'utf8'),
    ) as {
      atomWrappers: Array<{
        source: string;
        decision: string;
        addedValue?: string[];
      }>;
    };

    for (const component of registry.atomWrappers) {
      expect(component.decision, component.source).toMatch(
        /maintained|consolidated|deprecated|migration-required/,
      );
      expect(component.addedValue?.length, component.source).toBeGreaterThan(0);
    }
  });

  it('keeps the sidebar contract in the molecule layer', () => {
    const brand = readFileSync(path.join(root, 'src/components/molecules/SidebarBrand.tsx'), 'utf8');
    const sidebar = readFileSync(path.join(root, 'src/components/organisms/SidebarNav.tsx'), 'utf8');

    expect(brand).not.toMatch(/@\/components\/organisms/);
    expect(sidebar).toContain('@/components/molecules/SidebarBrand');
    expect(sidebar).not.toMatch(/export\s*\{[^}]*SidebarBrand/);
  });
});
