const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
let fileCount = 0;
let linkCount = 0;
let brokenLinks = [];

function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootDir, fullPath).replaceAll('\\', '/');
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === '.next' ||
      entry.name === '.lighthouseci' ||
      entry.name === 'playwright-report' ||
      entry.name === 'test-results' ||
      relativePath === 'specs'
    ) {
      continue;
    }
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      checkMarkdownFile(fullPath);
    }
  }
}

function checkMarkdownFile(filePath) {
  fileCount++;
  const content = fs.readFileSync(filePath, 'utf8');
  // Match markdown links: [label](url)
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const label = match[1];
    let target = match[2].trim();

    // Ignore web links and section anchors
    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#') || target.startsWith('mailto:')) {
      continue;
    }

    linkCount++;
    let resolvedPath = null;

    if (target.startsWith('file:///')) {
      let cleanPath = target.replace('file:///', '');
      // Strip line number fragments like #L12-34
      cleanPath = cleanPath.split('#')[0];
      // Convert to Windows or POSIX path
      resolvedPath = path.normalize(cleanPath);
    } else if (target.startsWith('/')) {
      cleanPath = target.split('#')[0];
      resolvedPath = path.join(rootDir, cleanPath);
    } else {
      cleanPath = target.split('#')[0];
      resolvedPath = path.resolve(path.dirname(filePath), cleanPath);
    }

    if (resolvedPath && !fs.existsSync(resolvedPath)) {
      brokenLinks.push({
        sourceFile: path.relative(rootDir, filePath),
        label,
        target,
        resolvedPath
      });
    }
  }
}

console.log('🔍 Iniciar verificação automatizada de links...');
scanDirectory(rootDir);

console.log(`\n📊 Relatório de Auditoria:`);
console.log(`- Arquivos .md analisados: ${fileCount}`);
console.log(`- Links locais verificados: ${linkCount}`);

if (brokenLinks.length === 0) {
  console.log(`✅ Sucesso! Zero links quebrados encontrados.`);
  process.exit(0);
} else {
  console.log(`❌ Erro: ${brokenLinks.length} links quebrados encontrados:\n`);
  brokenLinks.forEach((item, index) => {
    console.log(`${index + 1}. Em: ${item.sourceFile}`);
    console.log(`   Link: [${item.label}](${item.target})`);
    console.log(`   Caminho não encontrado: ${item.resolvedPath}\n`);
  });
  process.exit(1);
}
