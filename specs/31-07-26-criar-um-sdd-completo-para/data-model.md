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

## Execution records

### MigrationBaseline — MIG-001

| Campo | Valor |
| --- | --- |
| `capturedAt` | `2026-07-31T16:56:21-03:00` |
| `sourceFiles` | 82 |
| `routes` | 10 |
| `componentSources` | 39 |
| `imports` | 293 |
| `legacyFindings` | 4389 |
| `registryRevision` | `b5b9cde5f56df28022a16688965340da4ad1e768` |
| `evidence` | `.artifacts/design-system/design-system-baseline.json` (SHA-256 `c9385f920510f9f934048232a0e573b1cbd14a3788a52b14ae0933b25d7eb281`) |

Estado inicial: `legacy-inventoried`. Nenhum componente ou rota é declarado conforme neste checkpoint. O rollback de MIG-001 retorna à revisão `b5b9cde5f56df28022a16688965340da4ad1e768`; alterações preexistentes fora do escopo não fazem parte do checkpoint.

### MigrationCheckpoint — MIG-001

| Campo | Valor |
| --- | --- |
| `stage` | `setup` |
| `inputs` | baseline executável, registry, 39 fontes de componentes e 10 rotas |
| `commands` | baseline ×2, `npm run type-check`, `npm run lint`, `npm test`, `npm run verify:links`, `npm run audit:atomic-design` |
| `result` | `passed` |
| `rollbackRevision` | `b5b9cde5f56df28022a16688965340da4ad1e768` |
| `evidence` | `.artifacts/design-system/stage-0-gate.json` |

Os 42 warnings de lint e 228 achados do auditor Atomic são dívida inventariada do runtime legado; os comandos retornaram sucesso no Stage 0 e esses achados permanecem bloqueantes para homologação das fases de componentes/rotas.

### TokenContract e TextStyleContract — MIG-002

- Runtime público único: `src/design-system/index.ts`.
- Valores reference, semantic/system e component: `src/design-system/tokens.css`.
- Catálogo fechado: 45 text styles nomeados, com tipografia, peso, line-height e tone definidos centralmente.
- Recipes iniciais: Button/IconButton, Input/Textarea, Badge, Card e TableRow, todas com variantes fechadas.
- Fachada `src/design-system/tokens.ts`: temporariamente `deprecated`, sem valores visuais próprios, mantida apenas para a rota histórica até o Stage 7.
- Aliases globais/Tailwind/Shadcn: derivados das CSS variables canônicas, sem dark mode, Inter, palette `warm` ativa ou reset global de sombra.

Estado após MIG-002: `foundation-migrated`.

### MigrationCheckpoint — MIG-002

| Campo | Valor |
| --- | --- |
| `stage` | `foundation` |
| `commands` | auditor LEG restrito, `npm run type-check`, `npm run lint`, `npm test`, `npm run verify:links`, `npm run verify:design-system` |
| `result` | `passed` |
| `tests` | 92 passed; 21 contratos novos de foundation/auditor |
| `legacyScope` | 3 arquivos, zero findings |
| `evidence` | `.artifacts/design-system/stage-1-foundation.json` |

Os warnings de camadas superiores permanecem fora do escopo de MIG-002 e não autorizam avançar seus próprios checkpoints sem migração e evidência.
