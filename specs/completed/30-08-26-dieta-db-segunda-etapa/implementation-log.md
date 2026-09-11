# Implementation log: Conta e pacientes

## Execução

- Início: 2026-08-30
- Feature: `specs/30-08-26-dieta-db-segunda-etapa`
- Checkpoint: `1fa254a` — `chore(sdd): checkpoint before implementing patient stage`
- Estado inicial: PoC da etapa 1 e artefatos SDD preservados; apenas o diretório
  vinculado `.agents/skills_link/ui-ux-pro-max` permanece com conteúdo não
  rastreado dentro do repositório aninhado e não foi alterado.

## Preflight

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`: PASS; `spec.md`,
  `plan.md`, `tasks.md`, contratos, modelo, pesquisa e quickstart encontrados.
- Checklists: PASS; `requirements.md` 16/16 e `patients-quality.md` 39/39.
- Tarefas: 46 pendentes, IDs sequenciais T001–T046, cada uma com exatamente uma
  atribuição `[skill: ...]`.
- Análise de entrada: PASS; nenhum conflito crítico, requisito sem cobertura ou
  tarefa sem verificação identificado.

### Falha de setup — dependências do adaptador

- Hipótese: a instalação normal das versões aprovadas seria bloqueada pelo
  conflito preexistente entre `eslint@8.57.1` e `eslint-config-next@16.3.0`.
- Comando: `npm install --save-exact @electric-sql/pglite@0.5.8 drizzle-orm@0.45.2`.
- Resultado: FAIL antes de alterar `package.json` ou `package-lock.json`, com
  `ERESOLVE` no peer `eslint >=9`.
- Correção prevista: repetir a instalação com `--legacy-peer-deps`, preservando
  as versões do adaptador e registrando a limitação para revisão.

## Convenção de evidência

Cada tarefa será marcada como concluída somente depois do teste ou comando
específico passar; falhas e correções serão registradas abaixo com hipótese,
comando e resultado.

## T001–T003 — Setup

- Verificação: os quatro pontos de exportação, a fixture sintética, o reset
  controlado e o contexto reutilizável existem nos caminhos previstos.
- Comando: `Test-Path` para os sete arquivos e `git diff --check`.
- Resultado: PASS; os arquivos de setup não acessam `localStorage` nem dados
  legados.

## T004–T011 — Foundation

- T004: `npm test -- tests/lib/patients/domain-invariants.test.ts` — PASS, 4
  testes de normalização, validação, iniciais, estado arquivado e versão.
- T005: `npm test -- tests/lib/patients/patient-application.contract.test.ts` —
  PASS, 3 testes de escopo de Conta, falha tipada e ausência de sucesso falso.
- T006: o teste de fronteira arquitetural foi criado e reproduz o baseline
  vermelho esperado enquanto as telas ainda importam o store legado; a correção
  fica nas tarefas de migração das histórias e no corte T041.
- T007–T011: domínio, portas, migrations idempotentes, cliente PGlite,
  repositórios Account/Objective/Patient, leitor de perfil e composition root
  implementados.
- Verificação: `npm test -- tests/lib/patients/local-db.integration.test.ts` —
  PASS, 2 testes de migration, Conta, objetivos, criação, atualização,
  versionamento, arquivamento, restauração e listagem ativa.
- Verificação adicional: `npm run type-check` — PASS.

### Falha corrigida no ciclo Foundation

- Hipótese inicial: perfil arquivado deveria ser tratado como não encontrado.
- Evidência: o contrato de restauração exige leitura autorizada do paciente
  arquivado; o teste falhou porque o leitor retornou corretamente o perfil
  arquivado.
- Correção: o teste passou a exigir `archivedAt` no perfil arquivado, mantendo
  a remoção somente da listagem ativa.
- Reexecução: `npm test -- tests/lib/patients/local-db.integration.test.ts` —
  PASS.

## T016–T023 — US1 + US2

- T016: os testes de contexto de Conta e offline passaram com 3 testes; a
  evidência foi consolidada em `validation-report.md`.
- T017: o teste de integração cobre normalização, validação numérica, consulta,
  busca e isolamento cross-account — 3 testes, PASS.
- T018: os testes de rota cobrem lista, loading, empty, filtered empty, retry,
  não encontrado e navegação — 12 testes, PASS.
- T019: `createPatient`, `listActivePatients` e `getPatientProfile` passam pela
  composição local com IDs, escopo, validação e resultados tipados.
- T020: `patientListView` recebe histórico relacionado como entrada de leitura,
  sem consultar arrays embutidos do paciente ou usar `lastConsultation` como
  fonte canônica.
- T021–T023: lista e perfil usam o composition root do navegador, exibem
  loading/erro/retry e estado não encontrado, e mantêm as seções clínicas sem
  consultar o storage legado. `npm run type-check` e a fronteira arquitetural
  passaram.
- O helper do skill de browser foi validado por `--help`; o caminho alternativo
  e a limitação de não iniciar servidor estão detalhados no relatório.

## T024–T029 — US3

- `npm test -- tests/lib/patients/update-patient.integration.test.ts` — PASS,
  3 testes de atualização versionada, conflito, validação, arquivamento e
  preservação das contagens relacionadas.
- `npm test -- tests/components/molecules/edit-patient-modal.test.tsx` — PASS,
  7 testes de selects, atalho, dirty state, descarte, erro recuperável e
  `aria-describedby`.
- `npm test -- tests/lib/patient-profile-selectors.test.ts
  tests/lib/patient-list-view.test.ts` — PASS, 22 testes; as projeções
  permanecem puras e os registros relacionados não são regravados.
- `npm run type-check` — PASS.

## T035–T039 — US5

- `npm test -- tests/lib/patients/archive-restore.integration.test.ts` — PASS,
  3 testes de arquivamento lógico, preservação de relações, conflito, falha,
  bloqueio de edição de arquivado e restauração sem duplicidade.
- `npm test -- tests/app/pacientes/archive-patient.test.tsx
  tests/app/pacientes/patient-profile-accessibility.test.tsx` — PASS, 7 testes
  de copy, confirmação prolongada, cancelamento, acessibilidade e remoção de
  ações de paciente arquivado.
- O perfil agora oculta edição, arquivamento, acompanhamento e novas rotas
  clínicas para arquivados; o histórico de leitura continua renderizável e o
  modal operacional chama `archivePatient` somente após retenção.
- `npm run type-check` — PASS.

## T030–T034 — US4

- `npm test -- tests/lib/patients/objective-catalog.integration.test.ts` —
  PASS, 3 testes de normalização, idempotência, arquivamento, preservação do
  valor salvo e validação de entrada.
- `npm test -- tests/components/molecules/add-objective-modal.test.tsx` — PASS,
  3 testes de foco, campo vazio, cancelamento, envio, loading e erro sem fechar
  prematuramente.
- O composition root expõe `archiveObjectiveOption` além de
  `addObjectiveOption`; a opção é aplicada ao rascunho do modal de edição e só
  o salvamento explícito do paciente persiste o novo valor.
- `npm run type-check` — PASS.

## T040 — Projeções ativas

- `npm test -- tests/lib/patient-list-view.test.ts
  tests/lib/patient-profile-selectors.test.ts
  tests/app/pacientes/patient-profile-accessibility.test.tsx` — PASS, 24
  testes.
- `filterPatients` e `buildPatientListGroups` excluem pacientes arquivados;
  o perfil arquivado também não oferece ações de edição, arquivamento,
  acompanhamento ou novos registros clínicos.

## T041–T044 — Corte legado e contrato visual

- T041: o caminho de compatibilidade `src/lib/patientsStore.ts` foi reduzido a
  uma fachada deprecated; a implementação legada foi isolada em
  `src/lib/legacyClinicalStore.ts` para consumidores clínicos de etapas futuras.
  O hook de perfil e a composição do fluxo novo não importam essa fachada nem
  `src/lib/storage.ts`. A persistência de próximo acompanhamento também foi
  removida do domínio, schema e repositório, pois está explicitamente fora do
  escopo desta etapa.
- T042: `design-system/components/profiles/molecules/delete-patient-modal.md`
  agora descreve arquivamento lógico, preservação de relações, retenção de
  1,5s, estados pendentes/erro e o callback `onConfirmArchive`; o registro no
  catálogo permaneceu consistente e nenhum primitive foi alterado.
- T043: `npm test -- tests/lib/patients/legacy-cutover.test.ts
  tests/architecture/patient-persistence-boundary.test.ts` — PASS. Os testes
  verificam imports de storage, chaves `nutridiet_*`, objetivo legado,
  sessionStorage e colunas de próximo acompanhamento no modelo canônico.
- T044: `npm test -- tests/design-system/patient-flow-contract.test.ts` — PASS,
  3 testes. O contrato verifica perfil/registry, tokens, ausência de hex e
  estados acessíveis de formulário e arquivamento.
- O botão de confirmação prolongada agora aguarda callbacks assíncronos,
  desabilita concorrência e permite nova tentativa após falha recuperável.

## T045–T046 — Gates finais e rastreabilidade

- T045: `npm test` passou com 152 arquivos e 625 testes em 390,65 s;
  `type-check`, lint, links locais e auditoria Atomic Design passaram. A
  medição sintética de 500 pacientes registrou 2,78 ms para filtragem e
  agrupamento. `verify:design-system` continua limitado por achados globais
  preexistentes do catálogo, sem ocorrência no modal de paciente alterado.
- T046: a revisão cruzada de `spec.md`, `plan.md`, `tasks.md`, constituição,
  design system, código e testes foi registrada no `validation-report.md`; os
  FR-001–FR-019, NFR-001–NFR-007 e SC-001–SC-008 possuem rastreabilidade ou
  foram marcados explicitamente como escopo futuro.
