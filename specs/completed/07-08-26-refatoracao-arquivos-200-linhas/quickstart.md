# Quickstart Validation Guide: Refatoração, Componentização e Limpeza (>200 Linhas)

## 🎯 Objetivo de Validação

Este guia descreve os passos para verificar que a refatoração dos 20 arquivos com mais de 200 linhas foi realizada com sucesso, alcançando a redução de tamanho esperada sem introduzir qualquer regressão de compilação, layout ou comportamento de negócio.

---

## 🛠️ Passo 1: Validação de Contagem de Linhas por Arquivo

Execute o comando Node.js para verificar se algum arquivo de código-fonte em `src/` ultrapassa 200 linhas de código (excluindo a base estática de dados JSON `taco_database.json`):

```bash
node -e "const fs = require('fs'); const path = require('path'); function getFiles(dir) { let results = []; const list = fs.readdirSync(dir); list.forEach(file => { const full = path.join(dir, file); const stat = fs.statSync(full); if (stat && stat.isDirectory()) { if (!['node_modules', '.next', '.git'].includes(file)) results = results.concat(getFiles(full)); } else { results.push(full); } }); return results; } const files = getFiles('./src'); const over200 = []; files.forEach(f => { if (f.includes('taco_database.json')) return; try { const content = fs.readFileSync(f, 'utf-8'); const lines = content.split('\n').length; if (lines > 200) over200.push({ path: f.replace(/\\/g, '/'), lines }); } catch(e){} }); console.log('Arquivos com mais de 200 linhas:', over200.length); if (over200.length > 0) console.log(JSON.stringify(over200, null, 2));"
```

**Resultado Esperado**: `Arquivos com mais de 200 linhas: 0`.

---

## 🧪 Passo 2: Execução dos Testes Automatizados

Execute a suíte completa de testes unitários e de integração:

```bash
npm run test
```

**Resultado Esperado**: Todos os testes devem passar com 100% de sucesso (0 falhas).

---

## 🏗️ Passo 3: Validação de Compilação & Build Next.js

Verifique que não existem erros de TypeScript ou problemas de empacotamento:

```bash
npm run build
```

**Resultado Esperado**: Build executado com sucesso e zero erros de lint/compilação.
