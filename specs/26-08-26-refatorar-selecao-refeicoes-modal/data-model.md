# Data Model: Refeições reutilizáveis

## MacroReference

Representa o macro usado para orientar a equivalência de uma opção.

- `kind`: `protein` | `carbs` | `fats`
- `targetGrams`: valor-alvo em gramas da composição de referência

`targetGrams` deve ser maior que zero. Quilocalorias não são tratadas como macro de referência neste fluxo.

## MealCompositionItem

Linha nutricional reutilizável, compatível com o item já usado no card da dieta.

- `id`: identificador da linha na composição
- `foodId`: identificador do alimento TACO, quando disponível
- `name`: nome exibido
- `quantityGrams`: quantidade em gramas, maior que zero
- `proteinG`, `carbsG`, `fatsG`, `kcal`: valores calculados para a quantidade

O objeto deve continuar permitindo os aliases nutricionais já aceitos pelo domínio atual durante a migração, mas os novos contratos devem preferir os nomes canônicos em gramas.

## MealOption

Alternativa completa de uma refeição.

- `id`: identificador da opção
- `name`: nome curto da opção
- `reference`: `MacroReference`
- `items`: uma ou mais linhas `MealCompositionItem`
- `totals`: proteína, carboidratos, gorduras e kcal recalculados a partir de `items`

Uma opção sem itens ou com referência inválida não pode ser confirmada. Alterações manuais substituem apenas a sugestão de quantidade e recalculam `totals`.

## DietMeal

Refeição existente no plano da dieta.

- campos atuais de identificação, nome, horário e `items`
- `options`: zero ou mais `MealOption`

Adicionar uma composição reutilizável concatena novas linhas a `items` e mantém `options` associadas ao card. A operação não remove dados anteriores.

## ReadyMealSnapshot

Modelo persistido para aplicação direta no construtor.

- `id`, `name`, `suggestedTime`
- `items`: composição completa
- `options`: opções completas configuradas
- resumo nutricional derivado dos itens
- metadados visuais existentes, quando necessários para compatibilidade

Registros legados que tenham apenas resumo e não tenham `items` completos devem continuar legíveis, mas não podem ser confirmados como inserção completa até serem complementados ou substituídos.

## Recipe

Modelo de receita já existente, com ingredientes em gramas, porções e instruções opcionais.

- `ingredients` continua sendo a fonte da composição aplicável
- a conversão para a refeição ativa deve produzir `MealCompositionItem`
- dados próprios de preparo permanecem na receita e não são exigidos para uma refeição pronta

## State and validation rules

1. A seleção começa em `foods`; o modo `readyMeals` é uma área separada e não altera o estado de busca de alimentos sem confirmação.
2. Um item reutilizável selecionado passa por prévia antes de ser aplicado.
3. Aplicação confirmada produz uma nova cópia dos identificadores de composição para evitar que editar a dieta altere a biblioteca salva.
4. Fechamento ou cancelamento descarta o rascunho local do modal/editor.
5. Nome é obrigatório para salvar; composição precisa conter pelo menos uma linha com gramatura positiva.
6. O cálculo proporcional exige `targetGrams > 0` e uma composição candidata com valor positivo no macro selecionado.
7. Todas as quantidades exibidas e editadas são gramas; não existe atributo de medida caseira nesta entrega.
