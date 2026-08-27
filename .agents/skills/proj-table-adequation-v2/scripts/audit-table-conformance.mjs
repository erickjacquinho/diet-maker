import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  discoverTableCandidates,
  resolveTableContract,
} from './resolve-table-contract.mjs';

const ROOT = process.cwd();

function finding(code, severity, contract, line, message, expected = null, evidence = null) {
  return {
    code,
    severity,
    path: contract.target.path,
    line: line ?? null,
    message,
    expected,
    evidence,
  };
}

function isCanonicalSource(contract) {
  return contract.target.path === contract.canonical.source
    || contract.target.path.startsWith('src/components/molecules/data-table/')
    || contract.target.path.startsWith('src/components/ui/');
}

function associatedTestFinding(contract) {
  if (isCanonicalSource(contract)) return [];
  if (contract.target.associatedTests.length > 0) return [];
  return [finding('TABLE020', 'warning', contract, null, 'No associated test file was discovered for the table consumer.', 'component interaction tests', null)];
}

function auditTarget(contract) {
  const target = contract.target;
  const findings = [];
  const canonical = isCanonicalSource(contract);

  if (!canonical && (target.usesRawHtmlTable || target.usesPrimitiveTable) && !target.usesDataTable) {
    findings.push(finding('TABLE001', 'error', contract, null, 'Table markup must use the current canonical DataTable molecule.', contract.canonical.source, target.usesPrimitiveTable ? 'Table primitive detected' : '<table> detected'));
  }

  if (!canonical && target.usesDataTable) {
    if (!target.importsCanonicalDataTable) findings.push(finding('TABLE002', 'error', contract, target.lines.dataTable, 'DataTable markup is present but the canonical module import was not detected.', 'import from canonical DataTable source'));
    if (!target.typedColumns) findings.push(finding('TABLE003', 'error', contract, target.lines.dataTable, 'Columns must be typed with the current DataTableColumnDef API.', 'DataTableColumnDef<TData>[]'));
    const props = target.props;
    for (const required of ['data', 'columns', 'getRowId', 'caption', 'emptyMessage']) {
      if (!props?.names.includes(required)) findings.push(finding('TABLE004', 'error', contract, props?.line, `DataTable is missing required semantic prop: ${required}.`, required));
    }
    if (target.sortableColumns > target.sortValueCount) findings.push(finding('TABLE005', 'error', contract, null, 'Every sortable column must provide a sortValue.', 'sortable and sortValue paired'));
    if (target.numericColumnIssues.length) {
      for (const issue of target.numericColumnIssues) findings.push(finding('TABLE006', 'error', contract, issue.line, `Numeric/comparable column "${issue.id}" must be right-aligned by default or centered for a compact selection table.`, "align: 'right' or align: 'center'", issue.align));
    }
    if (target.conditionalEmptyBypass.length) {
      for (const issue of target.conditionalEmptyBypass) findings.push(finding('TABLE007', 'error', contract, issue.line, 'Empty results must remain inside DataTable via emptyMessage.', 'DataTable emptyMessage', 'manual empty branch'));
    }
    if (props?.maxHeight && /(?:px|vh|rem|em|\d)/.test(String(props.maxHeight)) && !/table-(?:compact|modal)/.test(String(props.maxHeight))) {
      findings.push(finding('TABLE008', 'error', contract, props.line, 'maxHeight must use a current semantic DataTable height token.', contract.canonical.capabilities.semanticMaxHeights, props.maxHeight));
    }
    if (target.selectionMode && !contract.canonical.capabilities.selection) findings.push(finding('TABLE009', 'error', contract, props?.line, 'Consumer requests selection but the resolved canonical DataTable API does not expose it.', 'current selection API', target.selectionMode));
    if (target.selectionMode && target.props.selectionFields.length < 3) findings.push(finding('TABLE010', 'error', contract, props?.line, 'Selection must declare mode, selectedRowIds, and onSelectionChange.', ['mode', 'selectedRowIds', 'onSelectionChange'], target.props.selectionFields));
    if (target.selectionMode && /selectOnRowClick\s*:\s*true/.test(props?.attributes.selection ?? '') && (!contract.canonical.capabilities.rowKeyboardSelection || !contract.canonical.capabilities.rowSelectedSemantics)) {
      findings.push(finding('TABLE011', 'error', contract, props?.line, 'Row-click selection requires current keyboard and aria-selected support in DataTable.', 'Enter/Space, tabIndex, aria-selected'));
    }
  }

  if (!canonical) {
    for (const item of target.arbitraryClasses) findings.push(finding('TABLE012', 'error', contract, item.line, 'Arbitrary Tailwind values are not allowed in table consumers.', 'semantic token class', item.value));
    for (const item of target.rawZIndexes) findings.push(finding('TABLE013', 'error', contract, item.line, 'Raw numeric or arbitrary z-index classes are not allowed.', 'canonical z-* token', item.value));
    if (target.inlineCheckbox) findings.push(finding('TABLE014', 'error', contract, null, 'Use the canonical Checkbox atom instead of an inline checkbox button.', 'Checkbox atom', 'inline role=checkbox'));
    if (target.usesDataTable && !target.importsCanonicalCheckbox && target.selectionMode && !target.dataTables[0]?.attributes.selection) findings.push(finding('TABLE015', 'warning', contract, target.lines.dataTable, 'Selection is present but no Checkbox dependency was discovered; confirm the canonical molecule owns it.', 'DataTable selection contract'));
  }

  if (contract.canonical.profileDrift) {
    findings.push({
      code: 'CONTRACT_DRIFT',
      severity: 'error',
      path: contract.canonical.profile,
      line: null,
      message: 'DataTable source exposes selection while its profile says selection is unsupported.',
      expected: 'profile aligned with current DataTable API',
      evidence: 'selection mismatch',
    });
  }

  if (!canonical) {
    for (const dependency of (target.dependencyGraph ?? []).filter((item) => item.depth > 0)) {
      if (!dependency.catalog && !dependency.path.startsWith('src/components/ui/')) {
        findings.push(finding('TABLE016', 'warning', contract, null, `Composed child "${dependency.importedAs ?? dependency.path}" is not catalogued; review its own contract.`, 'registry/profile/category entry', dependency.path));
      }
    }
  }

  findings.push(...associatedTestFinding(contract));
  return findings;
}

export function auditTableConformance(rootDir, targets = null) {
  const targetPaths = targets?.length ? targets : discoverTableCandidates(rootDir);
  const reports = targetPaths.map((target) => {
    try {
      const contract = resolveTableContract(rootDir, target);
      return { contract, findings: auditTarget(contract) };
    } catch (error) {
      return {
        contract: { target: { path: target } },
        findings: [{ code: 'TABLE000', severity: 'error', path: target, line: null, message: error.message, expected: 'resolvable source', evidence: null }],
      };
    }
  });
  const findings = reports.flatMap((report) => report.findings);
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    mode: 'inventory',
    targets: reports.map((report) => report.contract),
    findings,
    summary: {
      targets: reports.length,
      errors: findings.filter((item) => item.severity === 'error').length,
      warnings: findings.filter((item) => item.severity === 'warning').length,
      compliantTargets: reports.filter((report) => !report.findings.some((item) => item.severity === 'error')).length,
    },
  };
}

function parseArgs(args) {
  const targetPaths = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--target') {
      const target = args[index + 1];
      if (!target) throw new Error('--target requires a file path.');
      targetPaths.push(target);
      index += 1;
    }
  }
  return { targetPaths, json: args.includes('--json'), strict: args.includes('--strict') };
}

async function runCli() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = auditTableConformance(ROOT, options.targetPaths.length ? options.targetPaths : null);
    result.mode = options.strict ? 'strict' : 'inventory';
    if (options.json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    else {
      for (const item of result.findings) process.stdout.write(`${item.severity.toUpperCase()} ${item.code} ${item.path}${item.line ? `:${item.line}` : ''} ${item.message}\n`);
      process.stdout.write(`Table audit: ${result.summary.compliantTargets}/${result.summary.targets} targets without errors; ${result.summary.errors} errors, ${result.summary.warnings} warnings.\n`);
    }
    if (options.strict && result.summary.errors > 0) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Table audit configuration failure: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await runCli();
}
