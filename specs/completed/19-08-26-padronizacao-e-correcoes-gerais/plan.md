# Implementation Plan: Padronização Integral e Correção de Inconsistências

**Branch**: `specs/19-08-26-padronizacao-e-correcoes-gerais` | **Date**: 2026-08-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/19-08-26-padronizacao-e-correcoes-gerais/spec.md`

## Summary

Executar a adequação técnica, visual, estrutural e de acessibilidade do NutriDiet Local Pro, eliminando 100% das inconsistências diagnosticadas:
1. Composição atômica e acessibilidade WAI-ARIA do `DatePickerField` através do átomo `FieldTrigger`.
2. Alinhamento de cores semânticas e tokens de macronutrientes (`Kcal`, `Proteína`, `Carboidrato`, `Gordura`) em `MacroMetricCard`, `ProgressBar`, `recipes.ts`, `Badge` e `useDietCalculations`.
3. Correção da herança direta de classes de tipografia/tom no valor do `MetricBox`.
4. Resolução da duplicação de nome e semântica de tabs em `DietBuilderTemplate` / `DietModeSwitcher`.
5. Limpeza de dados falsos sintetizados (`Paciente Sem Nome`) e fallbacks hardcoded em `useDietBuilderPage.ts` e `DietBuilderTemplate.tsx`.
6. Purga completa de dietas órfãs no `localStorage` na exclusão de pacientes (`patientsStore.ts`).
7. Eliminação de código morto, imports não utilizados em `Receitas` e supressão de lint em `next.config.ts`.
8. Remoção de import duplicado de fonte em `globals.css`.

## Technical Context

**Language/Version**: TypeScript 5.7.2 / React 19.0.0 / Node.js
**Primary Dependencies**: Next.js 15.1.6 (App Router), Tailwind CSS 3.4.17, Class Variance Authority (CVA), Radix UI Primitives, Lucide React, date-fns, sonner
**Storage**: Navegador local (`localStorage`) encapsulado com fallback seguro SSR em `src/lib/storage.ts`
**Testing**: Vitest 4.1.10 com `@testing-library/react` e `@testing-library/jest-dom` (JSDOM)
**Target Platform**: Desktop Web (>= 1024px)
**Project Type**: Next.js Single-Page / Client-Driven Desktop Clinic Application
**Performance Goals**: Renderização instantânea (<16ms por frame), zero CLS e zero requisições redundantes de fontes
**Constraints**: 100% aderência à Constituição do Projeto, sem dados hardcoded, sem bypass de tokens e sem `as any`
**Scale/Scope**: 7 páginas de aplicação, 29 componentes de UI, 8 átomos, 24 moléculas, 7 organismos, 2 templates

## Constitution Check

| Princípio Constitucional | Status | Avaliação Técnica |
| :--- | :--- | :--- |
| **I. Atomic Design Architecture** | PASS | `DatePickerField` passará a consumir o átomo `FieldTrigger`, e `MetricBox` consumirá a geometria padronizada de `Surface`, sem cruzamento de camadas superiores. |
| **II. Canonical Design System** | PASS | Classes utilitárias redundantes (`text-white`) serão eliminadas de `recipes.ts` e `Button.tsx`. Mapeamento de macros passará a consumir estritamente `--sys-color-macro-*`. |
| **III. Desktop Scope and Accessibility** | PASS | `DatePickerField` e `DietModeSwitcher` terão atributos `role="button"` / `role="tab"` e gerenciamento de foco WCAG 2.2 AA completo. |
| **IV. Test-First Quality and Isolation** | PASS | Todos os testes de unidade e acessibilidade sob `tests/` e `src/` passarão com 100% de sucesso sem mutação global. |
| **V. Spec-Driven Execution** | PASS | Execução estruturada via fluxo SDD / Spec Kit com rastreabilidade completa de requisitos em `tasks.md`. |

## Project Structure

### Documentation (this feature)

```text
specs/19-08-26-padronizacao-e-correcoes-gerais/
├── spec.md                  # Especificação funcional e não-funcional
├── checklists/
│   ├── requirements.md      # Validação de qualidade de requisitos
│   └── design-system.md     # Validação de regras visuais e atômicas
├── plan.md                  # Este plano de implementação
├── research.md              # Decisões arquiteturais e mapeamentos técnicos
├── data-model.md            # Entidades, tipos e ciclo de vida
├── quickstart.md            # Guia de validação e execução de testes
└── tasks.md                 # Decomposição de tarefas ordenadas para implementação
```

### Source Code Impacted

```text
src/
├── app/
│   ├── globals.css                                     # [MOD] Remoção do @import duplicado de fonte
│   ├── pacientes/
│   │   └── [id]/
│   │       ├── PatientProfileCurrentContext.tsx        # [MOD] Padronização de datas ISO
│   │       └── dieta/[dietaId]/page.tsx                # [MOD] Uso de Spinner oficial e remoção de no-ops
│   └── receitas/page.tsx                               # [MOD] Limpeza de imports mortos e substituição de confirm()
├── components/
│   ├── atoms/
│   │   ├── Button.tsx                                  # [MOD] Remoção de text-white redundante
│   │   └── ProgressBar.tsx                             # [MOD] Mapeamento semântico de macros
│   ├── molecules/
│   │   ├── DatePickerField.tsx                         # [MOD] Adoção do átomo FieldTrigger
│   │   ├── MacroMetricCard.tsx                         # [MOD] Mapeamento semântico de macros
│   │   ├── MetricBox.tsx                               # [MOD] Aplicação de classes no <span> de valor
│   │   └── DietModeSwitcher.tsx                        # [MOD] Semântica acessível de tabs
│   ├── organisms/
│   │   └── patient/PatientListTableRow.tsx             # [MOD] Remoção de peso duplicado no subtítulo
│   └── templates/
│       └── DietBuilderTemplate.tsx                     # [MOD] Remoção de fallback hardcoded e nome duplicado
├── design-system/
│   └── recipes.ts                                      # [MOD] Remoção de text-white em variantes
├── hooks/
│   ├── useDietCalculations.ts                          # [MOD] Mapeamento de macros sem 'as any'
│   └── useDietBuilderPage.ts                           # [MOD] Remoção do paciente fake 'Paciente Sem Nome'
├── lib/
│   └── patientsStore.ts                                # [MOD] Purga em cascata de nutridiet_diets_*
next.config.ts                                          # [MOD] Remoção de ignoreDuringBuilds
```

## Complexity Tracking

*Nenhuma violação à constituição ou aumento desnecessário de complexidade identificado.*
