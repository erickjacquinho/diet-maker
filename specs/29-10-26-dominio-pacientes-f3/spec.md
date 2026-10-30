# F3 — Pacientes no servidor (primeiro módulo)

Origem: [Decisão 15 §4–6](../../refs/dieta-db/15-esquema-transferencia-backend-supabase.md). Depende de F1 (`defineEndpoint`) e F2 (`createSealer`).

## Entregue
- `app.patients` (PK `(account_id, id)`, RLS `FORCE`, sem `DELETE`); identificação S1 em `sensitive` cifrado, medidas/metas/gênero S2 em claro.
- Rotas: `POST /patients` (ID estável, idempotente), `POST /patients/search`, `GET|PATCH /patients/:id` (`If-Match`), `POST /patients/:id/archive|restore`.
- Contratos estritos em `src/lib/contracts/patients.ts`; cliente em `src/lib/api-client/patients.ts`.
- Testes (PGlite com papel `app_runtime`): RLS entre contas, WITH CHECK, sem contexto lê zero linhas, sem DELETE, versão otimista, ciphertext movido de linha falha.

## Decisões
- Ordenação da listagem por nome nesta etapa; ordenação por retorno/atividade volta com acompanhamento e dietas (dependem de módulos seguintes).
- A tela **ainda não** usa a API: avaliações, dietas e acompanhamento locais têm FK para o paciente no PGlite; trocar só pacientes quebraria essas FKs. A troca das telas acontece quando os módulos dependentes migrarem.

## Pendente
- Validar a migration no Supabase local (Docker indisponível nesta sessão) e remoto (requer confirmação).
- Teste de rota ponta a ponta com duas contas reais; `GET` paginado por cursor.
