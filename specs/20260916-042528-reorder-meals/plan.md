# Implementation Plan: reordenar refeições e corrigir criação no ciclo

**Branch**: `20260916-042528-reorder-meals` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

## Summary

Adicionar o controle `Reordenar` à seção de refeições, editar a sequência em um modal local com drag and drop nativo e confirmação de descarte, persistindo somente após confirmar. Corrigir a transição para ciclo de carboidratos para que uma variação ativa válida seja selecionada antes de criar refeições.

## Technical Context

**Language/Version**: TypeScript, React 19, Next.js App Router

**Primary Dependencies**: Tailwind/token utilities, Radix Dialog/AlertDialog/Tooltip, Lucide, Vitest Testing Library

**Storage**: estado local do editor e draft existente da dieta

**Testing**: Vitest + Testing Library; type-check do projeto

**Target Platform**: web desktop, mínimo 1024px

**Project Type**: frontend web application

**Performance Goals**: reordenação local instantânea para a quantidade normal de refeições de uma dieta

**Constraints**: sem nova dependência; manter tokens, acessibilidade, foco e escopo da variação ativa

**Scale/Scope**: um organismo de seção, template/página e hooks existentes; sem alteração de persistência ou primitives

## Constitution Check

- Design system e tokens canônicos: PASS.
- Componentes `src/components/ui` preservados: PASS.
- Atomic Design: PASS; o modal pertence ao organismo da seção e reutiliza moléculas/átomos existentes.
- Acessibilidade: PASS; título/descrição do diálogo, foco Radix, teclado e anúncio de movimento.
- Dependências: PASS; drag and drop nativo.
- Testes antes da implementação: PASS; regressão do ciclo foi escrita e falhou antes da correção.

## Project Structure

```text
src/components/organisms/diet/DietMealsSection.tsx
src/components/templates/DietBuilderTemplate.tsx
src/components/templates/dietBuilderTemplateTypes.ts
src/hooks/useDietMealActions.ts
src/hooks/useDietBuilderPage.ts
src/app/pacientes/[id]/dieta/[dietaId]/page.tsx
tests/components/organisms/diet-meals-section.test.tsx
tests/hooks/useDietMealActions.test.ts
tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx
```

**Structure Decision**: manter a implementação nos pontos já responsáveis pela seção, ações de refeição e composição da página. Não criar pacote, serviço ou primitive novos.

## Implementation Notes

1. `DietMealsSection` controla abertura, draft, dirty state e confirmação de descarte; `SortableList<T>` concentra arraste, teclado, preview, placeholder e animação.
2. A página encaminha `onReorderMeals` e o hook reordena IDs com validação da coleção ativa.
3. A transição de modo seleciona a primeira variação de ciclo para evitar atualização sem alvo.
4. Testes cobrem as histórias P1/P2 e os limites de mover/fechar.
5. Durante o arraste, o item sai do fluxo e um placeholder medido abre espaço; o FLIP anima os cards restantes com `transform`, respeitando `prefers-reduced-motion`.
6. A interação usará Pointer Events e listeners no documento para manter o preview ativo mesmo quando o card original sair do fluxo; não haverá dependência externa.
7. `SortableList<T>` será controlado pelo consumidor e renderizará o conteúdo via render prop, sem conhecer o domínio de refeições.
8. `MealCardContainer` usará `SortableList<MealItemRowProps>` como `tbody` customizado; `MealItemRow` receberá apenas as props de interação, preservando a tabela e os callbacks de edição.
9. `MealItemRow` encaminhará valores de gramas válidos em cada `onChange`; o `blur` permanecerá somente como normalização de campo vazio ou fallback de confirmação.

## Complexity Tracking

Nenhuma violação constitucional.
