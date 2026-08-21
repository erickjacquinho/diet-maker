# 04 — Arquitetura Limpa, Portas e Contratos

## Camadas

```text
Presentation
Next.js, React, status e dialogs
        ↓ commands/queries
Application
Use cases, SaveCoordinator, SyncCoordinator, Import/Export
        ↓ ports
Domain + Persistence Modules
Entidades, regras, schemas, serializers, migrations, policies
        ↓ implementations
Infrastructure
IndexedDB, Drive REST, Google Identity, arquivos e conectividade
```

## Regra de dependência

- `domain` não importa React, Next.js, IndexedDB ou Google.
- `application` depende de domínio/ports, não adapters.
- `infrastructure` implementa ports.
- `presentation` chama use cases, sem acessar adapters.
- módulos conhecem schemas próprios; sync conhece apenas envelope/descriptor.

## Layout recomendado

```text
src/
├── app/
├── components/
├── domain/
│   ├── profile/
│   ├── patients/
│   ├── diets/
│   ├── assessments/
│   └── library/
├── application/
│   ├── persistence/
│   │   ├── ports/
│   │   ├── save/
│   │   ├── sync/
│   │   ├── conflicts/
│   │   └── migration/
│   └── use-cases/
├── infrastructure/
│   ├── indexeddb/
│   ├── google-drive/
│   ├── google-identity/
│   ├── export-files/
│   └── connectivity/
├── persistence-modules/
│   ├── professional-profile/
│   ├── patients/
│   ├── assessments/
│   ├── diets/
│   └── ...
└── lib/
```

Nomes podem mudar no plano, mas fronteiras são normativas.

## Portas centrais

```ts
interface LocalDocumentStore {
  transaction<T>(work: (tx: LocalTransaction) => Promise<T>): Promise<T>;
  get(key: DocumentKey): Promise<StoredDocument | null>;
  list(query: LocalDocumentQuery): Promise<StoredDocument[]>;
}

interface RemoteDocumentStore {
  findWorkspace(): Promise<RemoteWorkspace[]>;
  provisionWorkspace(input: ProvisionInput): Promise<RemoteWorkspace>;
  getMetadata(ref: RemoteRef): Promise<RemoteMetadata>;
  download(ref: RemoteRef): Promise<Uint8Array>;
  create(input: RemoteCreateInput): Promise<RemoteWriteResult>;
  update(input: RemoteUpdateInput): Promise<RemoteWriteResult>;
  trash(ref: RemoteRef): Promise<void>;
  listChanges(cursor?: string): Promise<RemoteChangePage>;
}

interface OutboxRepository {
  enqueue(op: SyncOperation, tx: LocalTransaction): Promise<void>;
  claimBatch(limit: number, leaseMs: number): Promise<SyncOperation[]>;
  complete(id: string, result: RemoteWriteResult): Promise<void>;
  retry(id: string, retryAt: string, reason: SafeErrorCode): Promise<void>;
  fail(id: string, reason: SafeErrorCode): Promise<void>;
}
```

## Casos de uso obrigatórios

- `ConnectGoogleDrive`
- `DisconnectGoogleDrive`
- `ProvisionWorkspace`
- `HydrateWorkspace`
- `SaveEntity` internamente, exposto por casos específicos
- `DeleteEntity` com tombstone
- `FlushOutbox`
- `PullRemoteChanges`
- `ResolveConflict`
- `ExportPatientPackage`
- `ExportWorkspaceBackup`
- `RestoreWorkspaceBackup`
- `MigrateLegacyStorage`

Casos de domínio permanecem específicos, como `SaveDietPlan` e `RecordBodyAssessment`; o coordenador genérico é detalhe interno.

## SaveCoordinator

Responsável por:

1. localizar módulo;
2. executar validação;
3. normalizar envelope;
4. iniciar transação local;
5. persistir documento;
6. criar/compactar outbox;
7. confirmar commit;
8. emitir estado local salvo.

Não chama React, não conhece Drive concreto e não devolve sucesso antes do commit.

## SyncCoordinator

Responsável por:

- eleger/obedecer líder multiaba;
- reclamar lote com lease;
- chamar RemoteDocumentStore;
- classificar erro/retry;
- aplicar metadados remotos;
- detectar conflito;
- concluir operação idempotentemente.

Não conhece campos de paciente/dieta. Política específica vem do módulo.

## ModuleRegistry

- Construído no bootstrap.
- Imutável depois da validação.
- Rejeita ID duplicado.
- Rejeita schema version inválida.
- Verifica cadeia de migrations.
- Permite desabilitar módulo com erro sem corromper registry inteiro.
- Fornece descriptor ao save, sync, import/export e testes.

## Eventos internos tipados

- `EntitySavedLocally`
- `EntityQueuedForSync`
- `EntitySynced`
- `RemoteEntityApplied`
- `ConflictDetected`
- `SyncPausedForAuthorization`
- `MigrationFailed`

Não é obrigatório adotar event bus externo. Eventos não podem carregar PII para observabilidade.

## Erros

Erros atravessam fronteiras como códigos seguros:

- `validation_failed`
- `local_quota_exceeded`
- `authorization_required`
- `remote_permission_denied`
- `remote_not_found`
- `remote_rate_limited`
- `remote_unavailable`
- `schema_future_version`
- `checksum_mismatch`
- `conflict_detected`

Adapters preservam causa técnica localmente, mas UI/telemetria recebem código sanitizado.

## Testabilidade

- Use cases aceitam ports injetadas.
- Clock, ID generator, network status e hash são ports/funções substituíveis.
- Adapter Drive possui fake/contract test.
- Módulos usam mesma suíte de contrato.
- Domínio não depende de ambiente browser.

## Proibições

- `localStorage.setItem` em página/store de domínio.
- chamadas Drive em componente.
- importar Google SDK em domínio/aplicação.
- condicionar regra clínica ao status de rede.
- repository específico retornar tipos HTTP.
- sync engine usar `if (moduleId === 'patients')`.

## Critérios

- Grafo de dependências respeita direção.
- UI funciona com RemoteDocumentStore fake.
- Novo módulo não altera coordenadores.
- Erros externos não vazam para domínio.
- Ports possuem contract tests.

## Continue

- [05-persistencia-local-e-save.md](./05-persistencia-local-e-save.md)
- [06-google-drive-e-autorizacao.md](./06-google-drive-e-autorizacao.md)
