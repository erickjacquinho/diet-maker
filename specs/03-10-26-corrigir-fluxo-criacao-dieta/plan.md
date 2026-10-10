# Implementation Plan: Corrigir Integridade e Recuperação na Criação de Dieta

**Branch**: codex/diet-pdf-export | **Date**: 2026-10-03 | **Spec**: ./spec.md

**Input**: Corrigir os gaps auditados no fluxo de criação/edição de dieta; preservar alterações locais existentes e aguardar validação humana antes de implementar.

## Summary

Preservar snapshots e peso de referência no round-trip do editor, aceitar as origens já suportadas, separar confirmação local de cleanup/checkpoint, reconciliar resultado incerto, proteger saídas do editor e apresentar erros de abertura recuperáveis. Reutilizar os snapshots, revisões, IDs estáveis, repositórios, profile session e componentes existentes. Não criar dependências, formatos de arquivo ou migrações de banco.

## Technical Context

**Language/Version**: TypeScript 5.7.2; React 19; Next.js 15.1.6.

**Primary Dependencies**: Next.js App Router, React, decimal.js, nanoid, Vitest, Testing Library e Playwright já instalados. Nenhuma dependência nova.

**Storage**: PGlite persistido no IndexedDB para o workspace confirmado; DietDraftStore no IndexedDB para drafts; arquivo .nutridiet como checkpoint principal da Conta.

**Testing**: Vitest para testes unitários/de integração; Testing Library para hooks/componentes; Playwright para smoke do fluxo visual quando útil.

**Target Platform**: Aplicação web local-first para desktop, largura mínima 1024px, sem dependência de sincronização remota.

**Project Type**: Aplicação web Next.js App Router em repositório único.

**Performance Goals**: Preservar a busca TACO existente abaixo de 100 ms após inicialização. A feature não adiciona busca nem metas de desempenho.

**Constraints**: Manter escopo de Conta/paciente; snapshots, versão e peso de referência da prescrição são imutáveis fora de uma edição explícita; no máximo uma dieta vigente por paciente; uma aba ativa; IDs/revisões estáveis; não inferir peso histórico ausente; não sobrescrever diffs locais não relacionados.

**Scale/Scope**: Um fluxo vertical de criação, edição, confirmação, checkpoint e reabertura. Sem migração de dados, serviço remoto ou alteração dos fluxos independentes de biblioteca/exportação.

## Constitution Check

| Gate | Result | Plano |
| --- | --- | --- |
| I. Atomic Design | PASS | Reusar página, hook, template, organismos e primitivos existentes; não criar uma camada UI de domínio. |
| II. Design System canônico | PASS | Usar componentes/estados existentes e seus contratos de acessibilidade; nenhum token ou perfil visual novo. |
| III. Desktop e acessibilidade | PASS | Manter desktop-only; estados busy/erro/recuperação anunciados e operáveis por teclado; seguir WCAG 2.2 AA. |
| IV. Test-first e isolamento | PASS | Criar regressões determinísticas sob tests antes das mudanças; sem dados externos ou mutação global. |
| V. Spec-driven | PASS | Implementação futura somente por /speckit-implement após validação humana deste SDD. |

## Project Structure

### Documentation (this feature)

- spec.md: requisitos e jornadas.
- plan.md: este plano.
- research.md: decisões e alternativas.
- data-model.md: snapshots, peso e estados de salvamento.
- contracts/diet-editor-save.md: contrato de interação e outcomes.
- quickstart.md: validação após implementação.
- checklists/: qualidade da especificação e do fluxo.
- tasks.md: tarefas por história, criado na etapa de decomposição e ativo para esta implementação.

### Source Code (repository root)

- src/app/pacientes/[id]/dieta/[dietaId]/page.tsx
- src/components/templates/DietBuilderTemplate.tsx
- src/components/organisms/diet/DietContextSection.tsx
- src/components/organisms/diet/DietMealsSection.tsx
- src/components/organisms/diet/DietModeSwitcher.tsx
- src/components/organisms/diet/CarbCyclingVariationPanel.tsx
- src/hooks/useDietBuilderPage.ts
- src/hooks/useDietBuilderModals.ts
- src/hooks/useDietCalculations.ts
- src/hooks/useDietMealActions.ts
- src/hooks/useDietPresets.ts
- src/lib/application/diets/diet-application.ts
- src/lib/application/diets/diet-ports.ts
- src/lib/application/diets/legacy-diet-adapter.ts
- src/lib/application/diets/save-diet-as-active.ts
- src/lib/domain/diets/diet-model.ts
- src/lib/domain/diets/diet-validation.ts
- src/lib/legacy-diet-types.ts
- src/lib/library-ui-adapter.ts
- tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts
- tests/application/diets/diet-application-checkpoint.test.ts
- tests/lib/diets/save-diet-as-active.test.ts
- tests/lib/diets/diet-validation.test.ts
- tests/hooks/useDietBuilderSaveOutcome.test.ts
- tests/hooks/useDietMealActions.test.ts
- tests/hooks/useDietCalculations.test.ts
- tests/hooks/useDietBuilderPage.test.ts
- tests/app/pacientes/diet-editor-persistence.test.tsx
- tests/app/pacientes/diet-editor-load-errors.test.tsx
- tests/components/templates/DietBuilderTemplate.test.tsx

**Structure Decision**: Permanecer no monólito atual: rota → hook → aplicação → draft store/repositório/profile session. Estender testes existentes e adicionar um arquivo de teste só quando os cenários não couberem claramente nos testes já existentes.

## Design Decisions

- R1–R3 em research.md definem a atualização dos snapshots, validação dos tipos de origem já modelados e preservação do peso; data-model.md registra campos e compatibilidade sem migration.
- O caso de uso confirma a dieta primeiro. Só um commit confirmado aciona o checkpoint. Se o checkpoint falhar, devolver CHECKPOINT_PENDING com o resultado local preservado e reusar o sync/retry existente do profile.
- RESULT_UNKNOWN reconcilia por ID/revisão antes de retry; um plano já confirmado só limpa a revisão confirmada e checkpointa, sem nova mutação. CLEANUP_PENDING segue o mesmo princípio para cleanup.
- Voltar e ciclo só saem após flush SAVED; prévias existentes conservam seu gate. Uma confirmação explícita bloqueia o atalho quando há diálogo aberto e usa uma região inert durante flush/commit; os callbacks também rejeitam mutações. O autosave permanece não bloqueante.
- A abertura conserva a causa do erro e oferece retry/retorno com os componentes atuais; sem spinner indefinido ou novo framework de estado.

## Data and Interface Contracts

- Nenhuma migration, mudança de envelope .nutridiet, serviço externo ou fonte nova.
- Estender apenas os outcomes e a operação de reconciliação da DietApplication; entidades/snapshots continuam no modelo atual.
- O estado de abertura e confirmationBusy são transitórios; ProfileSessionSyncState/SidebarNav continuam donos do estado e retry do arquivo.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Arredondamento dos campos legados divergir do snapshot | Recalcular pelo scaler decimal e testar retorno 100→50→100 a partir da base congelada. |
| Fonte custom/receita/refeição pronta ser rejeitada ao salvar | Cobrir todos os tipos de origem já modelados; conservar demais checks de snapshot. |
| Retry de resultado incerto duplicar dieta ou remover draft novo | Reconciliar por ID/versão estável e remover apenas a revisão confirmada. |
| Erro do .nutridiet parecer rollback clínico | Retornar checkpoint pendente com o commit local preservado e usar retry do profile. |
| Ctrl+S dentro de diálogo inicia a confirmação da página | Desabilitar o atalho de página enquanto um diálogo de edição está aberto e inertar a região editável durante a confirmação. |
| Peso histórico ausente | Não inferir; manter g/kg indisponível e deixar backfill fora do escopo. |
| Alterações locais do usuário serem sobrescritas | Inspecionar diff antes de editar e usar patches contextuais; não restaurar arquivos inteiros. |

## Validation Strategy

1. Acrescentar testes de regressão primeiro: snapshot, fontes válidas, peso, save outcomes/reconciliação, navegação/busy e erros de abertura.
2. Rodar inicialmente os arquivos focados listados no quickstart; corrigir findings sem ampliar escopo.
3. Executar npm run type-check e npm run test.
4. Fazer smoke em browser desktop: nova dieta, abrir/copiar dieta, fontes TACO/custom/receita/refeição pronta, alteração de peso, erro de flush, checkpoint retry e falhas de abertura.
5. Verificar anúncio por teclado/tecnologia assistiva dos estados busy/erro/recuperação.
6. Este SDD não executa testes nem altera a implementação.


