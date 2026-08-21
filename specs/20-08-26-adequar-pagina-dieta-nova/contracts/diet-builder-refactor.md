# Contract: Refatoração e Padronização do Diet Builder

## 1. Contrato de Componentes Centralizados

- `MealCardContainer` DEVE renderizar a raiz como `<Surface variant="default">`.
- Os badges de macronutrientes DEVEM utilizar `<Badge variant="protein">`, `<Badge variant="carbohydrate">`, `<Badge variant="fat">` e `<Badge variant="kcal">`.
- O botão de edição de título e horário DEVE utilizar `<EditIconButton size="compact" />` ou `<IconButton variant="quiet" />`.
- A edição inline de gramatura de `MealItemRow` DEVE utilizar `<FieldTrigger size="compact" />`.
- Todas as superfícies de estado vazio DEVEM utilizar `<Surface variant="subtle">`.

## 2. Contrato de Integridade Funcional

- Todas as ações do usuário (salvar, adicionar refeição, duplicar refeição, excluir refeição, adicionar alimento, remover item, alterar gramatura, escalar dieta, copiar variação, ajustar metas, exportar WhatsApp) DEVEM persistir os dados no `dietStore` e atualizar o estado reativo instantaneamente.
