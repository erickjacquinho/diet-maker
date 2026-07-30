import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Directoies allowed to use raw HTML elements (Atoms / Base UI primitives)
const EXCLUDED_DIRS = [
  path.normalize('src/components/ui'),
  path.normalize('src/components/atoms'),
];

// Restricted raw HTML tags outside of atoms
const RESTRICTED_TAGS = new Set(['button', 'input', 'select', 'textarea']);

function isExcludedPath(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const normalized = path.normalize(relativePath);
  return EXCLUDED_DIRS.some((excluded) => normalized.startsWith(excluded));
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function analyzeAST(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const violations = [];
  const isExcluded = isExcludedPath(filePath);

  function visit(node) {
    // Check JSX elements (Opening & SelfClosing)
    if (
      ts.isJsxOpeningElement(node) ||
      ts.isJsxSelfClosingElement(node)
    ) {
      const tagName = node.tagName.getText(sourceFile);

      // Check restricted HTML tag
      if (!isExcluded && RESTRICTED_TAGS.has(tagName.toLowerCase())) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const lineText = fileContent.split('\n')[line] || '';
        violations.push({
          file: path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'),
          line: line + 1,
          column: character + 1,
          type: 'RESTRICTED_HTML_TAG',
          element: tagName,
          suggestedReplacement: `<${tagName.charAt(0).toUpperCase() + tagName.slice(1)}> (from Design System @/components/ui)`,
          snippet: lineText.trim(),
        });
      }
    }

    // Check style attribute (inline styles)
    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.getText(sourceFile);
      if (attrName === 'style') {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const lineText = fileContent.split('\n')[line] || '';
        violations.push({
          file: path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'),
          line: line + 1,
          column: character + 1,
          type: 'INLINE_STYLE',
          element: 'style',
          suggestedReplacement: 'Use Tailwind CSS classes or Design System spacing/color tokens',
          snippet: lineText.trim(),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

function runAudit() {
  console.log('🔍 Executando varredura AST de conformidade ao Atomic Design...\n');

  const files = getAllFiles(SRC_DIR);
  let totalViolations = 0;
  const allViolations = [];
  let nonCompliantFileCount = 0;

  files.forEach((filePath) => {
    const violations = analyzeAST(filePath);
    if (violations.length > 0) {
      nonCompliantFileCount++;
      totalViolations += violations.length;
      allViolations.push(...violations);
    }
  });

  const compliantFiles = files.length - nonCompliantFileCount;
  const complianceScorePercentage = files.length > 0 
    ? Number(((compliantFiles / files.length) * 100).toFixed(2)) 
    : 100;

  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFilesScanned: files.length,
      compliantFiles,
      nonCompliantFiles: nonCompliantFileCount,
      totalViolations,
      complianceScorePercentage,
    },
    violations: allViolations,
  };

  // Save JSON report
  const jsonReportPath = path.join(PROJECT_ROOT, '.audit-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2), 'utf-8');

  // Save Markdown report
  let mdReport = `# 📊 Relatório de Auditoria de Conformidade ao Atomic Design\n\n`;
  mdReport += `**Data**: ${new Date().toLocaleString('pt-BR')}\n\n`;
  mdReport += `## Resumo Executivo\n\n`;
  mdReport += `- **Arquivos Analisados**: ${files.length}\n`;
  mdReport += `- **Arquivos Conformes**: ${compliantFiles} (${complianceScorePercentage}%)\n`;
  mdReport += `- **Arquivos com Violações**: ${nonCompliantFileCount}\n`;
  mdReport += `- **Total de Violações**: ${totalViolations}\n\n`;

  if (allViolations.length === 0) {
    mdReport += `🎉 **Parabéns! Nenhuma violação ao Atomic Design encontrada.**\n`;
  } else {
    mdReport += `## Violações Encontradas\n\n`;
    mdReport += `| Arquivo | Linha | Tipo | Elemento | Sugestão | Trecho |\n`;
    mdReport += `| --- | --- | --- | --- | --- | --- |\n`;
    allViolations.forEach((v) => {
      const cleanSnippet = v.snippet.replace(/\|/g, '\\|');
      mdReport += `| \`${v.file}\` | ${v.line} | \`${v.type}\` | \`${v.element}\` | ${v.suggestedReplacement} | \`${cleanSnippet}\` |\n`;
    });
  }

  const mdReportPath = path.join(PROJECT_ROOT, '.audit-report.md');
  fs.writeFileSync(mdReportPath, mdReport, 'utf-8');

  // Console output
  console.log(`📈 Pontuação de Conformidade: ${complianceScorePercentage}%`);
  console.log(`📁 Arquivos escaneados: ${files.length}`);
  console.log(`✅ Arquivos conformes: ${compliantFiles}`);
  console.log(`⚠️ Arquivos não conformes: ${nonCompliantFileCount}`);
  console.log(`❌ Total de violações: ${totalViolations}\n`);

  if (allViolations.length > 0) {
    console.log(`📄 Relatório detalhado gerado em:`);
    console.log(`   - .audit-report.json`);
    console.log(`   - .audit-report.md\n`);
  } else {
    console.log(`✨ Projeto 100% aderente às diretrizes de Atomic Design!`);
  }
}

runAudit();
