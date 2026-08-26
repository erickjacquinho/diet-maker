# Implementation log — modal de seleção de alimentos

## 2026-08-26 — escopo reduzido

- A execução foi limitada ao `FoodSearchModal`, conforme orientação do usuário.
- Alterações de refeições prontas, receitas, opções, stores, card e página foram removidas desta execução.
- O modal mantém a lista em tabela, botão de favoritos, busca, ordenação, seleção múltipla, limpar seleção e footer inferior com contagem e confirmação única.
- A pesquisa usa um pool TACO carregado uma vez por abertura; alterações de texto apenas filtram esse pool em memória.
- O campo de busca responde a `Ctrl+F`, exibe o badge `Ctrl+F` internamente e mantém foco pronto para digitação.
- O filtro de favoritos é um botão somente com ícone, com fundo amarelo e ícone branco sem borda no hover; ativo usa o mesmo tratamento com amarelo levemente mais escuro e estrela preenchida branca; a área da tabela mantém 450px de altura.

## Evidências

- `npm run test -- tests/components/molecules/food-search-modal.test.tsx`: 10 testes aprovados.
- `npm run type-check`: aprovado.
- Nenhum store, card ou fluxo de receita foi alterado nesta entrega.
