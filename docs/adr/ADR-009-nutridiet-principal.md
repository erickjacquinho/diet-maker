# ADR-009: `.nutridiet` como Save Principal e Banco Local como Área de Trabalho

- **Status**: Aceito e implementado
- **Data**: 2026-09-17
- **Escopo**: Checkpoints do save da Conta, recuperação local e restauração

## Contexto

As decisões anteriores descreviam o banco relacional no navegador como fonte
canônica dos dados salvos e o `.nutridiet` somente como backup manual. O fluxo
de saves da Conta exige que o arquivo seja o save principal portátil, enquanto
o navegador conserva o trabalho confirmado que ainda não chegou ao arquivo.

## Decisão

1. O `.nutridiet` é o save principal e autoritativo da Conta. Ele contém um
   checkpoint lógico e completo dos dados confirmados, em JSON, que pode ser
   aberto e restaurado em outro perfil compatível.
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
