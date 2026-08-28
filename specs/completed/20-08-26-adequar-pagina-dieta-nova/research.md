# Research: Adequação e Centralização da Página de Elaboração de Dieta

## 1. Contexto e Motivação

A rota `/pacientes/:id/dieta/:dietaId` e o fluxo de criação de nova dieta concentram as principais funcionalidades de prescrição alimentar do NutriDiet Local Pro.
Uma auditoria técnica identificou:
1. Conflitos de classes Tailwind que geram regras CSS inválidas no DOM (`p-5 p-6`, `flex-col flex-row`, `w-full w-auto`, `grid-cols-1 grid-cols-2`).
2. Uso de `<Card>` cru de shadcn com classes manuais em vez do átomo `<Surface>` canônico do Design System.
3. Repetição de strings de classes inline para badges de macronutrientes (`border-macro-protein-border bg-macro-protein-soft text-macro-protein`), evidenciando a ausência de variantes semânticas no átomo `Badge`.
4. Botões de ação e gatilhos de edição inline estilizados manualmente com `<Button>` cru em vez de `EditIconButton` e `FieldTrigger`.
5. Handlers vazios no hook `useDietMealActions` (`onDuplicate`) e `useDietBuilderPage` (`onVariationsCountChange`).

## 2. Decisões Arquiteturais

1. **Variantes no Átomo Badge**:
   - Estender `Badge` em `src/components/atoms/Badge.tsx` e `src/components/ui/badge.tsx` com variantes:
     - `protein`: `border-macro-protein-border bg-macro-protein-soft text-macro-protein`
     - `carbohydrate`: `border-macro-carbohydrate-border bg-macro-carbohydrate-soft text-macro-carbohydrate`
     - `fat`: `border-macro-fat-border bg-macro-fat-soft text-macro-fat`
     - `kcal`: `border-warning-border bg-warning-soft text-warning`
2. **Substituição de Superfícies**:
   - `MealCardContainer`: utilizar `Surface variant="default"` em vez de `Card`.
   - `DietMealsSection` (empty state): utilizar `Surface variant="subtle"` com `bg-success-soft` para o ícone de utensílios.
   - `MealCardContainer` (empty items): utilizar `Surface variant="subtle"`.
3. **Limpeza de Conflitos Tailwind**:
   - Corrigir `MealCardContainer`: `p-6` único, `flex items-center justify-between`, `w-auto`.
   - Corrigir `MacroTrackerHeader`: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
   - Corrigir `FoodSearchModal`: `flex items-center justify-between gap-3`.
4. **Implementação de Duplicação e Variações**:
   - `handleDuplicateMeal(mealId)`: clona a refeição, gera novo `meal-${Date.now()}` e novos IDs para cada `DietItem`.
   - `onVariationsCountChange`: atualiza `carbCyclingVariationsCount` no plano alimentar ativo.
