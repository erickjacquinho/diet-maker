# F2 — DEK por conta e codec de campo cifrado (S1)

Origem: [Decisão 15 §5](../../refs/dieta-db/15-esquema-transferencia-backend-supabase.md). Depende da F0.

## Escopo
- `private.account_keys` (DEK envolvida pela KEK, RLS `FORCE` por conta; grants mínimos, sem `DELETE`).
- `field-codec`: layout `0x01 ‖ key_version ‖ IV ‖ ciphertext ‖ tag`, AAD `nutridiet:v1|tabela.coluna|conta|linha|versão`.
- `account-keys`: DEK criada sob demanda na transação da conta, cache LRU (5 min, buffers zerados), `rewrapAccountKeys` para rotação de KEK, `createSealer` para os repositórios da F3.

## Critérios de aceite
- Adulteração e troca de linha, coluna ou conta falham a decifragem (`tests/server/field-codec.test.ts`).
- Rewrap preserva a leitura de dados já cifrados.
- Migration `20261029120000_account_keys.sql` validada no Supabase **local** antes de qualquer aplicação remota (pendente; exige confirmação do usuário).

## Fora do escopo
Rotação da DEK em lote, índice cego de telefone, crypto-shredding (job administrativo; o runtime não tem `DELETE`).
