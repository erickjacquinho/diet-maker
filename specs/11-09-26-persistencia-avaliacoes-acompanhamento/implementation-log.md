# Implementation Log — Persistência de avaliações e acompanhamento

**Data:** 2026-09-11  
**Branch:** `backend-refactor`  
**Checkpoint anterior à implementação:** `5f97933` (`chore(clinical): checkpoint before implementing persistence`)

## Método

- O fluxo foi executado conforme `sdd-implement`, com testes observáveis antes das implementações correspondentes.
- O hook executável `speckit-implement` não está disponível como comando de shell neste ambiente; seu conteúdo foi lido e seguido diretamente, com este log como evidência.
- O escopo permaneceu na Conta ativa + paciente, sem `ConsultationRecord`, migração/fallback do legado, rede, autenticação, backup ou sincronização.

## Evidências por tarefa

| Tarefa | Evidência principal | Resultado |
|---|---|---|
| T001–T003 | Fixtures/helpers clínicos e `tests/lib/clinical.test.ts` | domínio, datas civis, pares, autofill e US Navy verdes |
| T004–T005 | `clinical-migration.integration.test.ts`, schema e migration `0003_clinical_persistence` | v3→v4, journal, FKs, checks, índices, idempotência e preservação verdes |
| T006–T007 | `clinical-repository.integration.test.ts` e repositório PGlite | CRUD, escopo, versões, cardinalidade e rollback verdes |
| T008–T009 | `clinical-application.test.ts`, composição e profile reader | fachada existente, erros tipados, input autoritativo e batch verdes |
| T010–T013 | testes do workspace, adapter, modal e `patient-clinical-profile` | loading, dirty state, Ctrl+S, duplo envio, erro recuperável, edição e arquivamento verdes |
| T014–T015 | `next-event-modal.test.tsx`, `patient-follow-up.test.tsx` e adapter | criar/substituir/remover, confirmação, versão, conflito e erro recuperável verdes |
| T016–T017 | projeções, consulta e testes de navegação | latest/previous, atividade, dieta confirmada, consulta somente leitura e batch verdes |
| T018–T019 | `patient-persistence-boundary.test.ts` e busca de consumidores | fluxos canônicos sem stores/chaves clínicas legadas |
| T020 | testes de acessibilidade/estado existentes + novos testes de erro/saving | estados e contratos WCAG relacionados verdes |
| T021 | `clinical-profile.perf.test.ts` | 300 pacientes × 20 avaliações; p95 observado abaixo de 1 s |
| T022 | `clinical-persistence.spec.ts` + smoke Chromium serial | jornada browser inicial e fronteira offline/legado verificadas; cobertura complementar foi levada à convergência T024 |
| T023 | `validation-report.md` e gates do quickstart | validação completa registrada; limitações ambientais e regressões pré-existentes isoladas |
| T024 | `clinical-persistence.spec.ts`, `--list`, type-check/lint e suítes determinísticas | edição isolada, consulta, acompanhamento, arquivamento, isolamento, estados de lista, reload, offline e legado cobertos; conflito continua comprovado na mesma porta canônica pelas suítes de aplicação/repositório |

## Correções encontradas durante o ciclo TDD

1. O PGlite não aceitou o primeiro fixture de migration com múltiplas queries no helper; as asserções foram separadas em consultas determinísticas.
2. O fixture de paciente arquivado usava inicialmente um `patientId` diferente do paciente semeado; foi corrigido para validar o bloqueio real.
3. As expectativas de schema de testes das etapas anteriores foram atualizadas de v3 para v4, preservando os testes de rollback/idempotência.
4. Um teste de aplicação usava alias não mapeado para fixtures; foi trocado por import relativo.
5. O runner Vitest apresentou instabilidade de workers no Windows; as validações de feature foram repetidas com `--maxWorkers=1`.
6. O TypeScript acusou parâmetro implícito no stub batch de performance; o tipo explícito foi adicionado.
7. O formulário e o workspace ganharam locks síncronos via `ref`, evitando dois writes quando dois submits chegam antes do próximo render.

## Decisões preservadas

- `PatientApplication` continua sendo a fachada; não foram criados `ClinicalApplication` ou `ClinicalProjectionReader`.
- Os resultados calculados são sempre reconstruídos a partir dos dados do paciente e das medidas atuais; o formulário não é autoridade para BF, massa gorda ou massa magra.
- A consulta é uma projeção de avaliações e dietas confirmadas por data, com notas/suplementos explicitamente não persistidos.
- Perfil e lista derivam projeções em leitura; nenhuma tabela de projeção ou atividade paralela foi adicionada.

## Convergência

### Iteração 1 — achado e correção

- **Achado F1:** T022 tinha apenas o smoke de criação/reload/offline; o restante da jornada Chromium estava ausente (`partial`, HIGH, T022 / SC-001, SC-003–SC-004, SC-006, SC-008–SC-009).
- **Correção:** tarefa append-only T024 foi adicionada e implementada em `tests/browser/clinical-persistence.spec.ts`, mantendo uma única página e exercitando as operações clínicas e projeções faltantes. O conflito otimista permanece na suíte determinística, pois a regra de uma aba impede duas runtimes concorrentes no browser.
- **Verificação:** `npx playwright test tests/browser/clinical-persistence.spec.ts --list`, `npm run type-check` e `npm run lint` passaram; a execução oficial ficou bloqueada pelo `next dev`/fetch de fonte remota, conforme `validation-report.md`.

### Iteração 2 — passada final

- Todas as 24 tarefas estão marcadas `[X]`; a análise Spec Kit pós-T024 não encontrou requisito sem cobertura, conflito crítico ou violação constitucional.
- Os consumidores canônicos não acessam stores/chaves clínicas legadas; a migration, o repositório, a fachada `PatientApplication`, as projeções e os fluxos UI permanecem cobertos pelos testes direcionados.
- A auditoria final `speckit-converge` terminou com zero achados corrigíveis e deixou `tasks.md` sem nova alteração.

## Fechamento final — 2026-09-12

- O bloqueio ambiental de fonte remota foi eliminado substituindo `next/font/google` por `@fontsource/plus-jakarta-sans`, mantendo exclusivamente os pesos 400–700 previstos no Design System.
- Os links quebrados para SDDs arquivados e fundamentos do índice legado foram corrigidos; `verify:links` passou com 476 links e zero falhas.
- A rastreabilidade da etapa de biblioteca passou usando o fallback explícito para `specs/completed/`.
- O cenário browser convergente passou após tornar os seletores de consulta e acompanhamento semânticos e não ambíguos.
- `npm test` passou serialmente por padrão: 214 arquivos / 745 testes; o catálogo de componentes passou adicionalmente com 1 arquivo / 28 testes e foi reincluído no gate padrão.
- Os quatro specs browser passaram isoladamente: 7/7 testes. Build, type-check, lint, auditorias de Atomic Design/z-index/tabela/Design System e `speckit-converge` permaneceram verdes.
