# F4 — Importação do `.nutridiet` (Decisão 15 §7)

`POST /api/v1/imports/nutridiet` transfere o conteúdo de um save local para a conta online, numa única transação.

## Contrato
- Corpo: o arquivo **como está** (`application/octet-stream`, até 4 MB — abaixo do limite de corpo da Vercel). CSRF e sessão como nas demais rotas.
- `Idempotency-Key`: SHA-256 (hex) do arquivo; o servidor recalcula e rejeita (400) se divergir. Repetir o mesmo arquivo devolve o resumo guardado (`replayed: true`) sem regravar.
- `X-Confirm-Plaintext-Import: true`: obrigatório para o legado v1 (JSON sem cifra); sem ele responde 422 `CONFIRMATION_REQUIRED`.
- Resposta: só contadores por entidade e o formato lido; nenhum conteúdo importado volta ao cliente.

## Servidor
- **v2 (protegido):** localiza o save em `private.saves` pelo dono da sessão, confere a prova de vínculo, desembrulha a chave e decifra no servidor (AES-256-GCM com AAD do envelope). Save inexistente, de outro dono ou prova errada: 404 uniforme; adulteração: 422 `DECRYPTION_FAILED`.
- **Validação:** `validateBackupEnvelope` (schema lógico versionado + migrações determinísticas em memória) antes de qualquer escrita.
- **Gravação:** conta vazia obrigatória (409 `ACCOUNT_NOT_EMPTY`), sem mesclagem. IDs locais viram UUIDs determinísticos (`importedUuid`), e os snapshots (alimentos próprios, receitas, refeições prontas) são remapeados. S1 (identificação do paciente, comentários do acompanhamento) é cifrado com a DEK da conta.
- **Auditoria/idempotência:** `app.import_runs` (`SELECT`/`INSERT` apenas).

## Fora do escopo
- `account` e `objectiveOptions` do save não têm tabela no servidor ainda: são contados em `skipped`.
- Rascunhos de dieta ficam no IndexedDB, fora do `.nutridiet`.
- UI de importação, limpeza opcional do IndexedDB/PGlite e destruição da DEK do save após o período de retenção (`private.saves` desativado ao fim da transição): F5.
