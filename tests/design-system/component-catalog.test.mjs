import { afterEach, describe, expect, it } from 'vitest';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { verifyComponentCatalog } from '../../scripts/verify-design-system-components.mjs';

const fixtureRoot = path.resolve('tests/fixtures/design-system-catalog');
const workspaces = [];

async function createWorkspace({ registry, category, profile } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'nutridiet-catalog-'));
  workspaces.push(root);
  await cp(path.join(fixtureRoot, 'registry/valid'), root, { recursive: true });

  if (registry) {
    const content = await readFile(path.join(fixtureRoot, 'registry', registry), 'utf8');
    await writeFile(path.join(root, 'design-system/components/registry.json'), content);
  }
  if (category) {
    const content = await readFile(path.join(fixtureRoot, 'categories', category), 'utf8');
    await writeFile(path.join(root, 'design-system/components/categories/actions.md'), content);
  }
  if (profile) {
    const content = await readFile(path.join(fixtureRoot, 'profiles', profile), 'utf8');
    await writeFile(path.join(root, 'design-system/components/profiles/ui/button.md'), content);
  }
  return root;
}

async function mutateRegistry(root, mutation) {
  const registryPath = path.join(root, 'design-system/components/registry.json');
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  mutation(registry);
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

async function appendTo(root, projectPath, content) {
  const filePath = path.join(root, ...projectPath.split('/'));
  const current = await readFile(filePath, 'utf8');
  await writeFile(filePath, `${current}\n${content}\n`);
}

async function readFixture(name) {
  return readFile(path.join(fixtureRoot, 'governance', name), 'utf8');
}

async function replaceIn(root, projectPath, search, replacement) {
  const filePath = path.join(root, ...projectPath.split('/'));
  const current = await readFile(filePath, 'utf8');
  await writeFile(filePath, current.replace(search, replacement));
}

async function expectFinding(root, code, mode = 'strict') {
  const findings = await verifyComponentCatalog(root, { mode });
  expect(findings.map((item) => item.code), JSON.stringify(findings, null, 2)).toContain(code);
}

afterEach(async () => {
  await Promise.all(workspaces.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('verifyComponentCatalog public seam', () => {
  it('accepts a complete catalog in inventory and strict modes', async () => {
    const root = await createWorkspace();

    await expect(verifyComponentCatalog(root, { mode: 'inventory' })).resolves.toEqual([]);
    await expect(verifyComponentCatalog(root, { mode: 'strict' })).resolves.toEqual([]);
  });

  it('reports an invalid registry through REG001', async () => {
    const root = await createWorkspace({ registry: 'invalid-missing-components.json' });

    const findings = await verifyComponentCatalog(root, { mode: 'inventory' });

    expect(findings.map(({ code }) => code)).toContain('REG001');
  });

  it('reports duplicate component ids through REG002', async () => {
    const root = await createWorkspace({ registry: 'invalid-duplicate-ids.json' });

    const findings = await verifyComponentCatalog(root, { mode: 'inventory' });

    expect(findings.map(({ code }) => code)).toContain('REG002');
  });

  it('reports an incomplete category through CAT002 in strict mode', async () => {
    const root = await createWorkspace({ category: 'invalid-missing-state-matrix.md' });

    const findings = await verifyComponentCatalog(root, { mode: 'strict' });

    expect(findings.map(({ code }) => code)).toContain('CAT002');
  });

  it('reports shared category rules duplicated by a profile through PRF003', async () => {
    const root = await createWorkspace({ profile: 'invalid-shared-state-table.md' });

    const findings = await verifyComponentCatalog(root, { mode: 'strict' });

    expect(findings.map(({ code }) => code)).toContain('PRF003');
  });

  it('reports a profile that inherits a category divergent from the registry', async () => {
    const root = await createWorkspace({ profile: 'invalid-category-reference.md' });

    const findings = await verifyComponentCatalog(root, { mode: 'strict' });

    expect(findings.map(({ code }) => code)).toContain('PRF002');
  });

  it('reports an exception declared in the registry but absent from the profile', async () => {
    const root = await createWorkspace({ profile: 'invalid-missing-exception.md' });
    const registryPath = path.join(root, 'design-system/components/registry.json');
    const registry = JSON.parse(await readFile(registryPath, 'utf8'));
    registry.components[0].exceptions = ['EXC-ui-button-temporary'];
    await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

    const findings = await verifyComponentCatalog(root, { mode: 'strict' });

    expect(findings.map(({ code }) => code)).toContain('GOV001');
  });

  it('returns findings in deterministic code, entity and path order', async () => {
    const root = await createWorkspace({ registry: 'invalid-duplicate-ids.json' });

    const findings = await verifyComponentCatalog(root, { mode: 'inventory' });
    const keys = findings.map(({ code, entityId, path: findingPath }) =>
      [code, entityId ?? '', findingPath ?? ''].join('|'),
    );

    expect(keys).toEqual([...keys].sort());
  });

  it('validates required registry fields, enums and paths through REG001', async () => {
    let root = await createWorkspace();
    const schemaFixture = JSON.parse(await readFixture('invalid-schema-missing-lifecycle.json'));
    await mutateRegistry(root, (registry) => { delete registry.components[0][schemaFixture.field]; });
    await expectFinding(root, 'REG001', 'inventory');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.components[0].profile = 'profiles/button.md'; });
    await expectFinding(root, 'REG001', 'inventory');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.categories[0].lifecycle = 'unknown'; });
    await expectFinding(root, 'REG001', 'inventory');
  });

  it('reports duplicate exports and duplicate relation values through REG002', async () => {
    let root = await createWorkspace();
    await mutateRegistry(root, (registry) => {
      registry.components[0].publicExports.push({ ...registry.components[0].publicExports[0] });
    });
    await expectFinding(root, 'REG002', 'inventory');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.categories[0].relatedCategories = ['actions', 'actions']; });
    await expectFinding(root, 'REG002', 'inventory');
  });
});

describe('canonical visual categories', () => {
  it('homologates exactly eleven complete categories with closed state coverage', async () => {
    const registry = JSON.parse(
      await readFile(path.resolve('design-system/components/registry.json'), 'utf8'),
    );
    const requiredHeadings = [
      'Purpose',
      'Includes',
      'Excludes',
      'Relationship map',
      'Base anatomy',
      'Geometry',
      'Typography',
      'Tokens by part',
      'Allowed variants',
      'State matrix',
      'Interaction and keyboard',
      'Accessibility',
      'Composition',
      'Content and overflow',
      'Forbidden decisions',
      'Current examples',
      'Category acceptance',
      'Change history',
    ];
    const requiredStates = [
      'default',
      'hover',
      'pressed',
      'focus-visible',
      'selected',
      'disabled',
      'loading',
      'error',
      'empty',
      'read-only',
    ];
    const foundations = [
      '../../04-color-system.md',
      '../../05-typography-system.md',
      '../../06-geometry-and-desktop-layout.md',
      '../../07-icons-motion-and-layers.md',
      '../../08-states-and-accessibility.md',
    ];

    expect(registry.categories).toHaveLength(11);
    for (const category of registry.categories) {
      const markdown = await readFile(path.resolve(category.document), 'utf8');
      expect(category.lifecycle, category.id).toBe('stable');
      expect(category.decisionRef, category.id).toBe(`CAT-2026-07-31-${category.id}`);
      expect(category.consumers.length, category.id).toBeGreaterThan(0);
      for (const heading of requiredHeadings) {
        expect(markdown, `${category.id}: missing ${heading}`).toContain(`## ${heading}`);
      }
      for (const state of requiredStates) {
        expect(markdown, `${category.id}: missing ${state}`).toMatch(
          new RegExp(`^\\| ${state.replace('-', '\\-')} \\|`, 'm'),
        );
      }
      for (const foundation of foundations) {
        expect(markdown, `${category.id}: missing ${foundation}`).toContain(foundation);
      }
      expect(markdown, `${category.id}: unresolved placeholder`).not.toMatch(/\b(?:TODO|TBD)\b/);
      expect(markdown, `${category.id}: unresolved decision language`).not.toMatch(
        /\b(?:conforme necess[aá]rio|quando apropriado)\b/i,
      );
    }
  });

  it('keeps category consumers and trait compatibility synchronized with the registry', async () => {
    const registry = JSON.parse(
      await readFile(path.resolve('design-system/components/registry.json'), 'utf8'),
    );
    const traits = new Map(registry.traits.map((trait) => [trait.id, trait]));
    const componentIds = new Set(registry.components.map((component) => component.id));

    for (const category of registry.categories) {
      for (const consumer of category.consumers) expect(componentIds.has(consumer), consumer).toBe(true);
      for (const traitId of category.allowedTraits) {
        expect(traits.get(traitId)?.compatibleCategories, `${category.id}/${traitId}`).toContain(
          category.id,
        );
      }
    }
  });

  it('classifies the complete current inventory and keeps proposals outside the baseline', async () => {
    const registry = JSON.parse(
      await readFile(path.resolve('design-system/components/registry.json'), 'utf8'),
    );
    const categories = new Set(registry.categories.map((category) => category.id));
    const current = registry.components.filter((component) => component.lifecycle !== 'proposed');
    const proposed = registry.components.filter((component) => component.lifecycle === 'proposed');
    const currentSources = current.flatMap((component) => component.sourceFiles.map(({ path }) => path));

    expect(currentSources).toHaveLength(56);
    expect(new Set(currentSources).size).toBe(56);
    expect(proposed.map(({ id }) => id).sort()).toEqual(
      ['atom-skeleton', 'atom-spinner', 'molecule-form-field', 'ui-textarea'].sort(),
    );

    for (const component of registry.components) {
      expect(categories.has(component.primaryCategory), component.id).toBe(true);
      expect(['ui', 'atom', 'molecule', 'organism', 'template'], component.id).toContain(
        component.targetLayer,
      );
      expect(component.publicExports.length, component.id).toBeGreaterThan(0);
      if (component.lifecycle === 'proposed') {
        expect(component.currentLayer, component.id).toBeNull();
        expect(component.sourceFiles, component.id).toEqual([]);
      } else {
        expect(component.currentLayer, component.id).toBeTruthy();
        expect(component.sourceFiles.length, component.id).toBeGreaterThan(0);
        const source = (
          await Promise.all(
            component.sourceFiles.map(({ path: sourcePath }) =>
              readFile(path.resolve(sourcePath), 'utf8'),
            ),
          )
        ).join('\n');
        for (const publicExport of component.publicExports) {
          expect(source, `${component.id}: export ${publicExport.name}`).toContain(publicExport.name);
        }
      }
    }
  });

  it('records all intentional layer migrations explicitly', async () => {
    const registry = JSON.parse(
      await readFile(path.resolve('design-system/components/registry.json'), 'utf8'),
    );
    const migrations = registry.components
      .filter((component) => component.currentLayer !== component.targetLayer)
      .map(({ id, currentLayer, targetLayer, lifecycle }) => ({
        id,
        currentLayer,
        targetLayer,
        lifecycle,
      }));

    expect(migrations).toEqual([
      {
        id: 'organism-diet-mode-switcher',
        currentLayer: 'molecule',
        targetLayer: 'organism',
        lifecycle: 'migration-required',
      },
      {
        id: 'organism-food-search-modal',
        currentLayer: 'molecule',
        targetLayer: 'organism',
        lifecycle: 'migration-required',
      },
      {
        id: 'organism-read-only-diet-modal',
        currentLayer: 'molecule',
        targetLayer: 'organism',
        lifecycle: 'migration-required',
      },
      ...registry.components
        .filter((component) => component.lifecycle === 'proposed')
        .map(({ id, currentLayer, targetLayer, lifecycle }) => ({
          id,
          currentLayer,
          targetLayer,
          lifecycle,
        })),
    ]);
  });

  it('keeps every canonical profile thin and aligned to its registry entry', async () => {
    const registry = JSON.parse(
      await readFile(path.resolve('design-system/components/registry.json'), 'utf8'),
    );

    expect(registry.components).toHaveLength(60);
    for (const component of registry.components) {
      const markdown = await readFile(path.resolve(component.profile), 'utf8');
      expect(markdown, component.id).toContain(`| Component ID | \`${component.id}\` |`);
      expect(markdown, component.id).toContain(
        `](../../categories/${component.primaryCategory}.md)`,
      );
      expect(markdown, component.id).not.toMatch(
        /^##\s+(?:State matrix|Tokens by part|Geometry|Typography)\s*$/m,
      );
      expect(markdown, component.id).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(component.lifecycle === 'proposed' ? component.specStatus : 'homologated').toBe(
        component.specStatus,
      );
    }
  });
});

describe('complete audit finding matrix', () => {
  it('covers source and public export failures SRC001–EXP002', async () => {
    let root = await createWorkspace();
    await writeFile(path.join(root, 'src/components/ui/unregistered.tsx'), 'export const Unregistered = () => null;\n');
    await expectFinding(root, 'SRC001', 'inventory');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.components[0].sourceFiles[0].path = 'src/components/ui/missing.tsx'; });
    await expectFinding(root, 'SRC002', 'inventory');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => {
      registry.components.push({ ...structuredClone(registry.components[0]), id: 'ui-button-copy' });
    });
    await expectFinding(root, 'SRC003', 'inventory');

    root = await createWorkspace();
    await appendTo(root, 'src/components/ui/button.tsx', 'export const Ghost = () => null;');
    await expectFinding(root, 'EXP001', 'inventory');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.components[0].publicExports[0].name = 'MissingExport'; });
    await expectFinding(root, 'EXP002', 'inventory');
  });

  it('covers registry, category and trait failures REG001–TRT002', async () => {
    let root = await createWorkspace({ registry: 'invalid-missing-components.json' });
    await expectFinding(root, 'REG001', 'inventory');

    root = await createWorkspace({ registry: 'invalid-duplicate-ids.json' });
    await expectFinding(root, 'REG002', 'inventory');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.components[0].primaryCategory = 'missing-category'; });
    await expectFinding(root, 'CAT001');

    root = await createWorkspace({ category: 'invalid-missing-state-matrix.md' });
    await expectFinding(root, 'CAT002');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/categories/actions.md', 'Local foundation: #123456.');
    await expectFinding(root, 'CAT003');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.components[0].traits = ['unknown-trait']; });
    await expectFinding(root, 'TRT001');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => {
      registry.traits.push({
        id: 'test-trait', purpose: 'Fixture capability.', adds: ['loading'],
        forbiddenOverrides: ['geometry'], compatibleCategories: ['actions'],
      });
      registry.categories[0].allowedTraits = ['test-trait'];
      registry.components[0].traits = ['test-trait'];
    });
    await appendTo(root, 'design-system/components/profiles/ui/button.md', 'override:geometry');
    await expectFinding(root, 'TRT002');
  });

  it('covers profile, state and token failures PRF001–TOK002', async () => {
    let root = await createWorkspace();
    await rm(path.join(root, 'design-system/components/profiles/ui/button.md'));
    await expectFinding(root, 'PRF001');

    root = await createWorkspace({ profile: 'invalid-category-reference.md' });
    await expectFinding(root, 'PRF002');

    root = await createWorkspace({ profile: 'invalid-shared-state-table.md' });
    await expectFinding(root, 'PRF003');

    root = await createWorkspace({ category: 'invalid-missing-state-matrix.md' });
    await expectFinding(root, 'STA001');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/profiles/ui/button.md', '`token-does-not-exist`');
    await expectFinding(root, 'TOK001');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/profiles/ui/button.md', 'Local color: #abcdef.');
    await expectFinding(root, 'TOK002');
  });

  it('covers governance, documentation, synchronization and proposal failures GOV001–PROP001', async () => {
    let root = await createWorkspace({ profile: 'invalid-missing-exception.md' });
    await mutateRegistry(root, (registry) => { registry.components[0].exceptions = ['EXC-ui-button-temporary']; });
    await expectFinding(root, 'GOV001');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => { registry.categories[0].decisionRef = 'CAT-MISSING'; });
    await expectFinding(root, 'GOV002');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/profiles/ui/button.md', 'TODO decide later.');
    await expectFinding(root, 'DOC001');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/profiles/ui/button.md', '[broken](../../missing.md)');
    await expectFinding(root, 'DOC002');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/profiles/ui/button.md', 'SYNC-CONFLICT');
    await expectFinding(root, 'SYNC001');

    root = await createWorkspace();
    await mutateRegistry(root, (registry) => {
      registry.components.push({
        ...structuredClone(registry.components[0]), id: 'ui-future', name: 'Future',
        lifecycle: 'proposed', currentLayer: null, sourceFiles: [], specStatus: 'homologated',
      });
    });
    await expectFinding(root, 'PROP001');
  });

  it('restores every mutation by accepting a fresh valid workspace', async () => {
    const root = await createWorkspace();
    await expect(verifyComponentCatalog(root, { mode: 'strict' })).resolves.toEqual([]);
  });

  it('uses deterministic JSON/human output and exit codes 0, 1 and 2', async () => {
    const script = path.resolve('scripts/verify-design-system-components.mjs');
    let root = await createWorkspace();
    let result = spawnSync(process.execPath, [script, '--strict', '--json'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).findings).toEqual([]);

    await writeFile(path.join(root, 'src/components/ui/unregistered.tsx'), 'export const Extra = () => null;\n');
    const jsonFailure = spawnSync(process.execPath, [script, '--strict', '--json'], {
      cwd: root,
      encoding: 'utf8',
    });
    const humanFailure = spawnSync(process.execPath, [script, '--strict'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(jsonFailure.status).toBe(1);
    expect(humanFailure.status).toBe(1);
    const structured = JSON.parse(jsonFailure.stdout).findings;
    expect(structured.map(({ code }) => code)).toContain('SRC001');
    for (const item of structured) expect(humanFailure.stdout).toContain(`${item.code} ${item.entityId}`);

    root = await createWorkspace({ registry: 'invalid-missing-components.json' });
    result = spawnSync(process.execPath, [script, '--strict', '--json'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stdout).findings.map(({ code }) => code)).toEqual(['REG001']);
  });

  it('accepts a future component inheriting a stable category without adding it to the baseline', async () => {
    const registry = JSON.parse(
      await readFile(path.resolve('design-system/components/registry.json'), 'utf8'),
    );
    expect(registry.components.filter(({ lifecycle }) => lifecycle === 'proposed')).toHaveLength(4);
    await expect(verifyComponentCatalog(process.cwd(), { mode: 'strict' })).resolves.toEqual([]);
  });

  it('blocks a new consumer when its category is deprecated', async () => {
    const root = await createWorkspace();
    await mutateRegistry(root, (registry) => {
      registry.categories[0].lifecycle = 'deprecated';
      registry.categories[0].consumers = ['ui-button'];
    });

    await expectFinding(root, 'GOV002');
  });

  it('blocks an expired exception record', async () => {
    const root = await createWorkspace();
    await mutateRegistry(root, (registry) => {
      registry.components[0].exceptions = ['EXC-ui-button-temporary'];
    });
    await appendTo(
      root,
      'design-system/components/profiles/ui/button.md',
      'ExceptionRecord: EXC-ui-button-temporary; owner: maintainer; reviewAt: 2020-01-01; scope: button icon',
    );

    await expectFinding(root, 'GOV001');
  });

  it('rejects arbitrary tokens and missing foundation links', async () => {
    let root = await createWorkspace();
    await appendTo(root, 'design-system/components/categories/actions.md', await readFixture('invalid-token-arbitrary.md'));
    await expectFinding(root, 'TOK001');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/profiles/ui/button.md', 'Token: `token-arbitrary-not-in-foundations`');
    await expectFinding(root, 'TOK001');

    root = await createWorkspace();
    await appendTo(root, 'design-system/components/categories/actions.md', await readFixture('invalid-missing-foundation.md'));
    await replaceIn(root, 'design-system/components/categories/actions.md', '[04 — Cores](../../04-color-system.md)', '[04 — Cores](../../missing-foundation.md)');
    await expectFinding(root, 'SYNC001');
  });

  it('rejects local foundation redefinitions', async () => {
    const root = await createWorkspace();
    await appendTo(root, 'design-system/components/categories/actions.md', 'GLOBAL-FOUNDATION-REDEFINITION: --color-local-primary');
    await expectFinding(root, 'CAT003');
  });

  it('requires a complete structured decision record for each category', async () => {
    const root = await createWorkspace();
    const incompleteDecision = await readFixture('invalid-incomplete-decision.md');
    await replaceIn(root, 'design-system/components/category-decisions.md', /^- Alternatives:.*$/m, incompleteDecision.trim());
    await expectFinding(root, 'GOV002');
  });

  it('blocks proposals that introduce a new consumer of a deprecated category', async () => {
    const root = await createWorkspace();
    const proposalFixture = JSON.parse(await readFixture('invalid-deprecated-proposal.json'));
    await mutateRegistry(root, (registry) => {
      registry.categories[0].lifecycle = 'deprecated';
      registry.categories[0].consumers = [];
      registry.components.push({
        ...structuredClone(registry.components[0]),
        id: 'ui-future-deprecated',
        name: 'FutureDeprecated',
        lifecycle: proposalFixture.componentLifecycle,
        currentLayer: null,
        sourceFiles: [],
        primaryCategory: proposalFixture.category,
        specStatus: 'specified',
      });
    });
    await expectFinding(root, 'GOV002');
  });
});
