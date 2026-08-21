# Implementation Plan: Merge Seletivo de Componentes Similares

**Branch**: `07-08-26-merge-componentes-similares` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/07-08-26-merge-componentes-similares/spec.md`

## Summary

O objetivo é reduzir duplicação entre componentes visualmente ou comportamentalmente próximos sem apagar fronteiras de domínio. A implementação posterior deve trabalhar candidato por candidato: primeiro registrar a decisão, depois compartilhar ou compor somente a unidade comum, atualizar os contratos do design system e validar o fluxo correspondente antes de avançar.

O plano prioriza a remoção segura do alias deprecated de `Input`, a composição da edição de macros com o cálculo energético, a extração de unidades internas para linhas nutricionais, campos de paciente e busca TACO, e a revisão fundamentada de `atoms/Badge` versus `ui/badge`. Os componentes públicos de domínio permanecem separados.

## Technical Context

**Language/Version**: TypeScript 5.7.2, React 19, Next.js 15.1.6

**Primary Dependencies**: Componentes existentes do React/Next, `class-variance-authority`, Radix/Shadcn locais, Lucide e utilitário `cn`; nenhuma dependência nova prevista.

**Storage**: N/A. O trabalho reorganiza componentes e contratos de UI, sem alterar persistência ou modelo de dados de negócio.

**Testing**: Vitest 4, Testing Library para React/DOM, ESLint, TypeScript, auditoria Atomic Design e verificadores estritos do design system.

**Target Platform**: Aplicação web desktop a partir de 1024px, com tema claro e tokens canônicos do NutriDiet.

**Project Type**: Aplicação web Next.js App Router com componentes React client-side quando o fluxo exige estado e interação.

**Performance Goals**: Preservar a latência observável dos fluxos atuais, sem novas requisições, sem duplicação de estado entre consumidores e sem degradação perceptível ao editar macros, pacientes ou buscas.

**Constraints**: Respeitar as cinco camadas Atomic Design; manter `src/components/ui` genérico; não criar modal universal com boolean flags; não introduzir estilos ou tokens locais; manter acessibilidade WCAG 2.2 AA; validar e reverter cada candidato independentemente.

**Scale/Scope**: Um alias deprecated, cinco grupos principais de composição/compartilhamento, uma revisão de redundância de Badge, os componentes consumidores identificados no inventário e seus testes/documentação de contrato. Exclusões da especificação não entram no escopo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Atomic Design Architecture**: PASS. Unidades compartilhadas permanecem na camada mais baixa compatível; modais e linhas de domínio continuam em suas camadas; nenhuma dependência superior é introduzida.
- **II. Canonical Design System**: PASS. Mudanças de categoria, perfil, registry e lifecycle serão feitas junto com o código e validadas pelos scripts estritos.
- **III. Desktop Scope and Accessibility**: PASS. O escopo continua desktop a partir de 1024px, com preservação dos estados, foco, teclado, semântica e tokens canônicos.
- **IV. Test-First Quality and Isolation**: PASS. Cada candidato recebe testes determinísticos e evidência independente antes do próximo candidato.
- **V. Spec-Driven Execution**: PASS. Este documento apenas planeja; qualquer implementação posterior será executada por `/speckit-implement` após validação humana.

**Gate result before Phase 0**: PASS. Não há violação constitucional a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/07-08-26-merge-componentes-similares/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── composition-contract.md
│   └── catalog-migration-contract.md
├── checklists/
│   ├── requirements.md
│   └── merge-quality.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   ├── atoms/
│   ├── molecules/
│   │   ├── AdjustDietGoalsModal.tsx
│   │   ├── AutoKcalSection.tsx
│   │   ├── MealItemRow.tsx
│   │   ├── RecipeIngredientRow.tsx
│   │   ├── CreatePatientModal.tsx
│   │   ├── EditPatientModal.tsx
│   │   ├── FoodSearchModal.tsx
│   │   └── CreateRecipeModal.tsx
│   └── organisms/
└── app/

tests/
├── unit/
├── integration/
└── contract/

design-system/components/
├── registry.json
├── profiles/
└── categories/
```

**Structure Decision**: Single Next.js web application. Shared visual or interaction units stay in the lowest valid `src/components` layer; public domain shells remain in their current molecule/organism layer. Tests remain under `tests/`, while the registry, category decisions and component profiles are updated as one catalog change. No new app, package, storage layer or external contract is introduced.

## Phase 0: Research Decisions

1. Confirm the canonical input path and lifecycle treatment for the deprecated atom wrapper.
2. Confirm that composition is preferred over a new public component when the two consumers have different domain actions.
3. Confirm the design-system catalog requirements for shared sources, public exports, consumers, states and lifecycle status.
4. Confirm the validation matrix and existing commands required for a strict handoff.

The decisions and alternatives are recorded in [research.md](./research.md).

## Phase 1: Design Artifacts

- [data-model.md](./data-model.md) defines candidate decisions, shared units, public contracts and validation evidence.
- [contracts/composition-contract.md](./contracts/composition-contract.md) defines the boundary between public domain shells and internal shared composition.
- [contracts/catalog-migration-contract.md](./contracts/catalog-migration-contract.md) defines registry/profile/lifecycle updates for merge, deprecation and removal.
- [quickstart.md](./quickstart.md) defines the deterministic validation commands and manual acceptance flows.

**Gate result after Phase 1 design**: PASS. The artifacts preserve the constitution, keep all candidates independently reversible and do not require a new dependency or a new layer.

## Complexity Tracking

No constitutional violations. Complexity tracking is not applicable.
