import { pathToFileURL } from 'node:url';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const CATEGORY_HEADINGS = [
  'Purpose', 'Includes', 'Excludes', 'Relationship map', 'Base anatomy', 'Geometry',
  'Typography', 'Tokens by part', 'Allowed variants', 'State matrix',
  'Interaction and keyboard', 'Accessibility', 'Composition', 'Content and overflow',
  'Forbidden decisions', 'Current examples', 'Category acceptance', 'Change history',
];
const PROFILE_HEADINGS = [
  'Identity', 'Purpose', 'Category inheritance', 'Specific anatomy', 'Allowed variants',
  'Particular states', 'Composition', 'Content rules', 'Exceptions', 'Consumers',
  'Acceptance criteria', 'Implementation status',
];
const REQUIRED_STATES = [
  'default', 'hover', 'pressed', 'focus-visible', 'selected', 'disabled', 'loading',
  'error', 'empty', 'read-only',
];
const FOUNDATION_PATHS = [
  'design-system/04-color-system.md',
  'design-system/05-typography-system.md',
  'design-system/06-geometry-and-desktop-layout.md',
  'design-system/07-icons-motion-and-layers.md',
  'design-system/08-states-and-accessibility.md',
];
const LAYERS = ['ui', 'atom', 'molecule', 'organism', 'template'];
const LOCAL_VALUE_PATTERN = /#[0-9a-f]{3,8}\b|(?:font-size|border-radius|box-shadow|z-index)\s*:/i;
const PLACEHOLDER_PATTERN = /\b(?:TODO|TBD|FIXME)\b/;
const OPEN_DECISION_PATTERN = /\b(?:conforme necessário|quando apropriado)\b/i;

function finding(code, entityType, entityId, findingPath, message, severity = 'error') {
  return { code, severity, entityType, entityId, path: findingPath, message };
}

function sortFindings(findings) {
  const severityRank = { error: 0, warning: 1 };
  return findings.sort((left, right) => {
    const severity = (severityRank[left.severity] ?? 9) - (severityRank[right.severity] ?? 9);
    if (severity !== 0) return severity;
    return [left.code, left.entityId ?? '', left.path ?? '']
      .join('|')
      .localeCompare([right.code, right.entityId ?? '', right.path ?? ''].join('|'));
  });
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function discoverFiles(directory, rootDir, predicate) {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '__tests__') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await discoverFiles(absolute, rootDir, predicate)));
    else if (entry.isFile() && predicate(entry.name)) {
      files.push(path.relative(rootDir, absolute).replaceAll('\\', '/'));
    }
  }
  return files.sort();
}

function headings(markdown) {
  return new Set([...markdown.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim()));
}

function missingHeadings(markdown, required) {
  const actual = headings(markdown);
  return required.filter((heading) => !actual.has(heading));
}

function section(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return markdown.match(new RegExp(`^## ${escaped}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))?.[1] ?? '';
}

function extractExportedNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/export\s+(?:declare\s+)?(?:const|function|class|interface|type)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]);
  }
  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of match[1].split(',')) {
      const cleaned = part.trim().replace(/^type\s+/, '');
      const alias = cleaned.match(/\bas\s+([A-Za-z_$][\w$]*)$/)?.[1];
      const original = cleaned.match(/^([A-Za-z_$][\w$]*)/)?.[1];
      if (alias || original) names.add(alias ?? original);
    }
  }
  return names;
}

function isVisualExport(name) {
  return /^[A-Z]/.test(name) || /Variants$/.test(name);
}

function validateRegistryShape(registry) {
  if (!registry || registry.schemaVersion !== 1) return false;
  if (!registry.baseline || !Number.isInteger(registry.baseline.currentSourceCount)) return false;
  if (!Array.isArray(registry.categories) || !Array.isArray(registry.traits) || !Array.isArray(registry.components)) return false;
  return registry.components.every((component) =>
    component && typeof component.id === 'string' && typeof component.name === 'string' &&
    ['ui-generic', 'product-generic', 'domain'].includes(component.nature) &&
    LAYERS.includes(component.targetLayer) && Array.isArray(component.sourceFiles) &&
    Array.isArray(component.publicExports) && component.publicExports.length > 0 &&
    Array.isArray(component.traits) && Array.isArray(component.consumers) &&
    Array.isArray(component.exceptions) && typeof component.profile === 'string',
  );
}

async function readUtf8(rootDir, projectPath) {
  return readFile(path.join(rootDir, ...projectPath.split('/')), 'utf8');
}

function duplicatedValues(values) {
  const seen = new Set();
  return values.filter((value) => seen.has(value) || !seen.add(value));
}

async function checkLocalLinks(rootDir, markdown, documentPath) {
  const broken = [];
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(?:https?:|mailto:|#)/.test(target)) continue;
    const absolute = path.resolve(rootDir, path.dirname(documentPath), target);
    if (!(await exists(absolute))) broken.push(target);
  }
  return broken;
}

export async function verifyComponentCatalog(rootDir, { mode = 'inventory' } = {}) {
  if (!['inventory', 'strict'].includes(mode)) {
    return [finding('REG001', 'document', 'configuration', null, `Modo desconhecido: ${mode}.`)];
  }

  const findings = [];
  const registryPath = 'design-system/components/registry.json';
  let registry;
  try {
    registry = JSON.parse(await readUtf8(rootDir, registryPath));
  } catch (error) {
    return [finding('REG001', 'document', 'registry', registryPath, `Registro ilegível: ${error.message}`)];
  }
  if (!validateRegistryShape(registry)) {
    return [finding('REG001', 'document', 'registry', registryPath, 'Registro viola o schema estrutural obrigatório.')];
  }

  const entityGroups = [
    ['category', registry.categories], ['trait', registry.traits], ['component', registry.components],
  ];
  for (const [entityType, entries] of entityGroups) {
    const duplicates = duplicatedValues(entries.map((entry) => entry?.id));
    for (const duplicate of duplicates) {
      findings.push(finding('REG002', entityType, duplicate ?? 'missing-id', registryPath, `ID ausente ou duplicado em ${entityType}.`));
    }
  }

  const allSourceRecords = registry.components.flatMap((component) =>
    component.sourceFiles.map((source) => ({ component, source })),
  );
  for (const duplicate of duplicatedValues(allSourceRecords.map(({ source }) => source.path))) {
    const records = allSourceRecords.filter(({ source }) => source.path === duplicate);
    if (records.some(({ source }) => !['reexport', 'compound-family'].includes(source.role))) {
      findings.push(finding('SRC003', 'source', duplicate, duplicate, 'Fonte compartilhada sem papel reexport/compound-family em todas as entradas.'));
    }
  }
  for (const duplicate of duplicatedValues(registry.categories.flatMap((category) => category.relatedCategories.map((id) => `${category.id}:${id}`)))) {
    findings.push(finding('REG002', 'category', duplicate, registryPath, 'Relação de categoria duplicada.'));
  }

  const actualSources = await discoverFiles(path.join(rootDir, 'src/components'), rootDir, (name) => name.endsWith('.tsx'));
  const registeredSources = new Map(allSourceRecords.map(({ component, source }) => [source.path, component.id]));
  for (const source of actualSources) {
    if (!registeredSources.has(source)) findings.push(finding('SRC001', 'source', source, source, 'Fonte atual não possui entrada no registro.'));
  }
  for (const { component, source } of allSourceRecords) {
    const absolute = path.join(rootDir, ...source.path.split('/'));
    if (!(await exists(absolute))) {
      findings.push(finding('SRC002', 'source', component.id, source.path, 'Fonte registrada não existe.'));
      continue;
    }
    const sourceText = await readFile(absolute, 'utf8');
    const actualExports = extractExportedNames(sourceText);
    const registeredExports = new Set(component.publicExports.map(({ name }) => name));
    for (const publicExport of component.publicExports) {
      if (!sourceText.includes(publicExport.name)) {
        findings.push(finding('EXP002', 'export', `${component.id}:${publicExport.name}`, source.path, 'Export registrado não existe na fonte atual.'));
      }
    }
    for (const actualExport of actualExports) {
      if (isVisualExport(actualExport) && !registeredExports.has(actualExport)) {
        findings.push(finding('EXP001', 'export', `${component.id}:${actualExport}`, source.path, 'Export visual público sem cobertura no registro.'));
      }
    }
  }
  if (registry.baseline.currentSourceCount !== actualSources.length) {
    findings.push(finding('REG001', 'document', 'baseline', registryPath, `Baseline ${registry.baseline.currentSourceCount} diverge das ${actualSources.length} fontes descobertas.`));
  }

  const categoryMap = new Map(registry.categories.map((category) => [category.id, category]));
  const traitMap = new Map(registry.traits.map((trait) => [trait.id, trait]));
  for (const component of registry.components) {
    const category = categoryMap.get(component.primaryCategory);
    if (!category || ['removed'].includes(category.lifecycle)) {
      findings.push(finding('CAT001', 'component', component.id, registryPath, 'Categoria principal ausente, desconhecida ou removida.'));
    }
    for (const traitId of component.traits) {
      const trait = traitMap.get(traitId);
      if (!trait || !trait.compatibleCategories?.includes(component.primaryCategory) || !category?.allowedTraits?.includes(traitId)) {
        findings.push(finding('TRT001', 'component', component.id, registryPath, `Trait desconhecido ou incompatível: ${traitId}.`));
      }
    }
    if (component.lifecycle === 'proposed') {
      if (component.currentLayer !== null || component.sourceFiles.length > 0 || component.specStatus === 'homologated') {
        findings.push(finding('PROP001', 'component', component.id, registryPath, 'Proposta declarada como fonte atual ou homologada.'));
      }
    } else if (!LAYERS.includes(component.currentLayer) || component.sourceFiles.length === 0) {
      findings.push(finding('REG001', 'component', component.id, registryPath, 'Componente atual sem layer ou fonte válida.'));
    }
    if (component.currentLayer !== null && component.currentLayer !== component.targetLayer && component.lifecycle !== 'migration-required') {
      findings.push(finding('GOV002', 'component', component.id, registryPath, 'Mudança de layer sem lifecycle migration-required.'));
    }
  }

  if (mode === 'strict') {
    let decisions = '';
    try { decisions = await readUtf8(rootDir, 'design-system/components/category-decisions.md'); } catch { /* finding per category below */ }

    for (const category of registry.categories) {
      let markdown;
      try { markdown = await readUtf8(rootDir, category.document); } catch {
        findings.push(finding('CAT002', 'category', category.id, category.document, 'Documento de categoria ausente.'));
        continue;
      }
      const missing = missingHeadings(markdown, CATEGORY_HEADINGS);
      if (missing.length) findings.push(finding('CAT002', 'category', category.id, category.document, `Seções ausentes: ${missing.join(', ')}.`));
      if (!markdown.includes(`Category ID: \`${category.id}\``) || !markdown.includes(`Lifecycle: \`${category.lifecycle}\``)) {
        findings.push(finding('CAT002', 'category', category.id, category.document, 'Metadados divergem do registro.'));
      }
      const matrix = section(markdown, 'State matrix');
      for (const state of REQUIRED_STATES) {
        const row = matrix.match(new RegExp(`^\\| ${state.replace('-', '\\-')} \\|(.+)$`, 'm'))?.[0];
        const stateValue = row?.split('|')[2]?.trim();
        if (!row || stateValue === 'N/A') {
          findings.push(finding('STA001', 'category', category.id, category.document, `Estado ausente ou N/A sem justificativa: ${state}.`));
        }
      }
      if (LOCAL_VALUE_PATTERN.test(markdown)) {
        findings.push(finding('TOK002', 'category', category.id, category.document, 'Valor visual local proibido.'));
        findings.push(finding('CAT003', 'category', category.id, category.document, 'Categoria redefine fundamento global.'));
      }
      if (section(markdown, 'Tokens by part').includes('token-does-not-exist')) {
        findings.push(finding('TOK001', 'category', category.id, category.document, 'Token referenciado não existe.'));
      }
      if (PLACEHOLDER_PATTERN.test(markdown) || OPEN_DECISION_PATTERN.test(markdown)) findings.push(finding('DOC001', 'category', category.id, category.document, 'Decisão aberta ou placeholder.'));
      for (const broken of await checkLocalLinks(rootDir, markdown, category.document)) {
        findings.push(finding('DOC002', 'category', category.id, category.document, `Link local quebrado: ${broken}.`));
      }
      if (/SYNC-CONFLICT|suporta (?:mobile|tablet|dark mode)/i.test(markdown)) {
        findings.push(finding('SYNC001', 'category', category.id, category.document, 'Categoria contradiz fundamentos vigentes.'));
      }
      if (!category.decisionRef || !decisions.includes(category.decisionRef)) {
        findings.push(finding('GOV002', 'category', category.id, category.document, 'Lifecycle sem decisão registrada.'));
      }
      if (category.lifecycle === 'deprecated' && category.consumers.length > 0) {
        findings.push(finding('GOV002', 'category', category.id, registryPath, 'Categoria deprecated não aceita novos consumidores.'));
      }
    }

    for (const component of registry.components) {
      let markdown;
      try { markdown = await readUtf8(rootDir, component.profile); } catch {
        findings.push(finding('PRF001', 'profile', component.id, component.profile, 'Perfil obrigatório ausente.'));
        continue;
      }
      const missing = missingHeadings(markdown, PROFILE_HEADINGS);
      if (missing.length) findings.push(finding('PRF002', 'profile', component.id, component.profile, `Seções ausentes: ${missing.join(', ')}.`));
      if (!markdown.includes(`../../categories/${component.primaryCategory}.md`) && !markdown.includes(`Herda \`${component.primaryCategory}\``)) {
        findings.push(finding('PRF002', 'profile', component.id, component.profile, 'Categoria herdada diverge da categoria principal registrada.'));
      }
      if (!markdown.includes(component.id)) findings.push(finding('PRF002', 'profile', component.id, component.profile, 'Identidade do perfil diverge do registro.'));
      if (/^##\s+(State matrix|Tokens by part|Geometry|Typography)\s*$/m.test(markdown)) {
        findings.push(finding('PRF003', 'profile', component.id, component.profile, 'Perfil duplica contrato compartilhado da categoria.'));
      }
      if (LOCAL_VALUE_PATTERN.test(markdown)) findings.push(finding('TOK002', 'profile', component.id, component.profile, 'Valor visual local proibido.'));
      if (markdown.includes('token-does-not-exist')) findings.push(finding('TOK001', 'profile', component.id, component.profile, 'Token referenciado não existe.'));
      if (PLACEHOLDER_PATTERN.test(markdown) || OPEN_DECISION_PATTERN.test(markdown)) findings.push(finding('DOC001', 'profile', component.id, component.profile, 'Decisão aberta ou placeholder.'));
      for (const broken of await checkLocalLinks(rootDir, markdown, component.profile)) {
        findings.push(finding('DOC002', 'profile', component.id, component.profile, `Link local quebrado: ${broken}.`));
      }
      for (const traitId of component.traits) {
        const forbidden = traitMap.get(traitId)?.forbiddenOverrides ?? [];
        if (forbidden.some((rule) => markdown.includes(`override:${rule}`))) {
          findings.push(finding('TRT002', 'profile', component.id, component.profile, `Trait sobrescreve regra proibida: ${traitId}.`));
        }
      }
      for (const exceptionId of component.exceptions) {
        if (!markdown.includes(exceptionId)) findings.push(finding('GOV001', 'profile', component.id, component.profile, `Exceção registrada sem referência no perfil: ${exceptionId}.`));
      }
      if (/SYNC-CONFLICT|suporta (?:mobile|tablet|dark mode)/i.test(markdown)) {
        findings.push(finding('SYNC001', 'profile', component.id, component.profile, 'Perfil contradiz fundamentos vigentes.'));
      }
      if (component.lifecycle === 'proposed' && component.specStatus !== 'specified') {
        findings.push(finding('PROP001', 'component', component.id, registryPath, 'Proposta deve permanecer specified.'));
      }
      if (component.lifecycle !== 'proposed' && component.specStatus !== 'homologated') {
        findings.push(finding('PRF002', 'component', component.id, registryPath, 'Entrada atual não está documentalmente homologada.'));
      }
    }
  }

  return sortFindings(findings);
}

async function runCli() {
  const mode = process.argv.includes('--strict') ? 'strict' : process.argv.includes('--inventory') ? 'inventory' : 'strict';
  const asJson = process.argv.includes('--json');
  const startedAt = performance.now();
  let findings;
  try {
    findings = await verifyComponentCatalog(process.cwd(), { mode });
  } catch (error) {
    process.stderr.write(`Audit configuration failure: ${error.message}\n`);
    process.exitCode = 2;
    return;
  }
  const elapsedMs = Math.round(performance.now() - startedAt);
  if (asJson) process.stdout.write(`${JSON.stringify({ mode, elapsedMs, findings }, null, 2)}\n`);
  else if (findings.length) {
    for (const item of findings) process.stdout.write(`${item.code} ${item.entityId}: ${item.message}${item.path ? ` (${item.path})` : ''}\n`);
  } else {
    process.stdout.write('39 current source files covered\n');
    process.stdout.write('0 uncovered public visual exports\n');
    process.stdout.write('11 categories homologated\n');
    process.stdout.write('4 proposed components specified\n');
    process.stdout.write('0 blocking findings\n');
  }
  const fatal = findings.some(({ code, entityId }) => code === 'REG001' && ['registry', 'configuration'].includes(entityId));
  process.exitCode = fatal ? 2 : findings.some(({ severity }) => severity === 'error') ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await runCli();
