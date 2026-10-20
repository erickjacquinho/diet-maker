# Estados e dados preservados

Nenhuma entidade persistente, campo, migration ou formato novo.

| Estado existente | Papel no remanejamento |
| --- | --- |
| Conta anônima/incompleta/pronta/indisponível | Gate do dashboard e módulos; validação no servidor |
| ProfileSessionSnapshot.runtime | Disponibilidade clínica; não exigido para renderizar dashboard |
| status empty/active/paused/busy/locked | Semântica preservada; locked conserva proteção/preservação |
| syncState unbound/syncing/pending/synced/paused | Feedback e recuperação sem alterar checkpoint |
| Catálogo saveId/label/createdAt | Dashboard; manter paginação e identidade |
| Associação ownerId/saveId e localização | Manter conta, autorização, arquivo e permissão |
| Rascunhos e backups | Manter confirmação, restauração, cifra e substituição |

Único estado novo: boolean local `settingsOpen` no adapter. Começa fechado, abre por Configurações e fecha pelo Dialog. Não é persistido, não altera URL, não faz requisições e não toca arquivo.

Referências locais ao botão do perfil (na molécula e no adapter) permitem devolver foco ao fechar o Dialog. Não são dados de conta nem persistência nova.

Transições: conta pronta -> dashboard; dashboard + arquivo autorizado -> módulos; módulo sem arquivo -> dashboard; `/saves` e `/home` -> dashboard. Abrir arquivo não força saída do dashboard.
