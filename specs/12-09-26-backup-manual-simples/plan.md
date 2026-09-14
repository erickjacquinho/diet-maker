# Implementation Plan: Backup manual simples

**Branch**: `12-09-26-backup-manual-simples` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/12-09-26-backup-manual-simples/spec.md`

**Scope**: SDD documental; a implementação será executada posteriormente por `/speckit-implement`.

## Summary

Adicionar backup manual completo da Conta local: exportar as linhas confirmadas
das 17 tabelas canônicas para um envelope `.nutridiet` e restaurar somente após
validação estrita, confirmação explícita e substituição atômica. Drafts ficam
fora do arquivo e bloqueiam restauração até serem resolvidos. A solução reutiliza
o schema, runtime, barra lateral e Dialog já existentes; não cria rota, tabela,
organismo, coordenador global ou formato paralelo.

## Technical Context

**Language/Version**: TypeScript, Next.js 15.5.22, React 19 e Node/npm do workspace.

**Primary Dependencies**: PGlite + Drizzle; IndexedDB para drafts; componentes
Radix/shadcn existentes; Vitest, Testing Library e Playwright.

**Storage**: PGlite persistido em IndexedDB, schema local versão `4`; drafts em
IndexedDB separado.

**Testing**: Vitest serial no Windows, integração PGlite, testes de contrato/
arquitetura/UI e Playwright offline.

**Target Platform**: Web desktop a partir de 1024px, local-first e offline após
os recursos da aplicação estarem disponíveis.

**Project Type**: Aplicação web desktop local-first com runtime client-side.

**Performance Goals**: Exportação e restauração de Conta representativa em até
3 minutos por fluxo; captura consistente e uma única substituição transacional.

**Constraints**: Uma Conta/profissional e uma aba ativa; sem backup automático,
rede, nuvem, sincronização, senha, criptografia, mesclagem, conversor universal,
execução de arquivo ou migração de schema. Drafts editáveis bloqueiam restore.

**Scale/Scope**: Centenas de pacientes e milhares de refeições/itens; todas as
17 tabelas canônicas, incluindo arquivados e snapshots.

## Constitution Check

*GATE: Must pass before design and re-check after design.*

| Principle | Status | Aplicação mínima |
| --- | --- | --- |
| Atomic Design Architecture | PASS | Reutilizar moléculas existentes; o adapter em `src/app` compõe o Dialog primitivo sem acoplar regras nas camadas `ui`/`atoms`. |
| Canonical Design System | PASS | Reutilizar tokens, estados, ícones e componentes existentes; nenhuma nova regra visual local. |
| Desktop Scope and Accessibility | PASS | Desktop ≥1024px, teclado, foco, semântica, estados e WCAG 2.2 AA permanecem nos contratos da UI. |
| Test-First Quality and Isolation | PASS | Testes de contrato, validação, rollback, fronteira e browser precedem as implementações correspondentes. |
| Spec-Driven Execution | PASS | Este documento termina no planejamento; código só será alterado via `/speckit-implement`. |

## Project Structure

```text
specs/12-09-26-backup-manual-simples/
├── spec.md
├── checklists/requirements.md
├── checklists/backup-quality.md
├── research.md
├── plan.md
├── data-model.md
├── contracts/backup-file.contract.md
├── contracts/backup-ui.contract.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/lib/application/backup-application.ts
src/lib/persistence/backup-repository.ts
src/lib/infrastructure/local-db/backup-repository.ts
src/lib/infrastructure/local-db/logical-export-schema.ts
src/lib/infrastructure/diet-drafts/indexed-db-diet-draft-store.ts
src/lib/application/browser-composition.ts
src/app/navigation/SidebarNavigationAdapter.tsx
src/components/molecules/SidebarQuickActions.tsx
src/components/molecules/SidebarUserProfile.tsx
src/components/organisms/SidebarNav.tsx
src/components/ui/dialog.tsx                 # reutilizado, sem alteração de domínio

tests/lib/backup.test.ts
tests/application/backup-application.test.ts
tests/infrastructure/backup-repository.integration.test.ts
tests/infrastructure/backup-drafts.integration.test.ts
tests/architecture/backup-persistence-boundary.test.ts
tests/components/molecules/sidebar-quick-actions.test.tsx
tests/components/molecules/sidebar-user-profile.test.tsx
tests/components/organisms/sidebar-nav.test.tsx
tests/browser/backup-persistence.spec.ts
```

**Structure Decision**: Manter o projeto único. Quatro pontos de código bastam:
contrato/port, caso de uso, adapter transacional e adapter de interface. O
schema existente é a fonte dos campos; não criar `backup-schema.ts`,
`backup-validation.ts`, `backup-errors.ts`, `backup-export.ts`, `backup-restore.ts`,
`BackupActionsAdapter.tsx`, `BackupRestoreDialog.tsx` ou rota nova.

## Design and data flow

### Export

1. `SidebarNavigationAdapter` fornece callback à barra lateral.
2. `backup-application.ts` exige a Conta ativa e pede ao port uma visão
   consistente das 17 tabelas.
3. O adapter local lê as linhas numa transação; o caso de uso monta o envelope,
   serializa JSON UTF-8 e inicia o download `.nutridiet`.
4. Falhas não alteram a base e não exibem sucesso falso.

### Restore

1. O adapter lê o `File` como texto e entrega o conteúdo ao caso de uso; nada é
   executado como SQL ou código.
2. O caso de uso valida envelope, versões, chaves, identidade `local-account`,
   IDs, relações, escopos e uma dieta `ACTIVE` por paciente.
3. Consulta o draft store por Conta; qualquer draft editável bloqueia a ação.
4. O Dialog existente mostra substituição total, ausência de mesclagem e limites
   de privacidade; a escrita só começa após confirmação.
5. O adapter local apaga linhas da Conta em ordem reversa de FK e reinsere o
   snapshot em ordem de dependência, tudo na mesma transação.
6. Após commit, o runtime compartilhado é invalidado e a página/contexto é
   recarregado antes de liberar edição. Falha preserva a base anterior.

### Compatibilidade com o código atual

- Ampliar `logical-export-schema.ts`, hoje diet-only, para ser o único contrato
  lógico do arquivo; remover a semântica concorrente `.diet`.
- Reutilizar `SidebarQuickActions`, `SidebarUserProfile`, `SidebarNav` e
  `SidebarNavigationAdapter`; somente labels, callbacks e estados necessários
  mudam para `Exportar backup`/`Restaurar backup`.
- Adicionar `listRecoverableByAccount` ao `DietDraftStore`; não criar registry
  global porque editor aberto já possui draft persistido.
- Compor `backupApplication` em `getBrowserPatientRuntime`; não criar um segundo
  runtime ou uma nova migração de banco.

## Validation strategy

1. Testes unitários validam envelope, tipos, identidade, versões, chaves,
   relações e ausência de drafts.
2. Testes de integração validam as 17 tabelas, arrays vazios, arquivados,
   snapshots, substituição e rollback.
3. Testes de aplicação validam exportação, restore, confirmação, bloqueio de
   drafts, erros e reload.
4. Testes de arquitetura e UI validam fronteiras, semântica `.nutridiet`,
   ausência de `.diet` concorrente e acessibilidade.
5. Playwright valida exportar, restaurar, invalidar arquivo, bloquear draft,
   recarregar e operar offline, medindo cada fluxo em até 3 minutos.
6. `quickstart.md`, type-check, lint, Vitest, browser, links, auditorias e
   build fecham o portão da fase.

## Complexity Tracking

Nenhuma violação constitucional. A simplificação remove módulos, componentes,
rota e coordenação especulativos sem remover qualquer requisito funcional.
