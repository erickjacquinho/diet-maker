# F3 — Dietas e rascunhos no servidor

Terceira parte da F3 (Decisão 15). A prescrição é S2 (em claro, ligada só ao UUID do paciente).

## Dados
- `app.diet_plans`: cabeçalho em colunas (nome, modo, status, versão, datas) e o documento (variações → refeições → opções → itens com snapshot nutricional) em `variations jsonb`. Índice único parcial garante uma dieta `ACTIVE` por paciente. FK composta `(account_id, patient_id)`. Sem `DELETE`.
- `app.diet_drafts`: um rascunho por `(conta, paciente, rota)`, com revisão, estado e payload. Descartar marca `discarded_at` e limpa o payload (sem `DELETE`).
- RLS `FORCE` por conta nas duas tabelas.

## API (`/api/v1/patients/:id`)
- `GET /diets`, `GET /diets/:dietId`
- `POST /diets/confirm` — idempotente pelo `dietId` do cliente; sem base cria e rebaixa a vigente para `SNAPSHOT`; com `baseDietId`/`baseDietVersion` atualiza a vigente se a versão ainda bater (409 `VERSION_CONFLICT` senão); descarta o rascunho de `draftRouteId` na mesma transação.
- `GET|PUT|DELETE /diet-drafts/:routeId` (`nova` ou UUID) — `PUT` aceita revisão igual ou maior; menor responde `SUPERSEDED`.

## Regras
- `validateDietForConfirmation` do domínio roda no servidor (422 com `reason`); paciente arquivado não recebe prescrição nem rascunho.
- Documento validado por parser estrito (campos desconhecidos rejeitados em todos os níveis, decimais como string).

## Fora do escopo desta parte
- Resumos de histórico por variação (hoje calculados na leitura local) e paginação do histórico.
- Invalidar rascunhos ao arquivar paciente (`INVALIDATED_BY_PATIENT_ARCHIVE` existe no esquema, mas nada o grava ainda).
- Trocar as telas para a API.
