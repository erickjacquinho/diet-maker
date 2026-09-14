# Research — Backup manual simples

**Feature**: [spec.md](./spec.md)
**Data**: 2026-09-12

## Decision 1 — Um envelope lógico, reutilizando o schema existente

- **Decision**: O arquivo `.nutridiet` será JSON UTF-8 versionado com `appId`,
  `formatVersion`, `schemaVersion`, `exportedAt` e arrays das 17 tabelas
  canônicas já existentes.
- **Rationale**: Preserva IDs, relações, snapshots, históricos e arquivados sem
  criar dump físico, SQL executável ou um segundo schema de banco.
- **Chosen values**: `appId = "nutridiet-local-pro"`, `formatVersion = 1` e
  `schemaVersion = "4"`.
- **Rejected**: exportar somente modelos de tela, dump físico ou manter o
  schema diet-only como formato concorrente.

## Decision 2 — Um port e um adapter transacional

- **Decision**: Um port de backup separa a aplicação do adapter PGlite/Drizzle.
  O adapter lê e substitui as linhas da Conta em transações usando
  `src/lib/infrastructure/local-db/schema.ts`.
- **Rationale**: Mantém a fronteira arquitetural existente e evita reimplementar
  cada repositório de domínio ou criar uma migração de banco sem necessidade.
- **Export**: leitura consistente de todas as tabelas da Conta.
- **Restore**: validação em memória, deleção reversa de dependências e inserção
  em ordem de dependência na mesma transação.

## Decision 3 — Validação estrita antes da escrita

- **Decision**: Rejeitar antes da transação qualquer envelope malformado,
  incompatível ou com chaves desconhecidas; exigir exatamente a Conta local
  (`local-account`), IDs únicos, relações válidas, escopos coerentes e uma única
  dieta `ACTIVE` por paciente.
- **Rationale**: Reduz estados parciais e torna o `formatVersion = 1`
  determinístico. O conteúdo é tratado somente como dados; nada é executado.

## Decision 4 — Drafts continuam no IndexedDB

- **Decision**: O backup nunca lê nem escreve o conteúdo dos drafts. O único
  acréscimo necessário ao draft store é uma consulta por Conta para bloquear a
  restauração quando existir qualquer draft editável.
- **Rationale**: Na aplicação atual, abrir um editor já cria um draft persistido;
  essa presença cobre edição aberta e torna desnecessário um registro global de
  writes pendentes. O usuário salva ou descarta o draft antes de restaurar.
- **Rejected**: incluir, apagar silenciosamente ou criar um coordenador global
  de pendências.

## Decision 5 — Reutilizar a barra lateral e o Dialog existente

- **Decision**: Conectar exportar/restaurar aos callbacks existentes de
  `SidebarQuickActions`/`SidebarUserProfile` através de
  `SidebarNavigationAdapter.tsx`, usando o primitivo `Dialog` já disponível para
  confirmação. Os rótulos `.diet` passam a `.nutridiet`.
- **Rationale**: Evita nova rota, novo organismo, nova API visual ou fluxo
  paralelo. O adapter de app pode controlar input de arquivo, estados e reload;
  os componentes existentes permanecem responsáveis apenas pela apresentação.
- **UI**: exportação baixa diretamente; restauração seleciona, valida, mostra
  aviso de substituição total e confirma antes da transação.

## Decision 6 — Recarregar o runtime após o commit

- **Decision**: Depois da restauração, invalidar o runtime compartilhado e
  recarregar a página/contexto antes de liberar novas edições.
- **Rationale**: Elimina referências derivadas da base anterior sem sincronizar
  manualmente todas as rotas.

## Decision 7 — Validação proporcional

- **Decision**: Cobrir domínio/validação, integração transacional, fronteira de
  persistência, UI e uma jornada browser offline; manter os gates gerais do
  projeto.
- **Rationale**: O risco central é integridade/rollback, não volume de servidor.
  Não serão criados testes duplicados por camada nem certificação de volume fora
  da V1.
