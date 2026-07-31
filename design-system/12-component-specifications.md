# 12 — Índice de especificações de componentes

Este documento é um índice humano. Contratos compartilhados vivem em `design-system/components/categories/`; particularidades de cada família vivem em `design-system/components/profiles/`. Não há uma segunda tabela normativa neste arquivo.

## Fonte de verdade

| Necessidade | Fonte canônica |
| --- | --- |
| Categoria visual, estados, tokens e geometria | [contrato de categoria](./components/category-contract.md) e [categorias](./components/categories/) |
| Particularidade de uma família | [contrato de perfil](./components/component-profile-contract.md) e [perfis](./components/profiles/) |
| ID, layer, traits, source, exports e status | [registry.json](./components/registry.json) |
| Lifecycle e decisão | [category-decisions.md](./components/category-decisions.md) e [governança](./14-lifecycle-and-governance.md) |
| Findings e gate | [audit-contract.md](./components/audit-contract.md) e `npm run verify:design-system` |

## Categorias

| ID | Documento |
| --- | --- |
| `actions` | [actions.md](./components/categories/actions.md) |
| `fields` | [fields.md](./components/categories/fields.md) |
| `selection` | [selection.md](./components/categories/selection.md) |
| `navigation` | [navigation.md](./components/categories/navigation.md) |
| `surfaces` | [surfaces.md](./components/categories/surfaces.md) |
| `data-display` | [data-display.md](./components/categories/data-display.md) |
| `feedback` | [feedback.md](./components/categories/feedback.md) |
| `overlays` | [overlays.md](./components/categories/overlays.md) |
| `loading` | [loading.md](./components/categories/loading.md) |
| `nutrition-domain` | [nutrition-domain.md](./components/categories/nutrition-domain.md) |
| `structure` | [structure.md](./components/categories/structure.md) |

## Perfis por camada

O registry é a lista executável dos 43 perfis. Use os diretórios abaixo para navegação; não adicione família somente neste índice.

- `ui`: 15 famílias genéricas, incluindo compound exports Shadcn/Radix.
- `atoms`: 8 famílias de produto, incluindo Spinner e Skeleton propostos.
- `molecules`: 12 famílias de tarefa/contexto/domínio, incluindo FormField proposto.
- `organisms`: 6 famílias coordenadoras; três possuem `migration-required` de molecule para organism.
- `templates`: 2 estruturas de página.

## Regra de leitura

Leia fundamentos 01–08, depois a categoria principal, depois o perfil. Se houver divergência, o perfil não vence a categoria; registre uma ExceptionRecord formal ou altere o contrato compartilhado.

## Regra de implementação

Esta lista não homologa código visual. `specStatus: homologated` significa somente que o perfil documental está completo e auditado; a migração de `src` é trabalho posterior.
