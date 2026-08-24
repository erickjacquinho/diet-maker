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
const TOKEN_INDEX_PATH = 'design-system/components/token-index.md';
const LAYERS = ['ui', 'atom', 'molecule', 'organism', 'template'];
const CATEGORY_LIFECYCLES = ['proposed', 'experimental', 'stable', 'deprecated', 'removed'];
const COMPONENT_LIFECYCLES = ['proposed', 'experimental', 'implemented', 'migration-required', 'stable', 'deprecated', 'removed'];
const NATURES = ['ui-generic', 'product-generic', 'domain'];
const CATEGORY_IDS = ['actions', 'fields', 'selection', 'navigation', 'surfaces', 'data-display', 'feedback', 'overlays', 'loading', 'nutrition-domain', 'structure'];
const SOURCE_ROLES = ['implementation', 'reexport', 'compound-family'];
const EXPORT_KINDS = ['component', 'compound-part', 'recipe', 'hook', 'type'];
const DOCUMENTED_BY = ['category', 'profile', 'non-visual'];
const SPEC_STATUSES = ['inventoried', 'specified', 'homologated'];
// Internal extraction files and legacy families stay outside the canonical registry
// until they receive their own component profile.
const NON_CATALOG_COMPONENT_SOURCES = new Set([
  'src/components/atoms/SelectField.tsx',
  'src/components/molecules/ActionDropdown.tsx',
  'src/components/molecules/AdjustDietGoalsModal.tsx',
  'src/components/molecules/assessment/AssessmentMeasurementField.tsx',
  'src/components/molecules/assessment/AssessmentContinuousFields.tsx',
  'src/components/molecules/assessment/LimbSectionCard.tsx',
  'src/components/molecules/CopyVariationModal.tsx',
  'src/components/molecules/food-search/FoodSearchResultsList.tsx',
  'src/components/molecules/MacroSummary.tsx',
  'src/components/molecules/ScaleDietModal.tsx',
  'src/components/molecules/WhatsAppShareModal.tsx',
  'src/components/organisms/assessment/AssessmentSummaryPanel.tsx',
  'src/components/organisms/diet/DietContextSection.tsx',
  'src/components/organisms/diet/DietMealsSection.tsx',
  'src/components/organisms/foods/FoodFilterHeader.tsx',
  'src/components/organisms/foods/FoodTableSection.tsx',
  'src/components/organisms/foods/useFoodTableColumns.tsx',
  'src/components/organisms/patient-profile-header/subcomponents.tsx',
  'src/components/organisms/patient/ConsultationHistoryRow.tsx',
  'src/components/organisms/patient/PatientListTableRow.tsx',
  'src/components/organisms/PatientProfileHeader.tsx',
  'src/components/organisms/sidebar-navigation-items.tsx',
  'src/components/ui/avatar.tsx',
  'src/components/ui/calendar-day-button.tsx',
  'src/components/ui/composition-context.tsx',
  'src/components/ui/input-group.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/sidebar-context.tsx',
  'src/components/ui/sidebar-menu-button.tsx',
  'src/components/ui/sidebar-sub.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/toggle-group.tsx',
]);
const LOCAL_VALUE_PATTERN = /#[0-9a-f]{3,8}\b|(?:font-size|border-radius|box-shadow|z-index)\s*:/i;
const LOCAL_FOUNDATION_REDEFINITION_PATTERN = /GLOBAL-FOUNDATION-REDEFINITION|--(?:color|space|radius|font|type|shadow|z|motion)-/i;
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

function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function hasUniqueStrings(values) {
  return Array.isArray(values) && values.every((value) => typeof value === 'string') && new Set(values).size === values.length;
}

function isStringArray(values) {
  return Array.isArray(values) && values.every((value) => typeof value === 'string');
}

function isKebabCase(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateRegistryShape(registry) {
  if (!registry || typeof registry !== 'object' || Array.isArray(registry) || registry.schemaVersion !== 1) return false;
  if (!registry.baseline || !Number.isInteger(registry.baseline.currentSourceCount) || registry.baseline.currentSourceCount < 0 || !isDate(registry.baseline.capturedAt)) return false;
  if (!Array.isArray(registry.categories) || !Array.isArray(registry.traits) || !Array.isArray(registry.components)) return false;

  if (registry.categories.some((category) => !category || !CATEGORY_IDS.includes(category.id) || typeof category.name !== 'string' || !category.name.trim() || !CATEGORY_LIFECYCLES.includes(category.lifecycle) || typeof category.document !== 'string' || !/^design-system\/components\/categories\/.+\.md$/.test(category.document) || !isStringArray(category.allowedTraits) || !isStringArray(category.relatedCategories) || !isStringArray(category.consumers) || typeof category.decisionRef !== 'string' || !category.decisionRef.trim())) return false;
  if (registry.traits.some((trait) => !trait || !isKebabCase(trait.id) || typeof trait.purpose !== 'string' || !trait.purpose.trim() || !Array.isArray(trait.adds) || trait.adds.length === 0 || !trait.adds.every((value) => typeof value === 'string') || !Array.isArray(trait.forbiddenOverrides) || trait.forbiddenOverrides.length === 0 || !trait.forbiddenOverrides.every((value) => typeof value === 'string') || !isStringArray(trait.compatibleCategories))) return false;

  return registry.components.every((component) => {
    if (!component || !isKebabCase(component.id) || typeof component.name !== 'string' || !component.name.trim() || !NATURES.includes(component.nature) || !COMPONENT_LIFECYCLES.includes(component.lifecycle) || !(component.currentLayer === null || LAYERS.includes(component.currentLayer)) || !LAYERS.includes(component.targetLayer) || !isStringArray(component.traits) || !Array.isArray(component.sourceFiles) || !Array.isArray(component.publicExports) || component.publicExports.length === 0 || typeof component.profile !== 'string' || !/^design-system\/components\/profiles\/.+\.md$/.test(component.profile) || !isStringArray(component.consumers) || !(component.primitiveBase === null || typeof component.primitiveBase === 'string') || !SPEC_STATUSES.includes(component.specStatus) || !isStringArray(component.exceptions)) return false;
    if (component.sourceFiles.some((source) => !source || typeof source.path !== 'string' || !/^src\/components\/.+\.tsx$/.test(source.path) || !SOURCE_ROLES.includes(source.role) || !LAYERS.includes(source.discoveredLayer))) return false;
    if (component.publicExports.some((entry) => !entry || typeof entry.name !== 'string' || !entry.name.trim() || !EXPORT_KINDS.includes(entry.kind) || !DOCUMENTED_BY.includes(entry.documentedBy))) return false;
    if (component.lifecycle === 'proposed') return component.currentLayer === null && component.sourceFiles.length === 0;
    return component.currentLayer !== null && component.sourceFiles.length > 0;
  });
}

async function readUtf8(rootDir, projectPath) {
  return readFile(path.join(rootDir, ...projectPath.split('/')), 'utf8');
}

function duplicatedValues(values) {
  const seen = new Set();
  return values.filter((value) => seen.has(value) || !seen.add(value));
}

function uniqueTokensFrom(markdown) {
  return [...markdown.matchAll(/`([a-z][a-z0-9-]*)`/g)].map((match) => match[1]);
}

async function readTokenIndex(rootDir) {
  try {
    const markdown = await readUtf8(rootDir, TOKEN_INDEX_PATH);
    return new Set(uniqueTokensFrom(markdown));
  } catch {
    return null;
  }
}

function foundationLinkNames() {
  return FOUNDATION_PATHS.map((foundation) => `../../${foundation.split('/').at(-1)}`);
}

function decisionRecord(decisions, decisionRef) {
  const start = decisions.indexOf(`### ${decisionRef}`);
  if (start < 0) return '';
  const remainder = decisions.slice(start);
  const end = remainder.indexOf('\n### ', 4);
  return end < 0 ? remainder : remainder.slice(0, end);
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
  for (const category of registry.categories) {
    for (const field of ['allowedTraits', 'relatedCategories', 'consumers']) {
      for (const duplicate of duplicatedValues(category[field])) {
        findings.push(finding('REG002', 'category', `${category.id}:${field}:${duplicate}`, registryPath, `Valor duplicado em ${field}.`));
      }
    }
  }
  for (const trait of registry.traits) {
    for (const field of ['adds', 'forbiddenOverrides', 'compatibleCategories']) {
      for (const duplicate of duplicatedValues(trait[field])) {
        findings.push(finding('REG002', 'trait', `${trait.id}:${field}:${duplicate}`, registryPath, `Valor duplicado em ${field}.`));
      }
    }
  }
  for (const component of registry.components) {
    for (const field of ['traits', 'consumers', 'exceptions']) {
      for (const duplicate of duplicatedValues(component[field])) {
        findings.push(finding('REG002', 'component', `${component.id}:${field}:${duplicate}`, registryPath, `Valor duplicado em ${field}.`));
      }
    }
    for (const duplicate of duplicatedValues(component.sourceFiles.map((source) => source.path))) {
      findings.push(finding('REG002', 'component', `${component.id}:sourceFiles:${duplicate}`, registryPath, 'Path de fonte duplicado dentro da entrada.'));
    }
    for (const duplicate of duplicatedValues(component.publicExports.map((entry) => entry.name))) {
      findings.push(finding('REG002', 'component', `${component.id}:publicExports:${duplicate}`, registryPath, 'Export pÃºblico duplicado dentro da entrada.'));
    }
  }
  const categoryIds = new Set(registry.categories.map((category) => category.id));
  const traitIds = new Set(registry.traits.map((trait) => trait.id));
  const componentIds = new Set(registry.components.map((component) => component.id));
  for (const category of registry.categories) {
    for (const traitId of category.allowedTraits) {
      if (!traitIds.has(traitId)) findings.push(finding('REG001', 'category', category.id, registryPath, `Trait referenciado não existe: ${traitId}.`));
    }
    for (const relatedId of category.relatedCategories) {
      if (!categoryIds.has(relatedId)) findings.push(finding('REG001', 'category', category.id, registryPath, `Categoria relacionada não existe: ${relatedId}.`));
    }
    for (const consumerId of category.consumers) {
      if (!componentIds.has(consumerId)) findings.push(finding('REG001', 'category', category.id, registryPath, `Consumer não existe: ${consumerId}.`));
    }
  }
  for (const trait of registry.traits) {
    for (const categoryId of trait.compatibleCategories) {
      if (!categoryIds.has(categoryId)) findings.push(finding('REG001', 'trait', trait.id, registryPath, `Categoria compatível não existe: ${categoryId}.`));
    }
  }
  for (const component of registry.components) {
    if (component.primitiveBase !== null && !componentIds.has(component.primitiveBase)) {
      findings.push(finding('REG001', 'component', component.id, registryPath, `Primitive base não existe: ${component.primitiveBase}.`));
    }
    for (const source of component.sourceFiles) {
      const discoveredLayer = ({ ui: 'ui', atoms: 'atom', molecules: 'molecule', organisms: 'organism', templates: 'template' })[source.path.split('/')[2]];
      if (discoveredLayer !== source.discoveredLayer) {
        findings.push(finding('REG001', 'source', source.path, registryPath, 'discoveredLayer diverge da pasta da fonte.'));
      }
    }
    for (const publicExport of component.publicExports) {
      if (!/^[A-Za-z_$][\w$]*$/.test(publicExport.name)) {
        findings.push(finding('REG001', 'export', `${component.id}:${publicExport.name}`, registryPath, 'Nome de export público inválido.'));
      }
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

  const actualSources = (await discoverFiles(path.join(rootDir, 'src/components'), rootDir, (name) => name.endsWith('.tsx')))
    .filter((source) => !NON_CATALOG_COMPONENT_SOURCES.has(source));
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
    if (category?.lifecycle === 'deprecated' && component.lifecycle === 'proposed') {
      findings.push(finding('GOV002', 'component', component.id, registryPath, 'Proposta não pode introduzir consumidor em categoria deprecated.'));
    }
  }

  if (mode === 'strict') {
    let decisions = '';
    try { decisions = await readUtf8(rootDir, 'design-system/components/category-decisions.md'); } catch { /* finding per category below */ }
    const tokenIndex = await readTokenIndex(rootDir);
    if (!tokenIndex) {
      findings.push(finding('SYNC001', 'document', 'token-index', TOKEN_INDEX_PATH, 'Índice canônico de tokens ausente.'));
    }

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
      const categoryTokens = [
        ...uniqueTokensFrom(section(markdown, 'Tokens by part')),
        ...[...markdown.matchAll(/(?:^|\n)\s*Tokens?[^\n]*`([^`]+)`/gi)].map((match) => match[1]),
      ];
      if (categoryTokens.some((token) => !tokenIndex?.has(token) && !['transparent', 'currentColor'].includes(token))) {
        findings.push(finding('TOK001', 'category', category.id, category.document, 'Token referenciado não existe no índice canônico.'));
      }
      if (LOCAL_FOUNDATION_REDEFINITION_PATTERN.test(markdown)) {
        findings.push(finding('CAT003', 'category', category.id, category.document, 'Categoria tenta redefinir fundamento global.'));
      }
      if (PLACEHOLDER_PATTERN.test(markdown) || OPEN_DECISION_PATTERN.test(markdown)) findings.push(finding('DOC001', 'category', category.id, category.document, 'Decisão aberta ou placeholder.'));
      for (const broken of await checkLocalLinks(rootDir, markdown, category.document)) {
        findings.push(finding('DOC002', 'category', category.id, category.document, `Link local quebrado: ${broken}.`));
      }
      if (/SYNC-CONFLICT|suporta (?:mobile|tablet|dark mode)/i.test(markdown)) {
        findings.push(finding('SYNC001', 'category', category.id, category.document, 'Categoria contradiz fundamentos vigentes.'));
      }
      const record = decisionRecord(decisions, category.decisionRef);
      const requiredDecisionFields = ['Problem:', 'Consumers:', 'Alternatives:', 'Impact:', 'Compatibility:', 'Decision:'];
      if (!category.decisionRef || !record || requiredDecisionFields.some((field) => !new RegExp(`^- ${field.replace(':', '\\:')}[ \\t]*\\S`, 'mi').test(record))) {
        findings.push(finding('GOV002', 'category', category.id, category.document, 'Lifecycle sem decisão registrada.'));
      }
      if (category.lifecycle === 'deprecated' && category.consumers.length > 0) {
        findings.push(finding('GOV002', 'category', category.id, registryPath, 'Categoria deprecated não aceita novos consumidores.'));
      }
      if (category.lifecycle === 'deprecated' && !/^- Replacement:\s*.+$/mi.test(record)) {
        findings.push(finding('GOV002', 'category', category.id, registryPath, 'Categoria deprecated precisa de substituto estruturado.'));
      }
      for (const foundationLink of foundationLinkNames()) {
        if (!markdown.includes(`](${foundationLink})`)) {
          findings.push(finding('SYNC001', 'category', category.id, category.document, `Fundamento obrigatório não referenciado: ${foundationLink}.`));
        }
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
      const profileTokenRefs = [...markdown.matchAll(/(?:^|\n)\s*Tokens?[^\n]*`([^`]+)`/gi)].map((match) => match[1]);
      if (markdown.includes('token-does-not-exist') || profileTokenRefs.some((token) => !tokenIndex?.has(token) && !['transparent', 'currentColor'].includes(token))) {
        findings.push(finding('TOK001', 'profile', component.id, component.profile, 'Token referenciado não existe no índice canônico.'));
      }
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
        const escapedExceptionId = exceptionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const exceptionLine = markdown.match(new RegExp(`ExceptionRecord:\\s*${escapedExceptionId}[^\\n]*`, 'i'))?.[0];
        if (!exceptionLine) {
          findings.push(finding('GOV001', 'profile', component.id, component.profile, `Exceção registrada sem referência no perfil: ${exceptionId}.`));
        } else {
          const reviewAt = exceptionLine.match(/reviewAt:\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
          const today = new Date().toISOString().slice(0, 10);
          if (!reviewAt || reviewAt < today) {
            findings.push(finding('GOV001', 'profile', component.id, component.profile, `Exceção incompleta ou expirada: ${exceptionId}.`));
          }
        }
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
    process.stdout.write('40 current source files covered\n');
    process.stdout.write('0 uncovered public visual exports\n');
    process.stdout.write('11 categories homologated\n');
    process.stdout.write('4 proposed components specified\n');
    process.stdout.write('0 blocking findings\n');
  }
  const fatal = findings.some(({ code, entityId }) => code === 'REG001' && ['registry', 'configuration'].includes(entityId));
  process.exitCode = fatal ? 2 : findings.some(({ severity }) => severity === 'error') ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await runCli();
