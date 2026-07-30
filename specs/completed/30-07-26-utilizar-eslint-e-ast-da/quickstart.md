# Quickstart & Validation Guide: Atomic Design Compliance Auditor

## Overview

Este guia descreve como executar o linter do ESLint e a ferramenta de varredura AST para validar o alinhamento do código com as diretrizes do Atomic Design.

## Pre-requisitos

- Node.js instalando e dependências instaladas (`npm install`).

## Comandos de Validação

### 1. Executar Linter do ESLint
Verifica se existem tags nativas restritas ou estilos inline no código:
```bash
npm run lint
```

### 2. Executar Varredura AST com Relatório Completo
Executa o scanner AST customizado que analisa todos os arquivos e gera relatórios em `.audit-report.json` e `.audit-report.md`:
```bash
npm run audit:atomic-design
```

## Testando a Regra (Manual Verification)

1. Abra qualquer arquivo de página (ex: `src/app/page.tsx`).
2. Adicione uma tag HTML nativa: `<button>Clique aqui</button>`.
3. Rode `npm run lint`.
4. **Resultado esperado**: O ESLint exibirá um erro indicando que a tag `<button>` deve ser substituída pelo componente de Design System (`<Button>`).
5. Remova a alteração de teste.
