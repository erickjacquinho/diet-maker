# Data Model: Migração do Design System

## MigrationBaseline

Snapshot somente leitura antes da migração.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `capturedAt` | date | Data do primeiro checkpoint |
| `sourceFiles` | path[] | Fontes TS/TSX/CSS/config cobertas |
| `routes` | path[] | Rotas e layouts do escopo |
| `legacyFindings` | LegacyFinding[] | Ocorrências com arquivo e linha |
| `registryRevision` | string | Commit da baseline documental |

## TokenContract

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | token ID | ID presente em `design-system/components/token-index.md` |
| `layer` | enum | `reference`, `semantic`, `component` |
| `valueSource` | path | Fundamento canônico correspondente |
| `consumers` | path[] | Arquivos autorizados |
| `deprecatedAliases` | string[] | Alias antigo que deve ser removido |

## TextStyleContract

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | style ID | Deve existir no sistema tipográfico canônico |
| `className` | string | Receita centralizada, sem valores arbitrários |
| `allowedElements` | string[] | Elementos/roles semânticos previstos |
| `allowedTones` | string[] | Tons por papel textual |
| `forbiddenAlternatives` | string[] | Classes/tamanhos não permitidos |

## ComponentMigrationRecord

| Campo | Tipo | Regra |
| --- | --- | --- |
| `componentId` | registry ID | Único e existente no registry |
| `currentLayer` | layer/null | Estado descoberto |
| `targetLayer` | layer | Camada desejada |
| `category` | category ID | Igual a `primaryCategory` |
| `stage` | enum | `foundation`, `ui`, `atom`, `molecule`, `organism-template`, `route`, `homologated` |
| `legacyRemaining` | integer | Deve ser zero para homologar |
| `validationEvidence` | path[] | Relatórios e testes do checkpoint |

## RouteAcceptanceRecord

| Campo | Tipo | Regra |
| --- | --- | --- |
| `route` | route path | Deve existir em `src/app` |
| `criticalStates` | state[] | Loading, empty, error, read-only e interações aplicáveis |
| `visualReview` | enum | `pending`, `approved`, `blocked` |
| `accessibilityReview` | enum | `pending`, `approved`, `blocked` |
| `functionalRegression` | enum | `pending`, `approved`, `blocked` |

## LegacyFinding

| Campo | Tipo | Regra |
| --- | --- | --- |
| `code` | stable enum | Código do auditor negativo |
| `rule` | legacy rule | Padrão proibido |
| `path` | path | Arquivo afetado |
| `line` | integer | Linha exata quando disponível |
| `severity` | enum | `error`, `warning` |
| `resolvedAt` | date/null | Obrigatório para fechar etapa |

## MigrationCheckpoint

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `MIG-###` | Sequencial e imutável |
| `stage` | stage | Uma etapa da ordem definida |
| `inputs` | path[] | Arquivos cobertos |
| `commands` | command[] | Validações executadas |
| `result` | enum | `blocked`, `passed`, `rolled-back` |
| `commit` | git revision | Obrigatório quando `passed` |

## State transitions

```text
legacy-inventoried → foundation-migrated → layer-migrated → route-migrated → homologated
          └────────────── failed/blocked ───────────────→ rolled-back → pending
```

Uma etapa só pode avançar com zero findings `error`, testes aplicáveis verdes, revisão visual/acessível aprovada e registro atualizado. `homologated` não pode ser atribuído a componente ou rota sem evidência.
