# 15 — Registro humano de componentes

O arquivo executável é [`components/registry.json`](./components/registry.json). Este resumo facilita revisão; não cria uma segunda fonte de IDs, consumers ou status.

## Snapshot — 31 de julho de 2026

| Medida | Valor |
| --- | ---: |
| Fontes TSX atuais | 39 |
| Entradas atuais | 39 |
| Propostas sem fonte | 4 |
| Categorias estáveis | 11 |
| Perfis documentais | 43 |
| Alterações de layer pendentes | 3 |

## Distribuição por layer-alvo

| Layer | Entradas atuais | Propostas |
| --- | ---: | ---: |
| `ui` | 14 | 1 (`Textarea`) |
| `atom` | 6 | 2 (`Spinner`, `Skeleton`) |
| `molecule` | 13 | 1 (`FormField`) |
| `organism` | 3 atuais + 3 migrações-alvo | 0 |
| `template` | 2 | 0 |

## Distribuição por categoria

| Category ID | Responsabilidade | Exemplos canônicos |
| --- | --- | --- |
| `actions` | comando imediato | Button, IconButton, SidebarQuickActions |
| `fields` | entrada/edição/busca | Input, TacoSearchInput, Textarea proposta |
| `selection` | escolha persistente | Select, Tabs, DietModeSwitcher |
| `navigation` | destinos/contexto | SidebarNav e partes |
| `surfaces` | agrupamento local | Card, ScrollArea, Separator |
| `data-display` | dados/identidade genéricos | Table, Avatar, PatientBadgeHeader |
| `feedback` | status/severidade | Badge |
| `overlays` | conteúdo temporário | Dialog, Sheet, Popover, menus e modais |
| `loading` | espera/progresso | ProgressBar, Spinner proposta, Skeleton proposta |
| `nutrition-domain` | macros/calorias/alimentos/refeições | MacroMetricCard, MealCardContainer |
| `structure` | shell/template/grid | AppLayoutShell, DietBuilderTemplate |

## Propostas

| ID | Target layer | Categoria | Status |
| --- | --- | --- | --- |
| `ui-textarea` | `ui` | `fields` | `proposed` / `specified` |
| `atom-spinner` | `atom` | `loading` | `proposed` / `specified` |
| `atom-skeleton` | `atom` | `loading` | `proposed` / `specified` |
| `molecule-form-field` | `molecule` | `fields` | `proposed` / `specified` |

## Migrações registradas

| ID | Current layer | Target layer | Lifecycle |
| --- | --- | --- | --- |
| `organism-diet-mode-switcher` | `molecule` | `organism` | `migration-required` |
| `organism-food-search-modal` | `molecule` | `organism` | `migration-required` |
| `organism-read-only-diet-modal` | `molecule` | `organism` | `migration-required` |

As partes da sidebar continuam molecules e `SidebarNav` continua organism; a relação é registrada no campo `consumers` e não constitui nova migração de layer.

## Como consultar uma entrada

1. Localize o `id` no JSON.
2. Confirme `primaryCategory` e leia o documento da categoria.
3. Leia o `profile` para anatomia, variantes e estados particulares.
4. Confirme `sourceFiles`, exports, consumers, `primitiveBase`, lifecycle e `specStatus`.
5. Execute `npm run verify:design-system` após qualquer alteração.

Entradas propostas não entram na baseline atual; `homologated` significa documentação completa, não conformidade visual do código.
