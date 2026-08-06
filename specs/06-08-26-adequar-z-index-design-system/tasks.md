# Tasks: Adequação da Hierarquia de Camadas

**Input**: Design documents from /specs/06-08-26-adequar-z-index-design-system/
**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/layer-contract.md, quickstart.md
**Execution**: Após validação humana, executar por /speckit-implement.

## Phase 1 — Contract and failing coverage

- [X] T001 [P] [US2] Criar o inventário determinístico de LayerToken, LayerContext e LayerOccurrence conforme data-model.md em tests/design-system/z-index-contract.test.ts, cobrindo as 22 declarações atuais e a regra de localização/linha [skill: tdd]
- [X] T002 [US3] Criar testes de contrato para rejeitar z-10, z-[N], style.zIndex, dropdown/select com z-popover e SheetContent com z-overlay em tests/design-system/z-index-contract.test.ts [skill: tdd]
- [X] T003 [P] [US1] Adicionar testes de camadas padrão e contexto modal para Dialog, Sheet, DropdownMenu, Select, Popover e Tooltip em tests/components/ui/overlay-layer-contract.test.tsx [skill: tdd]
- [X] T004 [P] [US1] Estender os testes de acessibilidade para verificar portal, foco, teclado, dismiss e retorno de foco em Select/Calendar dentro de Dialog e conteúdo de Sheet em tests/components/overlays-accessibility.test.tsx [skill: tdd]

## Phase 2 — Primitive layer correction

- [X] T005 [US1] Corrigir a separação semântica entre backdrop e conteúdo em src/components/ui/sheet.tsx, mantendo SheetOverlay em z-overlay e SheetContent em z-modal [skill: ui-styling]
- [X] T006 [US1] Corrigir DropdownMenuContent e DropdownMenuSubContent para z-dropdown em src/components/ui/dropdown-menu.tsx, preservando submenu, portal e navegação de teclado [skill: ui-styling]
- [X] T007 [US1] Harmonizar o token padrão e a opção contextual de SelectContent em src/components/ui/select.tsx, mantendo z-dropdown fora de modal e z-modal somente quando explicitamente solicitado [skill: frontend-architecture-mindset]
- [X] T008 [US1] Adicionar ao contrato reutilizável de PopoverContent em src/components/ui/popover.tsx a resolução modal explícita, mantendo z-popover como padrão e sem alterar dismiss ou portal [skill: frontend-architecture-mindset]
- [X] T009 [US1] Revalidar e ajustar apenas se necessário os tokens já compatíveis em src/components/ui/dialog.tsx, src/components/ui/tooltip.tsx e src/components/ui/calendar.tsx, sem mudanças numéricas ou regressão de acessibilidade [skill: code-reviewer-expert]

## Phase 3 — Consumer cleanup

- [X] T010 [US1] Adaptar DatePickerField ao contexto modal explícito em src/components/molecules/DatePickerField.tsx e cobrir seu uso dentro do diálogo de paciente em tests/components/molecules/date-picker-field.test.tsx [skill: ui-styling]
- [X] T011 [P] [US2] Remover z-10 desnecessário ou substituir por z-raised somente quando houver sobreposição real em src/components/organisms/PatientListTable.tsx [skill: ui-styling]
- [X] T012 [P] [US2] Remover z-10 desnecessário ou substituir por z-raised somente quando houver sobreposição real nos ícones de busca em src/app/refeicoes-prontas/page.tsx, src/app/receitas/page.tsx, src/app/pacientes/page.tsx, src/app/alimentos/page.tsx e src/app/presets/page.tsx [skill: ui-styling]
- [X] T013 [US1] Confirmar a camada z-dropdown da lista inline de ingredientes e sua relação com o modal em src/components/molecules/CreateRecipeModal.tsx, adicionando cobertura em tests/components/molecules/create-recipe-modal.test.tsx [skill: ui-styling]

## Phase 4 — Documentation and validator

- [X] T014 [US2] Atualizar as regras canônicas e perfis de overlay para eliminar conflitos entre z-dropdown, z-popover, z-overlay e z-modal em design-system/07-icons-motion-and-layers.md, design-system/components/categories/overlays.md, design-system/components/profiles/ui/select.md, design-system/components/profiles/ui/popover.md, design-system/components/profiles/ui/dropdown-menu.md e design-system/components/profiles/ui/dialog.md [skill: design-system]
- [X] T015 [US2] Atualizar o registro de componentes somente se a API pública de camada mudar, preservando os contratos de Atomic Design e shadcn em design-system/components/registry.json, .agents/rules/atomic-design.md e .agents/rules/shadcn-preservation.md [skill: design-system]
- [X] T016 [US3] Implementar o auditor determinístico com findings de arquivo, linha, ocorrência, severidade, regra e correção em scripts/audit-z-index.mjs, usando a matriz de specs/06-08-26-adequar-z-index-design-system/contracts/layer-contract.md [skill: code-reviewer-expert]
- [X] T017 [US3] Expor a execução do auditor no fluxo do projeto em package.json e cobrir seu comando nominal e seus achados negativos em tests/design-system/z-index-audit.test.mjs [skill: code-reviewer-expert]

## Phase 5 — Verification and handoff

- [ ] T018 [US3] Executar e corrigir os achados de npm test, npm run type-check, npm run lint, npm run verify:design-system, npm run audit:atomic-design e npm run verify:links, registrando a evidência em specs/06-08-26-adequar-z-index-design-system/quickstart.md [skill: code-reviewer-expert]
- [X] T019 [US3] Confirmar que o inventário final não contém z-10, z-[N] ou style.zIndex fora de tailwind.config.js e que todos os consumidores do baseline estão classificados em tests/design-system/z-index-contract.test.ts [skill: code-reviewer-expert]

## Dependencies and execution notes

- T001–T004 estabelecem cobertura e devem ser criadas antes das correções de runtime.
- T005–T009 dependem de T001–T004 e formam a correção dos primitivos.
- T010–T013 dependem das APIs dos primitivos e podem ser executadas após T005–T009.
- T014–T015 dependem das decisões finais de API e devem acompanhar a implementação, sem duplicar regras.
- T016–T017 dependem do inventário e do contrato; T018–T019 são tarefas finais de verificação.
- T011, T012 e T015 podem ser paralelas quando não houver sobreposição no mesmo arquivo.
- Nenhuma tarefa desta lista deve ser executada antes da validação humana deste SDD.

## Phase 6: Convergence

- [ ] T020 [US3] Resolver os bloqueios de validação global que mantêm T018 parcial — o teste Sidebar que importa `src/app/navigation/SidebarNavigationAdapter`, o timeout de `npm test` e a falha de coleta de `/alimentos` — e repetir os checks completos sem alterar o contrato de z-index, conforme SC-005 e Phase 4 (partial) [skill: code-reviewer-expert]
