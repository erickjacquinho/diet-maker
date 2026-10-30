# F3 — Biblioteca no servidor (parte 1: alimentos próprios e dietas prontas)

Quarta parte da F3 (Decisão 15). Conteúdo nutricional da conta é S2 (em claro).

## Dados
- `app.food_catalog_items`: PK `(account_id, id)`, status `ACTIVE|ARCHIVED`, versão otimista. Pode ser excluído se não referenciado.
- `app.ready_diets`: documento da dieta em `jsonb`, criado e listado (sem `DELETE`).
- RLS `FORCE` por conta nas duas tabelas.

## API (`/api/v1/library`)
- `GET|POST /foods` (`GET ?search=&includeArchived=`; `POST` idempotente pelo ID do cliente)
- `GET|PATCH|DELETE /foods/:id` (`If-Match` em `PATCH`/`DELETE`)
- `POST /foods/:id/duplicate` (`{ id }` novo), `POST /foods/:id/archive|restore` (`If-Match`)
- `GET|POST /ready-diets`

## Regras
- Validação, normalização decimal e energia (4/4/9) usam o domínio local; falha de validação responde 422 só com o nome do campo.
- `calculationVersion`, status, versão e datas são do servidor (rejeitados na entrada).
- Exclusão de alimento em uso (snapshot `ACCOUNT_CUSTOM` em dieta confirmada ou dieta pronta) responde 409 `IN_USE`.

## Fora do escopo desta parte
- Receitas e refeições prontas (precisam do snapshot TACO no servidor) e a checagem de referência a elas ao excluir alimento.
- Favoritos e agenda; troca das telas para a API.
