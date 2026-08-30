# Decisão 07 — Receitas e Refeições Prontas

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
- **Data:** 2026-08-29
- **Escopo:** Biblioteca reutilizável da Conta do nutricionista

## 1. Distinção de domínio

Receita e refeição pronta não são a mesma entidade:

- **Receita:** preparação culinária composta por ingredientes, com rendimento,
  instruções e cálculo nutricional próprio.
- **Refeição pronta:** template reutilizável de uma refeição, que agrupa itens
  prescríveis e pode conter alimentos e porções de receitas.
- **DietMeal:** refeição efetivamente inserida no plano de um paciente, com
  horário, ordem, substituições e snapshots clínicos.

Uma refeição pronta é um item da biblioteca da Conta; não é uma refeição de um
paciente até ser copiada para um `DietDraft` e posteriormente salva na dieta.

## 2. Receita como agregado da Conta

```text
Recipe
├── id / accountId / version
├── name / category / instructions
├── prepTimeMinutes
├── yieldPortions
├── preparedWeightGrams (quando conhecido)
├── status / createdAt / updatedAt
└── RecipeIngredient[]
    ├── foodId / foodSource
    ├── quantity / unit
    ├── ingredientSnapshot
    └── orderIndex
```

Na primeira versão da arquitetura, os ingredientes de uma receita são
alimentos TACO ou alimentos customizados. Uma receita não pode conter outra
receita nem uma refeição pronta; isso evita ciclos, cálculo recursivo e
dependências difíceis de arquivar.

O ingrediente grava a referência de origem e um snapshot nutricional usado no
cálculo da versão da receita. Alterar o alimento de origem não altera uma
receita silenciosamente; o nutricionista precisa editar e salvar a receita
explicitamente.

## 3. Cálculo da receita

Ao salvar uma receita, o caso de uso deve:

1. validar ingredientes TACO de sistema ou customizados da Conta ativa;
2. normalizar quantidades e unidades;
3. congelar o snapshot nutricional de cada ingrediente naquela versão;
4. somar os nutrientes totais da preparação;
5. calcular nutrientes por porção usando `yieldPortions`;
6. registrar a versão e o momento do cálculo.

Quando `preparedWeightGrams` existir, a receita também pode expor valores por
100 g preparada. Sem peso preparado, o sistema não deve estimar rendimento por
peso; deve oferecer apenas a base suportada pelos dados informados.

`yieldPortions` e, quando informado, `preparedWeightGrams` devem ser positivos
e finitos. Não substituir rendimento inválido por 1 nem inferir densidade.
Energia, precisão, arredondamento e versão de cálculo seguem a Decisão 06,
seção 6. O total da receita soma a energia dos ingredientes; não substitui kcal
de referência pela energia calculada a partir dos macros.

## 4. Refeição pronta como agregado da Conta

```text
ReadyMeal
├── id / accountId / version
├── name / description / suggestedTime
├── status / createdAt / updatedAt
└── ReadyMealItem[]
    ├── sourceType: FOOD | RECIPE
    ├── sourceId / sourceVersion
    ├── quantity ou recipePortions
    ├── itemSnapshot
    └── orderIndex
```

Uma refeição pronta pode combinar alimentos e porções de receitas, mas não
pode conter outra refeição pronta. Ao salvar o template, suas referências e
snapshots devem ser validados dentro da Conta.

Editar a refeição pronta cria uma nova versão lógica para usos futuros. Uma
refeição pronta já inserida em um draft conserva o snapshot capturado no
momento da inserção até que o nutricionista escolha recarregar ou substituir o
item.

## 5. Inserção na dieta

Selecionar uma receita ou refeição pronta não grava imediatamente a dieta no
backend:

```text
Biblioteca da Conta
        ↓ selecionar
DietDraft local em IndexedDB
        ↓ editar quantidades/substituições
Salvar explícito
        ↓ transação
DietPlan + DietMeal + DietMealItem + snapshots
```

Ao inserir:

- receita é escalada por porção ou quantidade compatível com a unidade;
- refeição pronta é copiada para a refeição escolhida do draft;
- itens ganham identificadores locais próprios;
- origem, versão, nome, quantidade e nutrientes são preservados no snapshot;
- a dieta salva deixa de depender de uma leitura viva da biblioteca.

## 6. Repositórios e operações

Os casos de uso mínimos são:

- `createRecipe`, `updateRecipe`, `archiveRecipe`, `getRecipe` e
  `listRecipes`;
- `createReadyMeal`, `updateReadyMeal`, `archiveReadyMeal`, `getReadyMeal` e
  `listReadyMeals`;
- `insertRecipeIntoDietDraft`;
- `insertReadyMealIntoDietDraft`;
- `duplicateRecipe` e `duplicateReadyMeal` dentro da mesma Conta.

As operações de biblioteca persistem no banco relacional canônico da Conta.
As duas últimas operações de inserção usam somente o `DietDraftStore` até que
a dieta seja salva.

## 7. Exclusão e reutilização

Receitas e refeições prontas usadas por outra entidade ou por histórico
clínico devem ser arquivadas, não apagadas fisicamente. O arquivamento impede
novas inserções, mas preserva:

- a leitura de dietas já salvas;
- a origem do snapshot;
- a possibilidade de exportar o arquivo mestre;
- a auditoria de versões da Conta.

Uma cópia explícita cria novo ID e nova versão; nunca reutiliza o ID da origem
em outro agregado.

## 8. Fora desta decisão

Não fazem parte desta etapa telas, editor visual de receitas, upload de fotos,
integração com marketplace ou composição recursiva de receitas. Qualquer
composição recursiva futura exigirá decisão própria sobre ciclos e versões.
