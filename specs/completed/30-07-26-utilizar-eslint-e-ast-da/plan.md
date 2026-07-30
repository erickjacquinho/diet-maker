# Implementation Plan: Atomic Design ESLint & AST Compliance Auditor

**Branch**: `30-07-26-utilizar-eslint-e-ast-da` | **Date**: 30-07-2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/30-07-26-utilizar-eslint-e-ast-da/spec.md`

## Summary

Implementar auditoria de conformidade para Atomic Design no projeto Next.js/React utilizando:
1. Configuração estrita do ESLint com `eslint-plugin-no-restricted-syntax` para bloquear tags HTML nativas (`<button>`, `<input>`, `<select>`, `<textarea>`) e estilos inline (`style={{ ... }}`) em views/páginas/organismos fora de `src/components/ui`.
2. Script de varredura AST em Node.js (`scripts/audit-atomic-design.mjs`) que analisa a árvore sintática dos arquivos TSX do projeto e produz relatórios de conformidade em JSON e Markdown.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js (ESM)
**Primary Dependencies**: `eslint` 8.57+, `eslint-config-next`, `@typescript-eslint/parser` (opcionalmente parser nativo de Babel/TypeScript para AST)
**Storage**: N/A (Relatórios estáticos em Markdown/JSON)
**Testing**: `vitest` / `npm run lint`
**Target Platform**: Node.js CLI & CI/CD
**Project Type**: Next.js 15 Web Application
**Performance Goals**: Linting < 5s, AST Auditor Scanner < 2s
**Constraints**: Não quebrar compilação de código existente sem aviso prévio; fornecer mecanismo de `disable` pontual com comentário.
**Scale/Scope**: ~50 componentes e páginas do projeto `diet-maker`.

## Constitution Check

- PASS: Nenhuma violação das diretrizes do projeto.

## Project Structure

### Documentation (this feature)

```text
specs/30-07-26-utilizar-eslint-e-ast-da/
├── plan.md              # Este arquivo
├── research.md          # Pesquisa técnica e escolhas de parser AST
├── data-model.md        # Estrutura do relatório de auditoria e regras AST
├── quickstart.md        # Guia de validação rápida e comandos
└── tasks.md             # Tarefas ordenadas de implementação
```

### Source Code Layout

```text
.eslintrc.json                  # Regras customizadas de ESLint para no-restricted-syntax
scripts/
└── audit-atomic-design.mjs     # Script de varredura AST em Node.js
```

**Structure Decision**: Adição de regra de lint em `.eslintrc.json` e script utilitário CLI em `scripts/` integrado a `package.json` (`npm run audit:atomic-design`).

## Complexity Tracking

Nenhuma complexidade excessiva.
