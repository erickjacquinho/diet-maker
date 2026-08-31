# Baseline de implementação

**Capturada em**: 2026-08-30
**Checkpoint anterior**: `1c5b9d8ef1ceada89f669c3bd7c53ef676531fcc`
**Branch**: `backend-refactor`
**Escopo**: adequação dos componentes listados em `spec.md`.

Este retrato inclui alterações concorrentes que já estavam no workspace antes
da implementação. Elas não foram revertidas nem atribuídas a esta feature.
O arquivo [evidence/baseline/commands.md](./evidence/baseline/commands.md)
contém os comandos e resultados resumidos; os hashes protegidos estão em
[evidence/baseline/protected-hashes.txt](./evidence/baseline/protected-hashes.txt).

## Gates iniciais

| Comando | Resultado observado |
| --- | --- |
| `npm run type-check` | PASS |
| `npm run lint` | PASS |
| `npm run verify:design-system` | PASS: 40 fontes cobertas, 0 exports sem cobertura, 0 findings bloqueantes |
| `npm run verify:table` | 0 erros, 5 avisos TABLE016 de ownership já delimitados |
| `npm run audit:atomic-design` | PASS: 148/148, 0 violações |
| `npm run audit:z-index -- --strict` | PASS: 0 findings |
| `npm run verify:design-system-legacy -- --strict` | 2 findings LEG011 preexistentes em `ReadOnlyDietModal` e `DietBuilderTemplate` |
| `npm run verify:links` | PASS: 458 links locais |
| `npm run build` | PASS: build Next.js concluído |
| `npm test` | FAIL baseline: falhas em `tests/lib/patients/legacy-cutover.test.ts`, `tests/app/pacientes/page-context-navigation.test.tsx`, `tests/design-system/legacy-audit.test.ts` e `tests/hooks/useDietMealActions.test.ts`; também houve erro jsdom de navegação e a execução foi encerrada após permanecer sem progresso |

O auditor de componentes já estava verde pela implementação concorrente, mas os
cinco avisos tabulares e os findings legados continuam sendo evidência real.
Nenhum é considerado resolvido nesta feature sem teste e diff correspondente.

## Fontes normativas

Os hashes SHA-256 da baseline cobrem fundamentos, tokens, governança, categorias,
regras, primitivos e auditores. Alteração nesses arquivos bloqueia a tarefa
correspondente e exige coordenação humana; não é permitida para fazer um gate
passar.

