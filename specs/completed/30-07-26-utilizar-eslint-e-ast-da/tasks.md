# Tasks: Atomic Design ESLint & AST Compliance Auditor

**Feature**: Atomic Design ESLint & AST Compliance Auditor
**Branch**: `30-07-26-utilizar-eslint-e-ast-da`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup

- [x] T001 [skill: general] Verificar a configuração do `.eslintrc.json` e a estrutura de pastas do projeto `diet-maker`

## Phase 2: Foundational (Infraestrutura do Auditor)

- [x] T002 [skill: code-reviewer-expert] Criar o script de varredura AST em `scripts/audit-atomic-design.mjs` utilizando a API do TypeScript Compiler (`ts.createSourceFile`)
- [x] T003 [skill: general] Adicionar o script `audit:atomic-design` no `package.json` em `package.json`

## Phase 3: User Story 1 - Detecção Automática de HTML Nativo em Views/Páginas (Priority: P1)

**Goal**: Configurar o ESLint para sinalizar e bloquear tags HTML nativas (`<button>`, `<input>`, `<select>`, `<textarea>`) em páginas/organismos fora de `src/components/ui`.
**Independent Test**: Inserir `<button>` em `src/app/page.tsx` e rodar `npm run lint`, confirmando o erro do linter.

- [x] T004 [skill: code-reviewer-expert] [US1] Configurar a regra `no-restricted-syntax` para tags JSX nativas em `eslint.config.mjs` com `overrides` para ignorar `src/components/ui/**`
- [x] T005 [P] [skill: code-reviewer-expert] [US1] Adicionar tratamento de exceção via comentários ESLint para casos de uso legítimos de tags nativas

## Phase 4: User Story 2 - Auditoria de Estilos Inline e Classes Arbitrárias (Priority: P2)

**Goal**: Bloquear `style={{ ... }}` e forçar o uso de tokens e classes do Design System.
**Independent Test**: Inserir `style={{ margin: 10 }}` em um componente e rodar `npm run lint`, confirmando o alerta/erro.

- [x] T006 [skill: code-reviewer-expert] [US2] Adicionar regra para restringir o atributo `style` no JSX dentro de `eslint.config.mjs`

## Phase 5: User Story 3 - Relatório de Varredura Completa AST (Priority: P3)

**Goal**: Gerar relatórios de conformidade `.audit-report.json` e `.audit-report.md` ao rodar o scanner AST.
**Independent Test**: Rodar `npm run audit:atomic-design` e verificar a criação dos relatórios com pontuação e lista de arquivos.

- [x] T007 [skill: code-reviewer-expert] [US3] Implementar geração de estatísticas e exportação em JSON/Markdown no script `scripts/audit-atomic-design.mjs`
- [x] T008 [P] [skill: webapp-testing] [US3] Testar a execução do scanner AST e validar o relatório gerado contra a codebase atual

## Phase 6: Polish & Documentation

- [x] T009 [skill: general] Documentar o funcionamento das regras de Atomic Design e do scanner no `README.md` do projeto
