# Modelo de dados

## Refeição exibida

O modal recebe `MealCardContainerProps[]`, já projetado pela página:

- `id`: identificador estável usado para mover e persistir a refeição.
- `title`, `proteinG`, `carbsG`, `fatsG`, `kcal`: resumo visual.
- `items`: alimentos, quantidades e macros usados no tooltip da badge.

## Rascunho de ordem

O estado local do organismo é a sequência atual de `MealCardContainerProps`. O ID é a identidade; a posição no array é o valor editável.

Invariantes:

- a sequência temporária contém exatamente os mesmos IDs da entrada;
- mover o primeiro para cima ou o último para baixo não altera a sequência;
- `dirty` é verdadeiro somente quando a sequência de IDs difere da ordem inicial;
- confirmar uma sequência sem mudança não chama o callback.

## Contrato de aplicação

`onReorderMeals(mealIds: string[])` recebe os IDs na ordem confirmada. A implementação no hook valida a lista contra as refeições ativas e reordena somente a coleção editável atual. Em ciclo de carboidratos, isso limita a escrita à variação selecionada.
