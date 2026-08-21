# 05 — Persistência Local, Save Pipeline e Offline

## Princípio

Save local é a única confirmação síncrona da UI. Drive é consistência eventual. Rede lenta ou indisponível não pode interromper atendimento quando IndexedDB está saudável.

## Pipeline

```text
Comando do usuário
  ↓
Caso de uso
  ↓
Validação e normalização de domínio
  ↓
Validação runtime do módulo
  ↓
Transação IndexedDB
  ├── upsert do envelope
  └── enqueue/compactação da outbox
  ↓ commit
UI recebe "salvo localmente"
  ↓
SyncCoordinator processa quando possível
```

## Semântica de save

- Upsert por `workspaceId/moduleId/entityId`.
- A UI não aguarda Drive.
- A confirmação ocorre somente após `transaction.oncomplete` equivalente.
- Falha de validação não grava documento nem outbox.
- Falha da transação não pode emitir sucesso.
- Saves rápidos no mesmo documento podem ser compactados.
- A compactação preserva o primeiro `baseRemoteRevision` e o payload final.
- O estado em edição só vira documento quando o caso de uso aceita o comando.
- Drafts precisam de módulo/política própria.

## Banco IndexedDB

Nome sugerido: `nutridiet-workspace`.

| Object store | Chave | Responsabilidade |
|---|---|---|
| `documents` | `[workspaceId,moduleId,entityId]` | Envelopes válidos |
| `outbox` | `operationId` | Operações pendentes/retry/falha |
| `remoteRefs` | chave lógica do documento | Drive file ID e revisão |
| `syncState` | `workspaceId` | Cursor, status e lease |
| `conflicts` | `conflictId` | Versões e resolução |
| `quarantine` | `quarantineId` | Conteúdo inválido |
| `migrations` | `migrationId` | Checkpoints retomáveis |
| `device` | `deviceId` | Identidade local anônima |

## Transações obrigatórias

- Documento + outbox.
- Tombstone + outbox de trash.
- Resolução de conflito + nova outbox.
- Aplicação de lote remoto + remote refs.
- Cursor remoto só avança após commit do lote.
- Migration checkpoint só avança após commit da etapa.

## Outbox

Cada operação contém no mínimo:

```ts
interface SyncOperation {
  operationId: string;
  workspaceId: string;
  moduleId: string;
  entityId: string;
  kind: 'create' | 'update' | 'trash';
  baseRemoteRevision: string | null;
  localLogicalRevision: number;
  status: 'pending' | 'leased' | 'retry' | 'failed';
  attemptCount: number;
  nextAttemptAt: string | null;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  createdAt: string;
}
```

O payload canônico permanece em `documents`; a outbox referencia a revisão local para evitar cópia redundante.

## Compactação

Pode compactar `update + update` do mesmo documento ainda não enviado. Não pode:

- atravessar operação `trash`;
- trocar `operationId` já confirmado remotamente;
- perder base revision;
- compactar documentos diferentes;
- ocultar conflito já detectado.

## Exclusão

1. Marcar `deletedAt` localmente.
2. Ocultar da listagem normal, mantendo recuperação.
3. Criar outbox `trash`.
4. Mover arquivo remoto para lixeira.
5. Não executar hard delete automático no MVP.
6. Paciente com filhos exige inventário e confirmação.

Logout/revogação nunca causa exclusão.

## Falhas locais

### Quota ou IndexedDB indisponível

- Bloquear falsa confirmação.
- Manter formulário em memória enquanto possível.
- Mostrar erro global.
- Oferecer exportação dos dados ainda acessíveis.
- Não tentar Drive como atalho que ignore a transação local.

### Documento inválido

- Não substituir versão válida.
- Registrar código seguro.
- Se veio de import/Drive, enviar à quarentena.
- Se veio da UI, retornar erro de validação ao caso de uso.

## Offline

- Leitura/escrita de domínio usa IndexedDB.
- Outbox sobrevive a refresh/crash.
- App shell e assets essenciais devem ser cacheados por service worker.
- Atualização do service worker não altera IndexedDB.
- Retomar sync em `online`, bootstrap ou `Sincronizar agora`.
- Não depender de `beforeunload`.
- Com navegador totalmente fechado não há garantia de sync em background.

## Inicialização

1. Abrir IndexedDB e executar migration local.
2. Validar ModuleRegistry.
3. Carregar identidade do dispositivo.
4. Recuperar leases expirados.
5. Carregar workspace local.
6. Renderizar estado local.
7. Inicializar autorização e coordenador remoto sem bloquear UI.

## Leitura

- Listas e busca vêm de índices IndexedDB.
- Componentes não fazem scan de arquivos.
- Query objects pertencem à aplicação.
- Dados remotos só aparecem após validação e commit local.

## Critérios

- Save p95 ≤ 150 ms.
- Crash após confirmação mantém documento/outbox.
- Documento/outbox nunca divergem por meia transação.
- Offline permite o mesmo comando de domínio.
- Nenhum dado clínico novo entra em `localStorage`.

## Dependências

- [04-arquitetura-limpa-e-contratos.md](./04-arquitetura-limpa-e-contratos.md)
- [07-sincronizacao-e-conflitos.md](./07-sincronizacao-e-conflitos.md)
- [10-testes-desempenho-e-homologacao.md](./10-testes-desempenho-e-homologacao.md)
