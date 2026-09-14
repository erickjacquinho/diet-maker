# Validation report: Conta e pacientes

## Escopo validado nesta passagem

Reabertura da Conta local, isolamento do contexto, comportamento offline do
adaptador aprovado e jornada inicial de pacientes. As relações clínicas
(dietas, avaliações e drafts) continuam fora desta etapa e não são lidas nem
gravadas pelo novo fluxo.

## Evidências observáveis

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Identidade estável, Conta ausente e falha fechada | `npm test -- tests/lib/patients/account-context.integration.test.ts` | PASS — 2 testes |
| Preparação de recursos e ausência de rede no teste de UI | `npm test -- tests/app/pacientes/account-offline.test.tsx` | PASS — 1 teste |
| Criação, normalização, filtro, perfil ausente e isolamento cross-account | `npm test -- tests/lib/patients/create-list.integration.test.ts` | PASS — 3 testes |
| Lista, loading, empty, filtered empty, retry e perfil não encontrado | `npm test -- tests/app/pacientes/page.test.tsx tests/app/pacientes/patient-profile-read.test.tsx` | PASS — 12 testes |
| Fronteira sem storage físico nas rotas/componentes da etapa | `npm test -- tests/architecture/patient-persistence-boundary.test.ts` | PASS — 2 testes |
| Compilação estática | `npm run type-check` | PASS |

## Limitações e recuperação

- O teste de UI não usa `localStorage` como fixture. O hook de rota é isolado
  com uma aplicação fake para que loading, erro e busca não dependam de APIs do
  navegador.
- A validação final iniciou o servidor Next.js local e inspecionou `/pacientes`
  no navegador interno. Foram verificados estado vazio, foco inicial do modal,
  backdrop, hierarquia visual, fechamento por ação canônica e ausência de erros
  no console. Nenhum paciente fictício foi persistido durante a inspeção.
- A instalação das versões aprovadas do PGlite/Drizzle precisou de
  `--legacy-peer-deps` por um conflito preexistente de ESLint; a limitação está
  registrada no `implementation-log.md`.

## T045 — Gates, quickstart e desempenho

### Gates automatizados

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| TypeScript | PASS | `npm run type-check` |
| ESLint | PASS | `npm run lint`; `poc/local-db-proof/dist/**` foi excluído por ser bundle gerado, sem alterar o código fonte |
| Build de produção | PASS | `npm run build` — compilação, tipos, geração estática e traces concluídos |
| Suíte completa | PASS | `npm test` — 149 arquivos e 605 testes, 248,57 s |
| Links locais | PASS | `npm run verify:links` — 243 Markdown, 457 links locais, zero quebrados |
| Atomic Design | PASS | `npm run audit:atomic-design` — 146/146 conformes, 0 violações |
| Tabelas canônicas | PASS COM AVISOS | `npm run verify:table` — 12/12 alvos sem erros; 5 avisos de filhos internos não catalogados |
| Design System legado | PASS | `npm run verify:design-system-legacy` — 0 achados em 228 arquivos |
| Z-index | PASS | `npm run audit:z-index` — 0 achados em 403 arquivos |
| Contratos direcionados | PASS | legacy cutover, fronteira de persistência, contrato visual, arquivamento e acessibilidade |
| Design System global | BLOQUEADO PELO CATÁLOGO CONGELADO | `npm run verify:design-system` — 12 achados: 8 fontes sem registro, baseline 65×76 e 3 achados em perfis do próprio design system |
| Integridade do Design System | PASS | hashes SHA-256 antes/depois: 113/113 arquivos em `design-system/**` e 5/5 em `src/design-system/**`, sem adição, remoção ou alteração |
| Navegador local | PASS | `/pacientes`: estado vazio e modal canônico validados visual e semanticamente; console sem erros |

Os comandos direcionados do `quickstart.md` foram cobertos pela suíte completa,
pelas execuções específicas de Conta/offline, lista/perfil, edição, objetivos,
arquivamento, fronteira legada e contratos visuais, e por uma passagem no
navegador com o servidor Next.js local.

O gate estrito do catálogo não pode ficar verde sem editar o design system:
`macro-proportion-bar.md` possui seções obrigatórias ausentes e valor visual
local; `icon-button.md` possui valor visual local; `registry.json` mantém
baseline 65 para 76 fontes; e oito fontes de componentes ainda não possuem
entrada. Ocultar fontes, relaxar o verificador ou apagar componentes usados não
foi considerado correção válida. O código foi adequado até os gates executáveis
de lint, Atomic Design, tokens legados, z-index e tabelas ficarem sem erros.

### Medição da fixture

`tests/lib/patients/patient-flow-performance.test.ts` gera 500 pacientes
sintéticos e mede filtragem mais agrupamento da lista. A execução registrou
2,78 ms (ordem de 3 ms), abaixo do limite de 1 segundo; o teste direcionado
passou após a correção da consulta da fixture.

### Resultado de segurança da fronteira

A auditoria delimitada a chaves legadas, fallback de leitura/gravação e imports
das superfícies da etapa passou sem caminho explorável identificado. O fluxo
canônico não acessa `localStorage`, `sessionStorage`, IndexedDB, SQL ou a
fachada legada; os consumidores clínicos antigos permanecem isolados para
etapas posteriores.

## T046 — Revisão final de rastreabilidade

### Método e resultado

Foi feita leitura cruzada de `spec.md`, `plan.md`, `tasks.md`, constituição do
projeto, contratos do design system e código/testes entregues. As cinco
diretrizes constitucionais aplicáveis permanecem atendidas: fonte local única,
fronteira de Conta, persistência por portas, UI sem detalhes de provedor e
validação determinística. O verificador global do design system continua com
achados anteriores e não foi tratado como falha introduzida por esta feature.

### Matriz FR/NFR → testes → arquivos

| Requisito | Testes/evidência | Arquivos principais | Status |
| --- | --- | --- | --- |
| FR-001 | `account-context.integration`, `account-offline` | `application/account-context.ts`, `application/account/get-active-account.ts`, `infrastructure/local-db/account-repository.ts` | implementado/conforme |
| FR-002 | `local-db.integration`, `domain-invariants` | `domain/patient.ts`, `persistence/patient-repository.ts`, `infrastructure/local-db/schema.ts` | implementado/conforme |
| FR-003 | `create-list.integration`, `page.test` | `application/patients/create-patient.ts`, `app/pacientes/page.tsx`, `CreatePatientModal.tsx` | implementado/conforme |
| FR-004 | `page.test`, `patient-profile-read`, `patient-list-view` | `list-active-patients.ts`, `usePatientsPage.ts`, `usePatientProfilePage.ts` | implementado/conforme |
| FR-005 | `patient-list-view`, `patient-flow-performance` | `patientListView.ts`, `usePatientsPage.ts` | implementado/conforme |
| FR-006 | `edit-patient-modal`, `page.test` | `EditPatientModal.tsx`, `CreatePatientModal.tsx`, `usePatientsPage.ts` | implementado/conforme |
| FR-007 | `update-patient.integration`, `edit-patient-modal` | `update-patient.ts`, `patient-repository.ts`, `EditPatientModal.tsx` | implementado/conforme |
| FR-008–FR-009 | `objective-catalog.integration`, `add-objective-modal` | `objective-option.ts`, `add-objective-option.ts`, `archive-objective-option.ts`, `AddObjectiveModal.tsx` | implementado/conforme |
| FR-010, FR-011 e FR-012 | `archive-restore.integration`, `archive-patient`, `patient-profile-accessibility` | `archive-patient.ts`, `restore-patient.ts`, `DeletePatientModal.tsx`, `PatientProfilePage.tsx` | implementado/conforme; tela administrativa futura |
| FR-013 | `local-db.integration`, `patient-application.contract` | `account-context.ts`, repositories locais, `composition-root.ts` | implementado/conforme |
| FR-014–FR-015 | `patient-profile-selectors`, `legacy-cutover`, `patient-persistence-boundary` | `domain/patient.ts`, `patientRelatedRecords.ts`, `patientViewModel.ts` | implementado/conforme; entidades clínicas continuam futuras |
| FR-016 | integrações de criação/edição/objetivos/arquivamento | `patient-errors.ts`, casos de uso e repositórios locais | implementado/conforme |
| FR-017–FR-018 | `patient-persistence-boundary`, `legacy-cutover` | `app/pacientes/**`, `browser-composition.ts`, `patientsStore.ts`, `legacyClinicalStore.ts` | implementado/conforme |
| FR-019 | suíte completa + testes determinísticos direcionados | `tests/lib/patients/**`, `tests/app/pacientes/**` | implementado/conforme |
| NFR-001 | `patient-flow-contract`, `legacy-audit`, `z-index-contract`, validação local no navegador | `design-system/**`, superfícies de pacientes e modais | implementado/conforme; certificação visual executada em `/pacientes` |
| NFR-002–NFR-003 | `patient-profile-accessibility`, `archive-patient`, `edit-patient-modal`, `patient-flow-contract` | modais, `Button.tsx`, perfil/lista | implementado/conforme por testes de contrato |
| NFR-004 | fixtures versionadas e testes locais | `tests/fixtures/patients/**`, `tests/lib/patients/test-context.ts` | implementado/conforme |
| NFR-005 | `patient-flow-performance` | `patient-flow-performance.test.ts`, `patientListView.ts` | implementado/conforme — ~3 ms/500 pacientes |
| NFR-006 | integrações locais de versão, objetivos e arquivamento | `local-db/**`, casos de uso de pacientes/objetivos | implementado/conforme |
| NFR-007 | `patient-application.contract`, `patient-persistence-boundary` | `persistence/**`, `composition-root.ts`, `browser-composition.ts` | implementado/conforme |

### Matriz dos critérios de sucesso

| Critério | Evidência | Status |
| --- | --- | --- |
| SC-001 | `create-list`, `update-patient`, `archive-restore` | conforme |
| SC-002 | `page.test`, `patient-flow-performance`, modais de criação/edição | conforme |
| SC-003 | `archive-restore`, `archive-patient`, leitores de perfil/histórico | conforme |
| SC-004 | isolamento Conta/paciente e conflito de versão nas integrações | conforme |
| SC-005 | `objective-catalog.integration` | conforme |
| SC-006 | `legacy-cutover`, `patient-persistence-boundary` | conforme |
| SC-007 | acessibilidade de perfil/arquivamento/edição e contrato visual | conforme por cobertura automatizada |
| SC-008 | `account-offline` e suíte local sem serviço remoto | conforme |

### Itens explicitamente propostos para SDDs posteriores

Persistência e migração de dietas, avaliações, consultas, acompanhamentos,
drafts, backup, sincronização online, tela administrativa de restauração e
qualquer conversão/adaptador do storage legado não foram implementados. As
relações clínicas existentes são preservadas como fronteira de leitura/contrato;
o modelo canônico desta etapa contém apenas Conta, Patient e ObjectiveOption.
