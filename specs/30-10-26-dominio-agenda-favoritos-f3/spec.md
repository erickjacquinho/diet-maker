# F3 — Agenda e favoritos no servidor

Última parte de domínio da F3 (Decisão 15). Preferências da conta em claro (S2), sem `DELETE` para `app_runtime`.

## Dados
- `app.agenda_reminders`: PK `(account_id, id)`, id do cliente; remover marca `removed_at`.
- `app.favorite_foods`: PK `(account_id, food_id)`, `is_favorite` booleano (semântica de *set*).

## API (`/api/v1`)
- `GET /agenda/reminders`; `PUT|DELETE /agenda/reminders/:id` (upsert idempotente; remover é idempotente e o mesmo ID pode voltar).
- `GET /favorites/foods`; `PUT /favorites/foods/:foodId` com `{ favorite }` (retry não inverte o estado).

## Fora do escopo
- Trocar as telas/`localStorage` pela API: etapa final da F3.
