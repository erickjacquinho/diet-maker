# F3 — Biblioteca no servidor (parte 2: receitas e refeições prontas)

Quinta parte da F3 (Decisão 15). Complementa `specs/30-10-26-dominio-biblioteca-f3`.

## Dados
- `app.recipes` e `app.ready_meals`: cabeçalho em colunas; ingredientes/itens (com snapshot nutricional imutável) em `jsonb` na própria linha, para editar sem apagar filhos (`app_runtime` não tem `DELETE`). RLS `FORCE` por conta; arquivar em vez de excluir.

## API (`/api/v1/library`)
- `GET|POST /recipes`, `GET|PATCH /recipes/:id`, `POST /recipes/:id/duplicate|archive|restore`
- `GET|POST /ready-meals`, `GET|PATCH /ready-meals/:id`, `POST /ready-meals/:id/duplicate|archive|restore`
- Criação idempotente pelo ID do cliente; `PATCH`/archive/restore exigem `If-Match`.

## Regras
- Snapshots são calculados no servidor: alimento TACO (`createTacoSnapshot`), alimento próprio ativo da conta e receita ativa (`recipeSnapshot`). Totais por receita/porção usam as funções decimais do domínio.
- Alimento próprio inexistente, arquivado ou de outra conta, receita inexistente/arquivada/de outra conta, unidade de rendimento divergente e quantidades/rendimentos não positivos respondem 422 com só o nome do campo.
- Refeição pronta mantém o snapshot da receita da época: editar a receita depois não altera refeições prontas já salvas.
- Os helpers de snapshot foram copiados para o servidor porque os módulos locais saem na F5.

## Fora do escopo
- Favoritos e agenda; troca das telas para a API.
