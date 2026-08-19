# Tasks: Padronização Integral e Correção de Inconsistências

## Phase 1: Setup & Limpeza de Configuração Global

- [ ] T001 [skill: design-system] Remover o `@import` duplicado da fonte Plus Jakarta Sans em `src/app/globals.css`, preservando a injeção via `next/font/google` em `src/app/layout.tsx`.
- [ ] T002 [skill: code-reviewer-expert] Remover a regra `eslint: { ignoreDuringBuilds: true }` em `next.config.ts` para restabelecer validações estritas de lint durante os builds.
- [ ] T003 [skill: design-system] Remover classes utilitárias redundantes `text-white` em `src/design-system/recipes.ts` e `src/components/atoms/Button.tsx`.

## Phase 2: User Story 1 - Acessibilidade e Átomo FieldTrigger em DatePickerField (Priority: P1)

- [ ] T004 [skill: design-system] [US1] Refatorar `src/components/molecules/DatePickerField.tsx` para substituir o `<Input readOnly>` envelopado em `<div>` pelo átomo `FieldTrigger` com `size="standard"` e `state={error ? 'error' : 'default'}`.
- [ ] T005 [skill: frontend-architecture-mindset] [US1] Assegurar a propagação correta dos atributos de acessibilidade (`aria-required`, `aria-invalid`, `aria-describedby`, `aria-expanded`) e gerenciamento de foco no `FieldTrigger` em `src/components/molecules/DatePickerField.tsx`.
- [ ] T006 [skill: tdd] [US1] Executar e validar a aprovação completa dos testes `tests/components/molecules/date-picker-field.test.tsx` e `tests/components/molecules/date-picker-field-accessibility.test.tsx`.

## Phase 3: User Story 2 - Cores Semânticas de Macros e Herança em MetricBox (Priority: P1)

- [ ] T007 [skill: design-system] [US2] Corrigir a aplicação de `toneClasses[tone]` e `valueClasses[size]` diretamente no elemento `<span>` de valor em `src/components/molecules/MetricBox.tsx`.
- [ ] T008 [skill: design-system] [US2] Padronizar o mapeamento semântico de cores de macronutrientes em `src/components/molecules/MacroMetricCard.tsx` e `src/components/atoms/ProgressBar.tsx` para utilizar as classes oficiais de tokens (`text-macro-protein`, `text-macro-carbohydrate`, `text-macro-fat`, `text-primary`).
- [ ] T009 [skill: code-reviewer-expert] [US2] Eliminar todos os casts `as any` em `src/hooks/useDietCalculations.ts` e alinhar o retorno dos badges aos tipos estritos do Design System.
- [ ] T010 [skill: tdd] [US2] Executar e validar a aprovação dos testes `tests/components/molecules/metric-box.test.tsx`, `tests/components/organisms/metric-box-group.test.tsx` e `src/components/molecules/__tests__/MetricBox.test.tsx`.

## Phase 4: User Story 3 - Construtor de Dietas sem Mocks e Semântica de Tabs (Priority: P2)

- [ ] T011 [skill: frontend-architecture-mindset] [US3] Remover a sintetização do objeto mock `'Paciente Sem Nome'` em `src/hooks/useDietBuilderPage.ts` quando o ID for inexistente, permitindo renderização do estado padrão de erro/não encontrado.
- [ ] T012 [skill: frontend-architecture-mindset] [US3] Remover o fallback hardcoded `patientId = 'pat-1'` em `src/components/templates/DietBuilderTemplate.tsx` e eliminar a renderização redundante do nome do paciente.
- [ ] T013 [skill: design-system] [US3] Atualizar `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` para substituir o spinner cru com classes CSS pelo componente oficial `Spinner` e tratar callbacks no-op.
- [ ] T014 [skill: design-system] [US3] Ajustar `src/components/molecules/DietModeSwitcher.tsx` para garantir semântica acessível WAI-ARIA com papéis `tab` e `tablist`.
- [ ] T015 [skill: design-system] [US3] Ajustar `src/components/organisms/patient/PatientListTableRow.tsx` para omitir `weightKg` no subtítulo, exibindo apenas idade e altura.
- [ ] T016 [skill: tdd] [US3] Executar e validar a aprovação de `tests/components/templates/diet-builder-template.test.tsx` e `tests/components/organisms/patient-list-table.test.tsx`.

## Phase 5: User Story 4 - Integridade de Armazenamento e Limpeza em Cascata (Priority: P2)

- [ ] T017 [skill: backend-patterns] [US4] Atualizar a função `deletePatientFromStorage` em `src/lib/patientsStore.ts` para purgar a chave de dietas associadas (`nutridiet_diets_${id}`) junto com o paciente e avaliações.
- [ ] T018 [skill: code-reviewer-expert] [US4] Padronizar a manipulação de datas no `src/app/pacientes/[id]/PatientProfileCurrentContext.tsx` e `src/lib/patientsStore.ts` utilizando as funções de `src/lib/date-only.ts`.
- [ ] T019 [skill: tdd] [US4] Executar e validar testes de persistência em `src/lib/__tests__/patientsStore.test.ts` e `src/lib/__tests__/dietStore.test.ts`.

## Phase 6: User Story 5 - Limpeza de Código Morto e Validação Completa (Priority: P3)

- [ ] T020 [skill: frontend-architecture-mindset] [US5] Limpar imports mortos (`Plus`, `Clock`, `Users`, `Check`, `Trash2`, `PlusCircle`, `Badge`) em `src/app/receitas/page.tsx` e substituir `window.confirm()` por diálogo padronizado do design system.
- [ ] T021 [skill: tdd] [US5] Executar a suíte completa de testes unitários com Vitest (`npm test`) garantindo 100% de testes passando sem falhas.
- [ ] T022 [skill: code-reviewer-expert] [US5] Executar scripts de auditoria do Design System (`npm run audit:atomic-design`, `npm run audit:z-index`, `npm run verify:design-system`, `npm run verify:design-system-legacy`, `npm run verify:links`, `npm run type-check`, `npm run lint`) comprovando conformidade integral.
