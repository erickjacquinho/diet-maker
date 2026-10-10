# Implementation Log: Corrigir Integridade e Recuperação na Criação de Dieta

## Baseline e checkpoint

- 2026-10-03: estado inicial registrado na branch `codex/diet-pdf-export`, HEAD `59b3bcf588162d0f6d5a8b0b8f911e27e731b11e`.
- Checkpoint antes do preflight e das alterações: `3896134af0bd89c2078327fc37f584dcbac93867` — `chore(diets): checkpoint before repairing creation flow`.
- O checkpoint preservou 78 arquivos já modificados ou novos. A varredura de nomes e conteúdo não encontrou padrões de credenciais; arquivos ignorados seguiram a política existente.
- Preflight inicial: 15 FR, 9 SC e 23 cenários de aceitação rastreáveis; 25 tarefas com exatamente uma atribuição de skill; checklists `diet-flow.md` (25/25) e `requirements.md` (16/16) completos.
- Análise inicial apontou duas referências mecânicas obsoletas: a estrutura do plano dizia que `tasks.md` seria criado futuramente, e uma nota do checklist ainda indicava ambiguidade pendente. Ambas foram atualizadas sem mudar requisitos, arquitetura ou escopo.
- Reanálise após as correções: `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` retornou a feature correta; cobertura confirmada em 15 FR, 9 SC e 23 cenários de aceitação, com 25 tarefas (US1=8, US2=7, US3=5, US4=3), seis decisões de pesquisa e cinco princípios constitucionais. Não restou conflito crítico, tarefa sem atribuição de skill, requisito sem tarefa ou tarefa sem história/verificação.
- Verificação de setup: `eslint.config.mjs` já ignora `node_modules`, `.next`, `out`, `build`, `dist` e `coverage`; não há `Dockerfile` e `package.json` é privado. `.gitignore` passou a cobrir `.env*`, preservando a exceção `.env.example`; `git check-ignore` confirmou `.env`, `.env.local`, `.env.development` e `.env.production` ignorados.

## T001 — Revisar diffs preexistentes

- Revisados os diffs no checkpoint com `git show --format= --unified=4 3896134 -- <arquivo>` para os cinco caminhos definidos na tarefa.
- `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`: contém fluxos preexistentes de criação de refeições/dietas prontas e prévia da página publicada; também removeu o modal de escala.
- `src/hooks/useDietBuilderPage.ts`: contém cópia das refeições simples para a primeira variação de ciclo com IDs novos e descarte de rascunho com tratamento de revisão superada.
- `src/hooks/useDietBuilderModals.ts`: remove estado/ação do modal de escala e reutiliza `buildDietWhatsAppText`.
- `src/lib/application/diets/legacy-diet-adapter.ts`: inclui fallback de energia 4–4–9 quando a energia do snapshot não existe.
- `src/components/templates/DietBuilderTemplate.tsx`: inclui ações de dieta pronta/página e reforça o diálogo de descarte durante salvamento.
- Resultado: essas mudanças são anteriores a esta execução e serão preservadas. As tarefas US3 que tocam rota, hook ou template serão integradas por patches contextuais, sem substituir esses fluxos.
- Evidência: os cinco diffs foram inspecionados após o checkpoint; nenhuma alteração foi feita nos arquivos de implementação nesta tarefa.

## T002 — Round-trip do snapshot após alteração de quantidade

- Incluído caso de integração que grava e reabre uma dieta com quantidade prescrita de 50 g, escalada dos nutrientes de referência congelados de 100 g.
- Verificações: origem e nutrientes de referência permanecem iguais; quantidade e nutrientes prescritos reabertos correspondem a 50 g.
- Comando: `npm run test -- tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts` — passou (3 testes).
- Ampliado para verificar a preservação do peso pelas conversões legacy/canonical; a nova asserção falhou antes da implementação porque `fromEditableDocument` retornou `undefined` para `weightReferenceKg`.
- Comando após ampliar a cobertura: `npm run test -- tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts` — falha esperada na asserção de peso; os outros 3 testes passaram.

## T003 — Regressões do hook de edição de itens (RED)

- Acrescentados cenários de alteração de quantidade e substituição usando snapshots customizados e versão de origem capturada.
- Resultado esperado antes da implementação: ambos falharam porque o hook atualiza quantidade/macros legados sem recalcular o snapshot; na substituição, o snapshot também conserva a origem e versão anteriores. Os outros 9 testes do arquivo passaram.
- Comando: `npm run test -- tests/hooks/useDietMealActions.test.ts` — 2 falhas de regressão esperadas, 9 aprovados.
- Asserção da substituição limitada a `preparo: 'inNatura'` para avaliar identidade/proveniência/nutrientes sem mudar a regra de rótulo existente.

## T004 — Validação de todas as origens modeladas (RED)

- Adicionados casos para snapshots completos `SYSTEM_TACO`, `ACCOUNT_CUSTOM`, `RECIPE` e `READY_MEAL`, mais rejeição de `sourceVersion` ausente.
- Resultado esperado antes da implementação: TACO e proveniência malformada continuam cobertos; os três tipos não-TACO falharam porque o validador exige `SYSTEM_TACO`.
- Comando: `npm run test -- tests/lib/diets/diet-validation.test.ts` — 3 falhas de regressão esperadas, 5 aprovados.

## T005 — Peso de referência nas métricas (RED)

- Adicionados cenários para uma dieta legada com referência de 64 kg diante de perfil atualizado para 90 kg, dieta legacy sem referência e documento canônico sem referência recuperável.
- Resultado esperado antes da implementação: o hook usa 90 kg no lugar da referência e mostra g/kg nos dois casos sem peso histórico; os três cenários falharam como regressão.
- Comando RED: `npm run test -- tests/hooks/useDietCalculations.test.ts` — 3 falhas de regressão esperadas, 3 aprovados.

## T006 — Preservar peso nas conversões legacy/canonical

- `FullDietPlan` agora aceita `weightReferenceKg?: DecimalString`; `toEditableDocument` e `fromEditableDocument` mantêm o valor opcional sem convertê-lo para número.
- T002 cobre o round-trip direto, o caminho salvo/reaberto por `fromCanonicalPlan`, além do snapshot de quantidade.
- Uma primeira execução de `npm run type-check` apontou que `scaleNutrition` representa energia como opcional no tipo, apesar da referência deste fixture conter energia. O fixture agora informa explicitamente os 64 kcal escalados esperados e usa `DietPlan` na persistência.
- Comandos após a correção: `npm run test -- tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts` — passou (4 testes); `npm run type-check` — passou.

## T007 — Manter snapshots ao alterar porção ou origem

- `DietItem` legacy agora representa seu snapshot opcional. Alteração de quantidade escala `prescribedNutrients` a partir de `referenceNutrients` congelados e mantém identidade, versão, conversões e proveniência.
- Substituição usa `createLibraryFoodSnapshot` para capturar a fonte e versão selecionadas; os valores legacy apresentados continuam com o arredondamento atual.
- As duas regressões RED de T003 passaram depois da mudança; quantidade, nutrientes de referência, valores prescritos e origem/versionamento são verificados.
- Comandos: `npm run test -- tests/hooks/useDietMealActions.test.ts` — passou (11 testes); `npm run type-check` — passou.

## T008 — Usar somente o peso associado à prescrição

- Cálculos para documentos canônicos e planos legacy agora usam `weightReferenceKg`; planos salvos sem referência deixam g/kg indisponível, sem recorrer ao peso atual do perfil.
- O estado sem plano continua usando o peso atual do paciente para a nova prescrição antes de criar/carregar o draft.
- Comandos: `npm run test -- tests/hooks/useDietCalculations.test.ts` — passou (6 testes); `npm run type-check` — passou.

## T009 — Aceitar origens válidas do snapshot

- O validador aceita todos os tipos de origem modelados e continua exigindo identidade/versionamento não vazios, quantidade positiva e nutrientes decimais não negativos.
- As três regressões RED de T004 passaram; os testes existentes para identidade, quantidades e relações entre itens continuam passando.
- Comandos: `npm run test -- tests/lib/diets/diet-validation.test.ts` — passou (8 testes); `npm run type-check` — passou.

## Análise Spec Kit após US1

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` identificou o diretório correto e os artefatos esperados.
- Recontagem: 15 FR, 9 SC, 23 cenários, 25 tarefas; 9 tarefas concluídas e todas com exatamente uma atribuição de skill.
- Rechecagem spec/plano/tarefas: as duas referências mecânicas foram corrigidas, as tarefas continuam cobrindo as quatro histórias e não há achados de consistência para corrigir.
- Resultado: preflight de consistência aprovado para iniciar US2.

## T010–T012 — Regressões de salvamento e reconciliação (RED)

- T010 acrescentou reuso do ID reservado, reconciliação de commit pelo ID e remoção condicional somente da revisão confirmada. Reuso explícito do ID passou; confirmação/revisão da limpeza falharam porque a reconciliação atual só informa o plano encontrado.
- Ajustada uma expectativa inicial de versão do fixture para `activeDietFixture.version` (2); isso corrigiu o dado do teste sem mudar o comportamento esperado.
- T011 acrescentou testes de fronteira da aplicação: falha de checkpoint após commit local, ausência de checkpoint para resultado incerto e checkpoint após reconciliação confirmada. Os três falharam no comportamento atual: exceção de arquivo escapa, resultado incerto chama o coordenador e reconciliação não checkpointa.
- T012 acrescentou testes do hook para reconciliar antes de navegar, retornar ao perfil com checkpoint pendente e oferecer ação de cleanup sem submeter novamente. Os três falharam como regressão.
- Comandos RED: `npm run test -- tests/lib/diets/save-diet-as-active.test.ts` (4 falhas/2 passaram), `npm run test -- tests/application/diets/diet-application-checkpoint.test.ts` (3 falhas) e `npm run test -- tests/hooks/useDietBuilderSaveOutcome.test.ts` (3 falhas).

## T010–T016 — Resultados de salvamento e recuperação

- T010 confirmou reuso do ID reservado em retry explícito, reconciliação por ID, cleanup apenas da revisão confirmada, preservação de revisão mais nova e estado de revisão quando a consulta do repositório falha.
- Também foi coberta a exceção de `removeIfRevision` depois do commit: agora retorna `CLEANUP_PENDING`, preservando o resultado confirmado.
- T013 introduziu outcomes locais `COMMITTED`/`CLEANUP_PENDING`, `CHECKPOINT_PENDING` com `localOutcome` preservado, revisões confirmadas e os outcomes de reconciliação `NOT_COMMITTED`/`REVIEW_REQUIRED`.
- T014 reconcilia pelo ID estável, remove somente `confirmedDraftRevision`, preserva revisões mais novas e não repete `confirmActive`.
- T015 chama o checkpoint somente para commit local ou reconciliação confirmada. Falha do sync retorna `CHECKPOINT_PENDING`; resultado incerto ou não confirmado não aciona checkpoint. Os testes também confirmam que cleanup continua pendente se ambos falharem.
- T016 reconcilia antes de apresentar retry, retorna ao perfil para commits confirmados/checkpoint pendente e expõe um botão de toast que repete somente cleanup. O retry de arquivo continua no estado de sincronização do perfil; o hook mantém o cleanup-only quando ambos estão pendentes.
- Comandos finais do grupo: `npm run test -- tests/lib/diets/save-diet-as-active.test.ts tests/application/diets/diet-application-checkpoint.test.ts tests/hooks/useDietBuilderSaveOutcome.test.ts` — passou (16 testes); `npm run type-check` — passou; `git diff --check` — passou.

## Análise Spec Kit após US2

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` continua apontando para a feature indicada.
- Cobertura mantida: 15 FR, 9 SC e 23 cenários; 25 tarefas, 16 concluídas e todas com uma atribuição de skill.
- Não há nova inconsistência spec/plano/tarefas; US3 e US4 seguem com tarefas de teste e implementação rastreáveis.
- Resultado: análise de consistência aprovada para continuar.

## T017 — Saídas dependentes de flush (RED)

- Foram adicionados cenários para Voltar com flush `SUPERSEDED` e exception, abrir a matriz de ciclo com `INVALIDATED`/`SAVED`, e preservar os guards atuais de PDF e página.
- A primeira execução revelou que o ToggleGroup usa botões nativos sem role `radio`; o teste passou a localizar o botão pelo nome acessível. Na execução corrigida, os três casos de bloqueio falharam: Voltar navegou após `SUPERSEDED`/exception e a matriz navegou após `INVALIDATED`. A exception também escapou como rejeição não tratada. Os dois gates de prévia e a navegação após `SAVED` passaram.
- Comando: `npm run test -- tests/app/pacientes/diet-editor-persistence.test.tsx` — 3 regressões esperadas, 5 aprovados.

## T018 — Confirmação e edição concorrente (RED)

- Adicionados testes para o estado inert/aria-busy da região e announcement de confirmação, atalho Ctrl+S com diálogo de metas aberto, e callbacks de quantidade/metas durante confirmação explícita.
- Resultado antes da implementação: o template não possui `inert`/status de confirmação, o atalho chama `flushDraft` enquanto o diálogo está aberto, e `confirmationBusy` ainda não existe no hook.
- Comando: `npm run test -- tests/components/templates/DietBuilderTemplate.test.tsx tests/hooks/useDietBuilderPage.test.ts` — 3 falhas de regressão, 5 aprovados.

## T019 — Bloquear saídas sem flush salvo

- A ação Voltar e a navegação para a matriz de ciclo agora avançam somente quando `flushDraft` retorna `SAVED`; erro, `SUPERSEDED`, `INVALIDATED`, null e demais status mantêm o editor aberto e apresentam retry.
- Os guards de PDF e prévia de página preexistentes permaneceram ativos.
- Comando: `npm run test -- tests/app/pacientes/diet-editor-persistence.test.tsx` — passou (8 testes).

## T018–T021 — Confirmação explícita e bloqueio de mutações

- O template recebe `confirmationBusy` independente de `saveStatus`: a região `main` fica inert/aria-busy e um live status fora da região anuncia a confirmação. O botão primário mostra “Confirmando…”. `pending` de autosave não inertiza a região.
- O shortcut de página fica desativado enquanto diálogos que editam a dieta estão abertos. Durante a confirmação, callbacks do hook principal, modais e ações de refeições consultam o mesmo guard antes de alterar estado.
- Foram revisados `structure` e o perfil `DietBuilderTemplate` do catálogo; não foram criados estilos, tokens ou componentes novos.
- Comandos: `npm run test -- tests/app/pacientes/diet-editor-persistence.test.tsx tests/components/templates/DietBuilderTemplate.test.tsx tests/hooks/useDietBuilderPage.test.ts` — passou (16 testes); `npm run type-check` — passou; `git diff --check` — passou.

## Análise Spec Kit após US3

- Pré-requisitos continuam resolvendo a feature informada. As 25 tarefas mantêm uma atribuição de skill; 21 estão concluídas.
- Requisitos, critérios e histórias continuam cobertos; não há conflito ou inconsistência nova nos artefatos.
- Resultado: análise aprovada para US4 e validação final.

## T022–T024 — Estados de abertura recuperáveis

- T022 cobre perfil de paciente ausente, paciente arquivado, dieta não encontrada e armazenamento indisponível, com retry e retorno seguro.
- `useDietPresets` conserva o erro de `openEditor`, expõe loading/ready/error e permite retry. `useDietBuilderPage` também conserva falhas ao abrir perfil ou inicializar aplicações e seleciona a recuperação compatível com a origem.
- A rota apresenta mensagem `role=alert`, retry e retorno; estados sem erro continuam no loading existente.
- Comandos: `npm run test -- tests/app/pacientes/diet-editor-load-errors.test.tsx tests/app/pacientes/diet-editor-persistence.test.tsx tests/components/templates/DietBuilderTemplate.test.tsx tests/hooks/useDietBuilderPage.test.ts` — passou (20 testes); `npm run type-check` — passou; `git diff --check` — passou.

## Análise Spec Kit após US4

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` retornou o diretório e artefatos corretos.
- 24/25 tarefas estão concluídas, cada tarefa possui uma atribuição de skill, e as histórias implementadas seguem cobertas.
- A revisão de consistência não encontrou novos conflitos ou lacunas de rastreabilidade. T025 permanece para executar a validação abrangente.

## T025 — Quickstart e validação abrangente

- `quickstart.md` agora descreve os outcomes implementados e lista os testes focados adicionados para snapshot/peso, checkpoint/reconciliação, navegação, busy state e erros de abertura.
- Reanálise após a edição: 15 FR, 9 SC, 25 tarefas (24 concluídas), uma atribuição de skill por tarefa; nenhum novo achado de consistência.
- O smoke será executado em contexto de navegador novo contra o servidor Next.js já ativo em `localhost:3000`, sem reutilizar o armazenamento do navegador do usuário.

### Evidência automatizada de T025

- Focados do quickstart — 11 arquivos, 66 testes aprovados na execução final após T026.
- `npm run type-check` — passou.
- `npm run lint` — sem erros; 1 warning Atomic Design em `CreateReadyMealsFromDietModal.tsx:151`, arquivo incluído no checkpoint anterior.
- `git diff --check` — passou.
- `npm run test -- --reporter=verbose`, executado antes da tarefa de convergência T026 — 14 arquivos falharam, 226 passaram; 24 testes falharam e 930 passaram no total. Os failures foram reproduzidos em uma cópia temporária do checkpoint `3896134` sem as alterações desta implementação (24 falhas/82 passagens nos 14 arquivos afetados). As falhas de baseline incluem versões 11/12 de migrations e 7/8 de backup, contagens/exceções do catálogo, o contrato de opacidade da PatientDietsTable e mocks de App Router nos testes de perfil. Nenhuma dessas falhas toca os arquivos desta feature.

## T026 — Round-trip das quatro origens modeladas

- A convergência identificou cobertura parcial em US1/AC6 e SC-009: o validador aceitava os quatro tipos, mas o teste de confirmação/reabertura do repositório exercitava somente TACO.
- O teste de integração agora confirma uma dieta contendo snapshots `SYSTEM_TACO`, `ACCOUNT_CUSTOM`, `RECIPE` e `READY_MEAL`, reabre o plano e compara cada snapshot completo, incluindo versão, composição, quantidade e nutrientes.
- `npm run test -- tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts` — passou (5 testes).
- Execução focada do quickstart após T026 — 11 arquivos, 66 testes aprovados.
- `npm run type-check` — passou após T026.
- A suíte completa e o smoke de navegador não foram repetidos após T026, que acrescentou somente cobertura de teste; os resultados de T025 permanecem registrados acima.
