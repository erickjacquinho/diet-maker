import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const registry = JSON.parse(
  readFileSync(path.join(root, 'design-system/components/registry.json'), 'utf8'),
) as {
  primitiveFamilies: Array<{
    id: string;
    root: string;
    source: string;
    category: string;
    layer: string;
    status: string;
    parts: Array<{ name: string; role: string; requiresRootContext: boolean; states: string[] }>;
  }>;
  components: Array<{
    id: string;
    sourceFiles: Array<{ path: string }>;
    publicExports: Array<{ name: string; kind: string }>;
  }>;
};

const primitiveIds = registry.primitiveFamilies.map(({ id }) => id);

describe('primitive family contract', () => {
  it('enumerates exactly the 16 public primitive families', () => {
    expect(primitiveIds).toHaveLength(16);
    expect(new Set(primitiveIds).size).toBe(16);
    expect(registry.primitiveFamilies.every(({ layer }) => layer === 'ui')).toBe(true);
  });

  it('maps every family root and public child to an existing UI export', () => {
    for (const family of registry.primitiveFamilies) {
      expect(family.status, family.id).toBe('conforming');
      expect(existsSync(path.join(root, family.source)), family.id).toBe(true);

      const component = registry.components.find(({ id }) => id === family.id);
      expect(component, family.id).toBeDefined();
      const exports = new Set(component?.publicExports.map(({ name }) => name));
      expect(exports.has(family.root), family.id).toBe(true);
      for (const part of family.parts) {
        expect(exports.has(part.name), `${family.id}:${part.name}`).toBe(true);
        expect(part.role).toMatch(/provider|context|trigger|content|item|structural-slot|visual-root|visual-slot/);
        expect(part.states.length, `${family.id}:${part.name}`).toBeGreaterThan(0);
        if (part.requiresRootContext) expect(part.role).not.toBe('visual-root');
      }
    }
  });

  it('keeps scoped primitives on semantic tokens and out of legacy classes', () => {
    for (const family of registry.primitiveFamilies) {
      const source = readFileSync(path.join(root, family.source), 'utf8');
      expect(source, family.id).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(source, family.id).not.toMatch(/(?:bg|text|border)-warm(?:-|\b)/);
      expect(source, family.id).not.toMatch(/space-[xy]-|transition-all|rounded-(xl|2xl|3xl|full)/);
    }
  });
});
