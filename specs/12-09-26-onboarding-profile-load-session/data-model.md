# Data Model: Profile, sessão e `.nutridiet`

```text
.nutridiet durável ⇄ sessão da aba (PGlite memory:// + handle) ⇄ drafts em memória
```

## Profile / Account

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Gerado na criação e preservado no load. |
| `displayName` | string | Obrigatório e normalizado; não pode ser vazio. |
| `phone` | string ou null | Opcional; normalizado quando informado. |
| `createdAt`, `updatedAt` | ISO string | Metadados do profile. |

Não existem campos `host`, `origin`, `port`, `browser`, caminho do arquivo ou token. O `FileSystemFileHandle` não é domínio.

## ActiveSession

Profile e dados são exclusivamente em memória; a associação do arquivo possui uma referência técnica separada e não clínica:

- `status`: `empty | busy | active | paused`;
- `profile` e `accountId`;
- runtime/repositórios PGlite `memory://`;
- handle e nome do arquivo, se associado;
- `syncState`: `unbound | syncing | synced | paused` e último erro/status;
- `hydration`: `pending | ready`;
- `resumeFileName`: nome apresentado quando o handle precisa de autorização novamente.

`active` e `paused` liberam a interface. `busy` bloqueia ações concorrentes. `empty` redireciona para `/Home`. Profile, runtime, dados, syncState e drafts não são serializados ou recuperados do host.

O `FileSystemFileHandle` não entra no modelo nem no envelope. O adaptador browser-only
pode persistir o handle e o nome do arquivo no IndexedDB da mesma origem; isso não
persiste profile, dados confirmados, drafts ou runtime e não funciona como fallback
de conteúdo.

## NutriDietSave

O envelope existente continua sendo a unidade durável: metadados, account, objetivos, pacientes ativos/arquivados, avaliações, acompanhamentos, dietas, históricos, catálogo, receitas e refeições prontas. O handle, syncState e drafts ficam fora do envelope.

Rows preservam IDs e `accountId`; o load não remapeia relações. O validador confere `appId`, `formatVersion`, `schemaVersion`, chaves, tipos, IDs únicos e referências entre tabelas antes de qualquer mutação.

## Estados essenciais

```text
empty ── criar + escolher + escrever ──▶ active/synced
empty ── carregar + validar + importar ─▶ active/synced ou active/paused
active ── confirmar ──▶ syncing ──▶ synced
active ── falha de escrita ──▶ paused
paused ── reautorizar/selecionar + escrever ──▶ synced
active/paused ── reload/fechar na mesma origem ──▶ restoring ──▶ active/paused ou empty
qualquer estado ── nova origem ──▶ empty
```

Cancelar ou falhar o primeiro save não libera uma sessão parcial. Falhar depois de uma sessão já carregada preserva o trabalho em memória e mostra `paused`.

## Invariantes

1. Somente `/Home` é pública; nenhuma rota interna mostra conteúdo sem sessão.
2. Não há auto-create de `local-account`/`Meu consultório`.
3. O `accountId` ativo é o mesmo do envelope e das consultas.
4. Restore falho não troca a sessão anterior.
5. Cada confirmação explícita tenta uma escrita completa; falha nunca cai silenciosamente em storage do host.
6. A lista deve mostrar `Jacques Regiani` quando o fixture válido o contém.

## Compatibilidade

`schemaVersion` novo: `5`; `formatVersion`: `1`. Schema 4 sem telefone é aceito, normalizado para `phone: null` e atualizado no próximo save. Versões futuras, outro appId, JSON truncado e relações inválidas são rejeitados antes da importação.
