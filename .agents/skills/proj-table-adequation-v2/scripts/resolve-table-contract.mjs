import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const SKIP_DIRECTORIES = new Set(['node_modules', '.next', 'dist', 'coverage']);
const ROOT = process.cwd();

function normalize(value) {
  return value.replaceAll(path.sep, '/');
}

function projectPath(rootDir, absolutePath) {
  return normalize(path.relative(rootDir, absolutePath));
}

function exists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function getRegistryComponents(registry) {
  if (Array.isArray(registry)) return registry;
  return registry.components ?? registry.entries ?? [];
}

export function readRegistry(rootDir) {
  const registryPath = path.join(rootDir, 'design-system/components/registry.json');
  if (!exists(registryPath)) return { path: null, components: [] };
  return { path: projectPath(rootDir, registryPath), components: getRegistryComponents(readJson(registryPath)) };
}

function candidatePaths(basePath) {
  return [
    basePath,
    ...EXTENSIONS.map((extension) => `${basePath}${extension}`),
    ...EXTENSIONS.map((extension) => path.join(basePath, `index${extension}`)),
  ];
}

export function resolveModule(rootDir, importerPath, moduleSpecifier) {
  let basePath;
  if (moduleSpecifier.startsWith('@/')) {
    basePath = path.join(rootDir, 'src', moduleSpecifier.slice(2));
  } else if (moduleSpecifier.startsWith('.')) {
    basePath = path.resolve(path.dirname(importerPath), moduleSpecifier);
  } else {
    return null;
  }

  return candidatePaths(basePath).find(exists) ?? null;
}

function resolveExportedSymbol(rootDir, barrelPath, localName, visited = new Set()) {
  if (!barrelPath || visited.has(barrelPath) || !exists(barrelPath)) return null;
  visited.add(barrelPath);
  const source = readText(barrelPath);
  if (!path.basename(barrelPath).startsWith('index.')) {
    const exportedSymbol = new RegExp(`export\\s+(?:(?:const|function|class|interface|type)\\s+${localName}\\b|\\{[^}]*\\b${localName}\\b)`);
    return exportedSymbol.test(source) ? barrelPath : null;
  }

  for (const match of source.matchAll(/export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const exported = match[1].split(',').map((item) => item.trim()).filter(Boolean);
    const hasSymbol = exported.some((item) => {
      const [sourceName, alias] = item.split(/\s+as\s+/).map((part) => part.trim());
      return (alias ?? sourceName) === localName;
    });
    if (hasSymbol) {
      const nested = resolveModule(rootDir, barrelPath, match[2]);
      return resolveExportedSymbol(rootDir, nested, localName) ?? nested;
    }
  }

  for (const match of source.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)) {
    const nested = resolveModule(rootDir, barrelPath, match[1]);
    const resolved = resolveExportedSymbol(rootDir, nested, localName, visited);
    if (resolved) return resolved;
  }
  return null;
}

function resolveImportedSymbol(rootDir, importerPath, moduleSpecifier, localName) {
  const modulePath = resolveModule(rootDir, importerPath, moduleSpecifier);
  return resolveExportedSymbol(rootDir, modulePath, localName) ?? modulePath;
}

function parseSource(filePath) {
  return ts.createSourceFile(
    filePath,
    readText(filePath),
    ts.ScriptTarget.Latest,
    true,
    path.extname(filePath).toLowerCase() === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function nodeName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return node.getText();
}

function propertyName(property) {
  return nodeName(property.name);
}

function typeDeclarations(sourceFile) {
  const declarations = new Map();
  function visit(node) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      declarations.set(node.name.text, node);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return declarations;
}

function declarationMembers(declaration, sourceFile) {
  if (!declaration) return [];
  const members = ts.isInterfaceDeclaration(declaration)
    ? declaration.members
    : ts.isTypeLiteralNode(declaration.type)
      ? declaration.type.members
      : [];
  return [...members]
    .map((member) => propertyName(member))
    .filter(Boolean)
    .map((name) => ({ name, declaration: members.find((member) => propertyName(member) === name)?.getText(sourceFile) }));
}

function typeSignatures(filePath, names) {
  if (!filePath || !exists(filePath)) return {};
  const sourceFile = parseSource(filePath);
  const declarations = typeDeclarations(sourceFile);
  return Object.fromEntries(names.map((name) => {
    const declaration = declarations.get(name);
    const members = declarationMembers(declaration, sourceFile);
    const type = ts.isTypeAliasDeclaration(declaration) ? declaration.type?.getText(sourceFile) : null;
    return [name, { members, type }];
  }));
}

function resolveRegistryEntryBySource(components, rootDir, absolutePath) {
  const relative = projectPath(rootDir, absolutePath);
  return components.find((component) =>
    (component.sourceFiles ?? []).some((source) => normalize(source.path) === relative),
  ) ?? null;
}

function resolveRegistryEntry(components, localName, sourcePath, rootDir) {
  if (sourcePath) {
    const sourceMatch = resolveRegistryEntryBySource(components, rootDir, sourcePath);
    if (sourceMatch) return sourceMatch;
  }
  const matches = components.filter((component) => component.name === localName);
  return matches.length === 1 ? matches[0] : matches.length > 1 ? matches : null;
}

function sourceFileFromEntry(rootDir, entry) {
  const source = entry?.sourceFiles?.find((item) => item.role === 'implementation') ?? entry?.sourceFiles?.[0];
  return source?.path ? path.resolve(rootDir, source.path) : null;
}

function categoryPath(rootDir, entry) {
  return entry?.primaryCategory
    ? path.join(rootDir, 'design-system/components/categories', `${entry.primaryCategory}.md`)
    : null;
}

function profilePath(rootDir, entry) {
  return entry?.profile ? path.join(rootDir, entry.profile) : null;
}

function readTailwindTokens(rootDir) {
  const configPath = path.join(rootDir, 'tailwind.config.js');
  if (!exists(configPath)) return { path: null, maxHeight: [], zIndex: [], fontSize: [], colors: [] };
  try {
    const require = createRequire(import.meta.url);
    const config = require(configPath);
    const extend = config.theme?.extend ?? {};
    return {
      path: projectPath(rootDir, configPath),
      maxHeight: Object.keys(extend.maxHeight ?? {}),
      zIndex: Object.keys(extend.zIndex ?? {}),
      fontSize: Object.keys(extend.fontSize ?? {}),
      colors: Object.keys(extend.colors ?? {}),
    };
  } catch (error) {
    return { path: projectPath(rootDir, configPath), error: error.message, maxHeight: [], zIndex: [], fontSize: [], colors: [] };
  }
}

function readCssTokens(rootDir) {
  const tokensPath = path.join(rootDir, 'src/design-system/tokens.css');
  if (!exists(tokensPath)) return { path: null, names: [] };
  const names = [...readText(tokensPath).matchAll(/--([a-z0-9-]+)\s*:/gi)].map((match) => match[1]);
  return { path: projectPath(rootDir, tokensPath), names: [...new Set(names)].sort() };
}

function getJsxTagName(tagName) {
  return tagName.getText().replace(/^<|\/>$/g, '');
}

function jsxAttributes(node, sourceFile) {
  return new Map(node.attributes.properties.flatMap((attribute) => {
    if (!ts.isJsxAttribute(attribute)) return [];
    return [[attribute.name.text, attribute.initializer?.getText(sourceFile) ?? true]];
  }));
}

function collectJsx(sourceFile) {
  const elements = [];
  const tags = new Set();
  const conditionals = [];

  function visit(node) {
    if (ts.isJsxElement(node)) {
      const tag = getJsxTagName(node.openingElement.tagName);
      tags.add(tag);
      elements.push({ tag, node: node.openingElement, attributes: jsxAttributes(node.openingElement, sourceFile) });
    } else if (ts.isJsxSelfClosingElement(node)) {
      const tag = getJsxTagName(node.tagName);
      tags.add(tag);
      elements.push({ tag, node, attributes: jsxAttributes(node, sourceFile) });
    } else if (ts.isConditionalExpression(node)) {
      conditionals.push({
        condition: node.condition.getText(sourceFile),
        whenTrue: node.whenTrue.getText(sourceFile),
        whenFalse: node.whenFalse.getText(sourceFile),
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { elements, tags: [...tags].sort(), conditionals };
}

function collectImports(sourceFile, rootDir) {
  const imports = [];
  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) return;
    const moduleSpecifier = node.moduleSpecifier.text;
    const clause = node.importClause;
    const locals = [];
    if (clause?.name) locals.push(clause.name.text);
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      clause.namedBindings.elements.forEach((element) => locals.push(element.name.text));
    }
    const bindings = locals.map((local) => {
      const resolved = resolveImportedSymbol(rootDir, sourceFile.fileName, moduleSpecifier, local);
      return { local, sourcePath: resolved ? projectPath(rootDir, resolved) : null };
    });
    const sourcePath = bindings.find((binding) => binding.sourcePath)?.sourcePath ?? null;
    imports.push({ moduleSpecifier, locals, sourcePath, bindings });
  });
  return imports;
}

function lineFor(sourceFile, position) {
  return sourceFile.getLineAndCharacterOfPosition(position).line + 1;
}

function targetTests(rootDir, targetPath) {
  const stem = path.basename(targetPath, path.extname(targetPath));
  const kebabStem = stem.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  const expected = new Set([stem.toLowerCase(), kebabStem]);
  const matches = [];

  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(?:test|spec)\.(?:tsx|ts|jsx|js)$/.test(entry.name)) {
        const testStem = entry.name.replace(/\.(?:test|spec)\.[^.]+$/, '').toLowerCase();
        if (expected.has(testStem)) matches.push(projectPath(rootDir, absolute));
      }
    }
  }

  walk(path.join(rootDir, 'tests'));
  walk(path.join(path.dirname(targetPath), '__tests__'));
  return [...new Set(matches)].sort();
}

function findNumericColumns(sourceFile) {
  const issues = [];
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const properties = new Map(node.properties.map((property) => [propertyName(property), property]));
      const id = properties.get('id')?.initializer?.getText(sourceFile)?.replace(/^['"]|['"]$/g, '');
      const align = properties.get('align')?.initializer?.getText(sourceFile)?.replace(/^['"]|['"]$/g, '');
      if (id && align) {
        const evidence = [
          id,
          properties.get('sortValue')?.initializer?.getText(sourceFile) ?? '',
        ].join(' ');
        const numeric = /(?:kcal|calor|protein|prote[ií]n|carb|gord|fat|count|amount|value|weight|percent|quantity|number|gram|macro)/i.test(evidence);
        if (numeric && !['right', 'center'].includes(align)) {
          issues.push({ id, align, line: lineFor(sourceFile, node.getStart(sourceFile)), evidence: evidence.slice(0, 180) });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return issues;
}

function findArbitraryClasses(sourceFile, source) {
  const findings = [];
  const pattern = /\b[\w:/-]+-\[[^\]]+\]/g;
  for (const match of source.matchAll(pattern)) {
    findings.push({ value: match[0], line: lineFor(sourceFile, match.index ?? 0) });
  }
  return findings;
}

function findRawZIndexes(sourceFile, source) {
  const findings = [];
  const pattern = /\bz-(?:\d+|\[[^\]]+\])/g;
  for (const match of source.matchAll(pattern)) {
    findings.push({ value: match[0], line: lineFor(sourceFile, match.index ?? 0) });
  }
  return findings;
}

function findConditionalEmptyBypass(jsx) {
  return jsx.conditionals.filter(({ condition, whenTrue, whenFalse }) => {
    const isEmptyCheck = /(?:\.length\s*(?:===|==|<=)\s*0|!\s*\w+\.length)/.test(condition);
    const branches = [whenTrue, whenFalse];
    const hasDataTable = branches.some((branch) => /<DataTable\b/.test(branch));
    const hasManualEmpty = branches.some((branch) => /<(?:div|span|p)\b/.test(branch) && /(?:nenhum|nenhuma|empty|no result|sem dados)/i.test(branch));
    return isEmptyCheck && hasDataTable && hasManualEmpty;
  });
}

function extractDataTableInstances(jsx, sourceFile) {
  return jsx.elements.filter((element) => element.tag === 'DataTable').map((element) => {
    const attributes = Object.fromEntries(element.attributes.entries());
    return {
      line: lineFor(sourceFile, element.node.getStart(sourceFile)),
      attributes,
      names: Object.keys(attributes),
      maxHeight: attributes.maxHeight ?? null,
      selectionMode: (attributes.selection?.match(/\bmode\s*:\s*['"]([^'"]+)/)?.[1]) ?? null,
      selectionFields: ['mode', 'selectedRowIds', 'onSelectionChange'].filter((field) => new RegExp(`\\b${field}\\s*:`).test(attributes.selection ?? '')),
    };
  });
}

function resolveDependencies(rootDir, components, sourceFile, imports, jsx) {
  const byLocal = new Map(imports.flatMap((item) => item.locals.map((local) => [local, item])));
  return jsx.tags
    .filter((tag) => /^[A-Z]/.test(tag) && !['DataTable', 'React', 'Fragment'].includes(tag))
    .map((tag) => {
      const imported = byLocal.get(tag);
      const binding = imported?.bindings?.find((item) => item.local === tag);
      const source = binding?.sourcePath ?? imported?.sourcePath ?? null;
      const absolute = source ? path.resolve(rootDir, source) : null;
      const catalog = resolveRegistryEntry(components, tag, absolute, rootDir);
      return {
        name: tag,
        import: imported?.moduleSpecifier ?? null,
        source,
        catalog: Array.isArray(catalog)
          ? catalog.map((entry) => ({ id: entry.id, profile: entry.profile, category: entry.primaryCategory }))
          : catalog ? { id: catalog.id, profile: catalog.profile, category: catalog.primaryCategory } : null,
      };
    });
}

function dependencyGraph(rootDir, components, canonical, targetPath) {
  const nodes = new Map();
  const visitedDepth = new Map();
  const maxDepth = 3;

  function walk(filePath, depth, importedAs = null, importedFrom = null) {
    if (!filePath || !exists(filePath) || depth > maxDepth) return;
    const normalized = projectPath(rootDir, filePath);
    if (normalized.startsWith('node_modules/') || normalized === canonical.source) return;
    if (visitedDepth.has(normalized) && visitedDepth.get(normalized) <= depth) return;
    visitedDepth.set(normalized, depth);

    const source = readText(filePath);
    const sourceFile = parseSource(filePath);
    const jsx = collectJsx(sourceFile);
    const imports = collectImports(sourceFile, rootDir);
    const dependencies = resolveDependencies(rootDir, components, sourceFile, imports, jsx);
    const entry = resolveRegistryEntryBySource(components, rootDir, filePath);
    nodes.set(normalized, {
      path: normalized,
      depth,
      importedAs,
      importedFrom,
      catalog: entry ? { id: entry.id, profile: entry.profile, category: entry.primaryCategory } : null,
      dependencies: dependencies.map((dependency) => ({ name: dependency.name, import: dependency.import, source: dependency.source })),
    });

    for (const dependency of dependencies) {
      if (dependency.source) walk(path.resolve(rootDir, dependency.source), depth + 1, dependency.name, normalized);
    }
  }

  walk(targetPath, 0);
  return [...nodes.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function canonicalContract(rootDir, registry) {
  const entry = registry.components.find((component) => component.id === 'molecule-data-table' || component.name === 'DataTable');
  const sourcePath = sourceFileFromEntry(rootDir, entry);
  const typePath = sourcePath ? resolveModule(rootDir, sourcePath, './data-table/types') : null;
  const names = (entry?.publicExports ?? []).filter((item) => item.kind === 'type').map((item) => item.name);
  const signatures = typeSignatures(typePath, names);
  const source = sourcePath && exists(sourcePath) ? readText(sourcePath) : '';
  const maxHeightBlock = source.match(/maxHeightClasses[^=]*=\s*\{([\s\S]*?)\n\};/m);
  const maxHeightClasses = maxHeightBlock
    ? [...maxHeightBlock[1].matchAll(/^\s*['"]([^'"]+)['"]\s*:/gm)].map((match) => match[1])
    : [];
  const profile = profilePath(rootDir, entry);
  return {
    id: entry?.id ?? null,
    name: entry?.name ?? 'DataTable',
    source: sourcePath ? projectPath(rootDir, sourcePath) : null,
    typesSource: typePath ? projectPath(rootDir, typePath) : null,
    profile: profile && exists(profile) ? projectPath(rootDir, profile) : null,
    category: categoryPath(rootDir, entry) && exists(categoryPath(rootDir, entry)) ? projectPath(rootDir, categoryPath(rootDir, entry)) : null,
    publicExports: entry?.publicExports ?? [],
    signatures,
    capabilities: {
      selection: Boolean(signatures.DataTableProps?.members?.some((member) => member.name === 'selection')),
      selectionModes: signatures.DataTableSelectionMode?.type?.match(/'([^']+)'/g)?.map((value) => value.slice(1, -1)) ?? [],
      semanticMaxHeights: signatures.DataTableMaxHeight?.type?.match(/'([^']+)'/g)?.map((value) => value.slice(1, -1)) ?? maxHeightClasses,
      rowKeyboardSelection: /tabIndex=\{selection\?\.selectOnRowClick/.test(source) && /onKeyDown=/.test(source),
      rowSelectedSemantics: /aria-selected=\{selection \? isSelected/.test(source),
      semanticLayer: /z-raised/.test(source),
    },
    profileDrift: profile && exists(profile) && signatures.DataTableProps?.members?.some((member) => member.name === 'selection')
      ? /(?:não oferece seleção|does not offer selection)/i.test(readText(profile))
      : false,
  };
}

export function resolveTableContract(rootDir, targetArgument = null) {
  const registry = readRegistry(rootDir);
  const canonical = canonicalContract(rootDir, registry);
  const result = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    canonical,
    designSystem: {
      registry: registry.path,
      tokens: readCssTokens(rootDir),
      tailwind: readTailwindTokens(rootDir),
    },
    target: null,
  };

  if (!targetArgument) return result;
  const targetPath = path.resolve(rootDir, targetArgument);
  if (!exists(targetPath)) throw new Error(`Target does not exist: ${targetArgument}`);
  const source = readText(targetPath);
  const sourceFile = parseSource(targetPath);
  const jsx = collectJsx(sourceFile);
  const imports = collectImports(sourceFile, rootDir);
  const dataTables = extractDataTableInstances(jsx, sourceFile);
  const dataTableImport = imports.find((item) => item.locals.includes('DataTable'));
  const importedSources = imports
    .filter((item) => item.sourcePath)
    .map((item) => path.resolve(rootDir, item.sourcePath));
  const importedSourceText = importedSources.filter(exists).map(readText).join('\n');
  const tests = targetTests(rootDir, targetPath);
  const props = dataTables[0] ?? null;
  const target = {
    path: projectPath(rootDir, targetPath),
    sourceLines: source.split(/\r?\n/).length,
    usesDataTable: jsx.tags.includes('DataTable'),
    usesRawHtmlTable: jsx.tags.includes('table'),
    usesPrimitiveTable: jsx.tags.includes('Table'),
    importsCanonicalDataTable: Boolean(dataTableImport),
    importsCanonicalCheckbox: imports.some((item) => item.locals.includes('Checkbox')),
    dataTables,
    props,
    typedColumns: /DataTableColumnDef\s*</.test(source) || /DataTableColumnDef\s*</.test(importedSourceText),
    sortableColumns: (source.match(/\bsortable\s*:/g) ?? []).length,
    sortValueCount: (source.match(/\bsortValue\s*:/g) ?? []).length,
    numericColumnIssues: findNumericColumns(sourceFile),
    arbitraryClasses: findArbitraryClasses(sourceFile, source),
    rawZIndexes: findRawZIndexes(sourceFile, source),
    inlineCheckbox: /<button\b[^>]*(?:role\s*=\s*['"]checkbox['"]|aria-checked\s*=)/i.test(source),
    conditionalEmptyBypass: findConditionalEmptyBypass(jsx),
    dependencies: resolveDependencies(rootDir, registry.components, sourceFile, imports, jsx),
    dependencyGraph: dependencyGraph(rootDir, registry.components, canonical, targetPath),
    associatedTests: tests,
    imports: imports.filter((item) => item.sourcePath || item.moduleSpecifier.startsWith('@/')),
    lines: {
      dataTable: dataTables[0]?.line ?? null,
      dataTableImport: dataTableImport ? lineFor(sourceFile, sourceFile.getText().indexOf('DataTable')) : null,
    },
  };
  result.target = target;
  return result;
}

export function discoverTableCandidates(rootDir) {
  const candidates = [];
  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.tsx$/.test(entry.name)) {
        const source = readText(absolute);
        if (/<DataTable\b|<table\b|<Table\b/.test(source)) candidates.push(projectPath(rootDir, absolute));
      }
    }
  }
  walk(path.join(rootDir, 'src'));
  return candidates;
}

function parseArgs(args) {
  const targetIndex = args.indexOf('--target');
  return {
    target: targetIndex >= 0 ? args[targetIndex + 1] : null,
    json: args.includes('--json'),
  };
}

async function runCli() {
  const options = parseArgs(process.argv.slice(2));
  try {
    const result = resolveTableContract(ROOT, options.target);
    if (options.json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    else {
      process.stdout.write(`Canonical table: ${result.canonical.source ?? 'not found'}\n`);
      if (result.target) process.stdout.write(`Target: ${result.target.path}\nDataTable: ${result.target.usesDataTable ? 'yes' : 'no'}\n`);
    }
  } catch (error) {
    process.stderr.write(`Table contract resolution failed: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await runCli();
}
