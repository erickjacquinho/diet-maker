# ADR-009: `.nutridiet` como Save Principal e Banco Local como Área de Trabalho

- **Status**: Substituído em 2026-10-30 (Decisão 15, F5)
- **Data**: 2026-09-17
- **Escopo**: Checkpoints do save da Conta, recuperação local e restauração

> **Substituído.** O `.nutridiet` deixou de ser o save principal e o banco PGlite
> no navegador foi removido. Todos os dados vivem na conta, no Supabase, e cada
> operação confirmada já está gravada no servidor quando a resposta chega, sem
> checkpoint, arquivo associado, grant de 8 h, catálogo de saves ou bloqueio de
> aba. O `.nutridiet` v1 (texto puro) e v2 (protegido) só é aceito por
> `POST /api/v1/imports/nutridiet`, uma vez, em conta vazia. Ver
> [Decisão 15](../../refs/dieta-db/15-esquema-transferencia-backend-supabase.md).
> O texto abaixo é o registro da decisão original.

## Contexto

As decisões anteriores descreviam o banco relacional no navegador como fonte
canônica dos dados salvos e o `.nutridiet` somente como backup manual. O fluxo
de saves da Conta exige que o arquivo seja o save principal portátil, enquanto
o navegador conserva o trabalho confirmado que ainda não chegou ao arquivo.

## Decisão

1. O `.nutridiet` é o save principal e autoritativo da Conta clínica. Ele contém
   um checkpoint lógico e completo dos dados confirmados. O payload segue em
   JSON versionado; em save vinculado a uma conta online, um envelope externo
   v2 AES-256-GCM protege esse payload. Um legado/desvinculado v1 permanece
   plaintext até que uma cópia protegida seja criada.
2. O banco PGlite persistido no IndexedDB é a área de trabalho local. Ele atende
   às consultas e mutações durante o uso e conserva as alterações confirmadas
   posteriores ao último checkpoint. Sua gravação não equivale a salvar o
   arquivo principal.
3. O status de checkpoint só avança depois que a escrita do arquivo termina
   com sucesso. Uma sincronização sem mudanças não escreve o arquivo; uma
   falha preserva a área local e deixa o checkpoint pendente. Uma mutação
   ocorrida durante a escrita continua pendente para a próxima sincronização.
4. Rascunhos não confirmados de dieta permanecem no armazenamento separado de
   drafts. Digitação e autosave de drafts não alteram o `.nutridiet`.
5. A restauração valida e importa o envelope lógico completo antes de trocar a
   área local; resumos derivados ausentes são reconstruídos. O arquivo não
   inclui arquivos físicos, migrations ou dados internos do IndexedDB.

## Consequências

- A perda ou limpeza do armazenamento do navegador pode remover alterações
  posteriores ao último checkpoint; o `.nutridiet` recupera o último save
  concluído.
- A interface diferencia gravação local de checkpoint do arquivo e não anuncia
  o save principal antes da confirmação de escrita.
- Tabelas internas de controle e resumos derivados pertencem ao banco local e
  não mudam o schema lógico portátil do `.nutridiet`.
- Esta decisão substitui somente as afirmações de autoridade do banco local em
  `refs/dieta-db/09-topologia-v1-local-first-e-conta-local.md` e
  `refs/dieta-db/10-motor-local-drizzle-e-migrations.md`; as decisões de motor,
  repositórios, transações e migrations permanecem vigentes.

## Conta online e limites de proteção

A [Decisão 12](../../refs/dieta-db/12-autenticacao-online-e-soberania-local.md)
adiciona identidade online e autorização do save sem mover dados clínicos para
o Supabase. Rascunhos permanecem no store local; o banco de trabalho IndexedDB
não recebe cifragem em repouso nesta feature. O envelope protegido não representa
cifra do dispositivo inteiro nem E2EE estrita. Consulte também as
[Decisões 11](../../refs/dieta-db/11-recuperacao-e-portabilidade-local.md) e
[13](../../refs/dieta-db/13-protecao-local-e-backup-simples.md) para formatos
legado e backup.
