# Implementation Plan: Refeições reutilizáveis no modal de seleção de alimentos

**Branch**: `[26-08-26-refatorar-selecao-refeicoes-modal]` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/26-08-26-refatorar-selecao-refeicoes-modal/spec.md`

## Summary

Evoluir o fluxo de seleção para que o nutricionista possa alternar entre alimentos e uma área separada de refeições prontas/receitas, pré-visualizar uma composição completa e aplicá-la na refeição ativa sem recadastro manual. A composição persistida passará a carregar itens, gramaturas e opções completas; o construtor também poderá salvar o card atual e calcular gramaturas proporcionais por macro de referência. A solução reutiliza os stores locais, os cálculos nutricionais e os componentes existentes, mantendo a substituição individual como ação rápida.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15 App Router

**Primary Dependencies**: Radix UI primitives existentes, Tailwind CSS, Lucide React, `localStorage` helpers, TACO dataset

**Storage**: `localStorage` por meio dos stores existentes de refeições prontas, receitas e dieta

**Testing**: Vitest, Testing Library, jsdom, TypeScript `tsc --noEmit`

**Target Platform**: Web desktop a partir de 1024px, operação por teclado e WCAG 2.2 AA

**Project Type**: Aplicação web desktop local-first

**Performance Goals**: Com até 500 itens locais, alternância de grupo e filtragem devem apresentar resultado em até 200 ms p95; aplicação de uma composição deve ocorrer em uma ação de confirmação, sem recadastro individual.

**Constraints**: Somente gramas; sem medidas caseiras, autosave, exportação ou escala visual nesta entrega; preservar design system canônico, Atomic Design e compatibilidade com registros locais existentes.

**Scale/Scope**: Fluxo do `FoodSearchModal`, card da refeição, hook de ações, stores de refeições prontas/receitas e bibliotecas relacionadas; sem API externa ou sincronização multiusuário.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Atomic Design**: PASS — alterações de interação permanecem em molecules/organisms e regras de domínio em `src/lib`; primitives de `src/components/ui` não recebem conhecimento de refeição.
- **Design System**: PASS — novas superfícies devem consumir tokens, componentes e contratos canônicos existentes; nenhuma regra visual nova é inventada neste plano.
- **Desktop e acessibilidade**: PASS — escopo é desktop >=1024px, com teclado, foco visível e mensagens associadas previstos em FR-021.
- **Test-first e isolamento**: PASS — cálculos e conversões serão funções puras em `src/lib`, com novos testes sob `tests/`, sem dependência externa.
- **Spec-driven**: PASS — a implementação só deve ocorrer via `/speckit-implement` após aprovação deste plano e de `tasks.md`.

## Project Structure

### Documentation (this feature)

```text
specs/26-08-26-refatorar-selecao-refeicoes-modal/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/ux.md
└── tasks.md                         # criado por /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/pacientes/[id]/dieta/[dietaId]/page.tsx  # integração do modal e do card ativo
├── components/
│   ├── molecules/FoodSearchModal.tsx            # grupos, prévia e seleção reutilizável
│   ├── molecules/MealOptionEditor.tsx           # criação/edição de opção completa
│   ├── molecules/SaveMealModal.tsx              # tipo e nome para reutilização
│   └── organisms/MealCardContainer.tsx          # ações de salvar e opções
├── hooks/useDietMealActions.ts                   # aplicação e salvamento da composição
└── lib/
    ├── mealTypes.ts                              # tipos compartilhados da composição
    ├── mealOptions.ts                            # cálculo proporcional e validações puras
    ├── dietStore.ts                              # opções na refeição da dieta
    ├── readyMealsStore.ts                        # snapshot completo e compatibilidade local
    └── recipesStore.ts                            # conversão e aplicação de receita

tests/
├── components/molecules/                         # modal, editor e salvamento
├── hooks/                                        # ações da refeição
└── lib/                                          # stores, conversões e cálculo proporcional
```

**Structure Decision**: Manter o monorepo único existente. Tipos e cálculos puros ficam em `src/lib`; superfícies compostas ficam em molecules/organisms conforme Atomic Design; a página da dieta apenas orquestra estado e callbacks. Não há contrato externo nem diretório `contracts/` nesta feature.

## Phase 0: Research Summary

As decisões de armazenamento local, snapshot completo, aplicação no card atual, opções completas e cálculo por macro estão registradas em [research.md](./research.md). Não restam incógnitas de stack ou integração externa bloqueando a implementação.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) define composição, opção, refeição pronta, receita, referências e validações.
- [quickstart.md](./quickstart.md) define validação automatizada, manual, estados vazios e erros.
- Interfaces internas serão contratos TypeScript entre modal, hook, stores e página; não há API pública ou integração externa a documentar.

## Implementation Approach

1. Extrair tipos compartilhados para itens, opções e macro de referência, mantendo adaptadores para os campos legados de `DietItem`, `RecipeIngredient` e `ReadyMeal`.
2. Implementar cálculo proporcional e validações como funções puras, com cópia de IDs ao aplicar uma composição salva.
3. Evoluir os stores para persistir composição completa, preservar metadados existentes e identificar registros legados incompletos sem removê-los.
4. Expandir o modal para uma área separada de refeições prontas/receitas, prévia e confirmação única; manter o grupo de alimentos atual.
5. Adicionar ações no card para salvar como refeição pronta/receita e editar opções completas; deixar a substituição individual intacta.
6. Integrar o hook e a página da dieta, garantindo que a aplicação acrescente itens sem sobrescrever o card ativo.
7. Cobrir os critérios com testes determinísticos de domínio, stores, hook e componentes; validar type-check e os critérios de acessibilidade.

## Post-Design Constitution Re-check

- **Atomic Design**: PASS — os novos componentes permanecem em camadas adequadas e os tipos/cálculos não dependem da UI.
- **Design System**: PASS — o plano exige consultar as categorias/perfis canônicos antes de criar ou alterar componentes.
- **Desktop e acessibilidade**: PASS — o quickstart inclui teclado, foco visível, validação associada e escopo >=1024px.
- **Test-first e isolamento**: PASS — cada transformação central tem contrato e teste determinístico sob `tests/` antes da alteração visual correspondente.
- **Spec-driven**: PASS — a execução está bloqueada até a aprovação humana de spec, plano e tarefas.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | — | O plano mantém o projeto único e os stores locais existentes. |
