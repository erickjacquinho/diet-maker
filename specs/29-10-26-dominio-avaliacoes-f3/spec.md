# F3 — Avaliações e acompanhamento no servidor

Segunda parte da F3 (Decisão 15). Reaproveita `buildBodyAssessment` e `normalizeNextFollowUpInput` do domínio; o cálculo (US Navy) roda no servidor.

## Dados
- `app.body_assessments`: medidas e resultados em claro (S2), FK composta `(account_id, patient_id)` para `app.patients`, sem `DELETE`.
- `app.next_follow_ups`: datas em claro; `comments` (texto livre) cifrado como S1; cancelar o acompanhamento marca `cancelled_at` e apaga os comentários (sem `DELETE`).
- RLS `FORCE` por conta nas duas tabelas.

## API (`/api/v1`)
- `GET|POST /patients/:id/assessments` (criação idempotente por ID do cliente)
- `GET|PATCH /patients/:id/assessments/:assessmentId` (`If-Match`)
- `GET|PUT|DELETE /patients/:id/follow-up` (`PUT` sem `If-Match` cria; com `If-Match` substitui; `DELETE` exige `If-Match`)

## Fora do escopo desta parte
- Mover vários acompanhamentos de uma vez (agenda) e ordenação por atividade na lista de pacientes: voltam com agenda/dietas.
- Trocar as telas para a API: só quando dietas e biblioteca migrarem.

## Critérios
- Paciente arquivado não recebe avaliação nem acompanhamento (422); recurso de outra conta responde 404.
- Campos controlados pelo servidor (`accountId`, `version`, resultados, datas) são rejeitados na entrada.
