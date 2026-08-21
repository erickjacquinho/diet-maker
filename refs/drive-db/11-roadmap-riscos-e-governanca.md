# 11 — Roadmap, Riscos e Governança

## Fase 0 — Decisão

- Aprovar este conjunto.
- Criar ADR substituindo Zero-Cloud.
- Atualizar PRD canônico.
- Definir schemas v1 e browsers.

**Gate:** documentação consistente e plano aprovado.

## Fase 1 — Fundação local

- Ports e ModuleRegistry.
- Envelopes e schemas.
- IndexedDB transacional.
- SaveCoordinator/outbox.
- Status global.
- Cache offline do app shell.

**Gate:** operação sem Drive, crash tests aprovados, sem save clínico em localStorage.

## Fase 2 — Migração e portabilidade

- Migrar todas as chaves.
- Quarentena/relatório.
- `.diet` versionado.
- Backup integral/restauração.
- Rollback legado.

**Gate:** contagens reconciliadas e restauração em workspace vazio.

## Fase 3 — Drive

- Google Identity token model.
- Discovery/provision.
- Drive adapter/appProperties.
- Push/pull/Changes.
- Retry/reconexão.

**Gate:** dois computadores convergem sem concorrência.

## Fase 4 — Conflitos

- Stale revision.
- Conflict store/preservação.
- UI de resolução.
- Coordenação multiaba.
- Conta errada/permissões/remoções.

**Gate:** nenhuma sobrescrita silenciosa.

## Fase 5 — Hardening

- Otimizar batching/changes.
- Diagnóstico local.
- Runbooks.
- Segurança/privacidade.
- Homologação e rollout.

**Gate:** launch gates completos.

## Riscos técnicos

| Risco | Mitigação |
|---|---|
| Token expira | Save local continua; reconexão e outbox |
| Edição concorrente | Arquivo por agregado, revisão-base e conflito |
| Manifest hotspot | Manifest estável; índices reconstruíveis |
| Rate limit | Compactação e backoff com jitter |
| Arquivo manual inválido | Schema, checksum e quarentena |
| Conta errada | Sem criação/mesclagem silenciosa |
| IndexedDB cheio | Bloquear falso sucesso e exportar |
| Migration interrompida | Checkpoint/idempotência/backup |
| Exclusão acidental | Tombstone, trash e sem hard delete |
| Pasta compartilhada | Alerta e não compartilhar automaticamente |
| Schema futuro | Migrations e somente leitura |
| Google indisponível | Local-first e backup físico |
| Segredo no bundle | Somente client ID |
| Log com PII | Códigos seguros e testes |

## Riscos de produto

- Usuário confundir save local e remoto.
- Usuário acreditar que desconectar apaga dados.
- Pasta ser movida/renomeada/compartilhada.
- Workspace depender da conta Google conectada.
- Resolver conflito exigir decisão clínica.

Mitigar com estados claros, onboarding e runbook.

## Rollback

- Não remover legado inicialmente.
- Adapter legado somente leitura.
- Backup antes de migration/restauração.
- Falha remota retorna modo local.
- Schema futuro recusa edição em cliente antigo.
- Rollback de código não tenta downgrade automático.

## Documentação obrigatória

- ADR local-first + Drive.
- PRD canônico atualizado.
- Catálogo de schemas/versões.
- Política de migration.
- Runbook de recuperação.
- Matriz de erros Drive.
- Guia Google Cloud/Vercel.
- Aviso de privacidade.
- Guia export/restauração.
- Checklist go-live/rollback.

## Decisões abertas para o plano

- Biblioteca concreta IndexedDB.
- Biblioteca runtime schema.
- Tamanho de lote da outbox.
- Lease e teto do backoff.
- Extensão comercial do backup ZIP.
- Browsers desktop suportados.
- UI detalhada de conflito conforme design system.

Essas decisões não podem alterar dependência, segurança, idempotência ou preservação.

## Governança

- Mudança de decisão fixa exige ADR.
- Novo módulo atualiza inventário, migration e testes.
- Nova schema version exige fixture/migration.
- Novo scope exige revisão de segurança.
- Exceção temporária precisa de owner, prazo e remoção.
- PR não pode introduzir escrita direta em storage.
- Homologação produz relatório go/no-go.

## Critérios de conclusão

- [ ] Sem banco próprio.
- [ ] Sem autenticação interna.
- [ ] Drive representa workspace remoto.
- [ ] Save local transacional.
- [ ] Sync modular/idempotente.
- [ ] Todos os dados atuais migrados.
- [ ] Novos módulos não alteram sync engine.
- [ ] Conflitos clínicos preservados.
- [ ] Backup/restauração/rollback validados.
- [ ] Tokens e clínicos não passam pela Vercel.
- [ ] Testes de perda de dados aprovados.
- [ ] Documentação canônica atualizada.

## Referências técnicas

- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/workspace/drive/api/guides/folder
- https://developers.google.com/workspace/drive/api/guides/about-changes
- https://developers.google.com/workspace/drive/api/guides/change-overview
- https://developers.google.com/workspace/drive/api/guides/handle-errors
- https://developers.google.com/workspace/drive/api/guides/limits
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm

## Voltar

[index.md](./index.md)
