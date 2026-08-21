# 03 — Modelo do Perfil, Módulos e Integridade

## Workspace

Workspace é o conjunto completo de dados de um perfil NutriDiet. Possui `workspaceId` opaco e independe de e-mail, nome ou caminho textual.

## Módulos iniciais

| Module ID | Conteúdo | Origem atual | Unidade remota |
|---|---|---|---|
| `professional-profile` | Nome, registro, contato, clínica, timezone, locale e documentos | Incompleto | Um documento |
| `workspace-settings` | Versões, flags e configuração sem tokens | Novo | Um documento |
| `patients` | Cadastro, metas, objetivos e eventos | `nutridiet_patients` | Um por paciente |
| `assessments` | Avaliações corporais | `nutridiet_assessments_<patientId>` | Um por avaliação |
| `diets` | Dietas, variações, refeições, itens e snapshots | `nutridiet_diets_<patientId>` | Um por dieta |
| `recipes` | Receitas, ingredientes e instruções | `nutridiet_recipes` | Um por receita |
| `presets` | Presets e macros | `nutridiet_presets` | Um por preset |
| `ready-meals` | Refeições reutilizáveis | `nutridiet_ready_meals` | Um por bloco |
| `custom-foods` | Alimentos próprios | `nutridiet_custom_foods` | Um por alimento |
| `favorites` | IDs TACO/custom | `nutridiet_favorite_foods` | Um conjunto |
| `custom-objectives` | Objetivos próprios | `nutridiet_custom_objectives` | Um conjunto |
| `assets` | Logo e avatar | Novo | Um por asset |
| `ui-preferences` | Sidebar, visualização e defaults | Novo | Global ou dispositivo |

## Dados que não vão ao Drive

- TACO distribuída no bundle.
- Tokens, cookies, secrets ou credenciais.
- Formulário transitório não submetido, salvo draft explícito.
- Filtros/abas pertencentes à URL.
- Caches e índices reconstruíveis.
- Derivados, salvo snapshot clínico.
- Logs com PII/payload.

## Envelope

```ts
interface DocumentEnvelope<T> {
  app: 'nutridiet';
  formatVersion: 1;
  moduleId: string;
  schemaVersion: number;
  workspaceId: string;
  entityId: string;
  logicalRevision: number;
  createdAt: string;
  updatedAt: string;
  updatedByDeviceId: string;
  lastOperationId: string;
  deletedAt: string | null;
  checksum: string;
  payload: T;
}
```

## Versões

| Campo | Função |
|---|---|
| `formatVersion` | Envelope comum |
| `schemaVersion` | Payload do módulo |
| `logicalRevision` | Revisão lógica NutriDiet |
| `headRevisionId` | Revisão externa Drive em metadado local |
| `lastOperationId` | Última operação aplicada |

## Schema e migrations

- Runtime validation obrigatória.
- Zod ou equivalente recomendado.
- Módulo declara versão atual.
- Migration sequencial, pura, determinística e com fixture.
- Versão futura abre somente leitura.
- Sem downgrade automático.
- Preservar remoto antes de gravar migration.

## Identidade e tempo

- IDs novos usam UUID.
- Relações usam IDs, nunca nomes.
- Arquivos não contêm PII no nome.
- Identidade lógica: `workspaceId/moduleId/entityId`.
- Datas em ISO 8601 UTC.
- `createdAt` imutável; `updatedAt` muda em alterações.
- Data localizada não pode ser chave.

## Integridade

- Dieta/avaliação exigem `patientId` válido ou referência pendente de importação.
- Excluir paciente não elimina filhos definitivamente.
- Importação valida referências antes do commit.
- Favorito inexistente é reportado.
- Asset ausente não invalida todo o workspace.
- Snapshot histórico preserva nutrientes emitidos.
- Mudança na TACO não reescreve prescrição.
- Busca/ordenação usam índices locais.

## Checksum

- SHA-256 de JSON canônico do payload.
- Divergência envia à quarentena.
- Checksum detecta corrupção, não substitui autorização/criptografia.
- Serializer deve ser determinístico.

## Contrato do módulo

```ts
interface PersistenceModule<T> {
  readonly id: string;
  readonly currentSchemaVersion: number;
  validate(input: unknown): T;
  serialize(value: T): unknown;
  deserialize(input: unknown): T;
  migrate(input: unknown, fromVersion: number): T;
  getRemotePath(value: T, context: PathContext): RemotePath;
  resolveConflict(input: ConflictInput<T>): ConflictDecision<T>;
}
```

Registry é imutável após bootstrap, rejeita ID duplicado e migration com lacuna.

## Novo módulo

1. Definir agregado/invariantes.
2. Criar schema v1.
3. Registrar serializer/checksum.
4. Definir path sem PII.
5. Definir conflito.
6. Definir export/import.
7. Adicionar contract tests.
8. Atualizar inventário/migração.
9. Homologar sem alterar sync engine.

## Critérios

- Todos os dados atuais mapeados.
- Todo remoto usa envelope.
- Todo módulo possui schema/migration.
- Token não pode ser módulo.
- Índices são reconstruíveis.
- Falha de módulo não bloqueia os demais.

## Continue

- [04-arquitetura-limpa-e-contratos.md](./04-arquitetura-limpa-e-contratos.md)
- [08-migracao-importacao-e-backup.md](./08-migracao-importacao-e-backup.md)
