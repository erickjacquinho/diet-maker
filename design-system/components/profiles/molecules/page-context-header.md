# PageContextHeader

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-page-context-header` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/PageContextHeader.tsx` |
| Public exports | `PageContextHeaderProps` (type), `PageContextBreadcrumbItem` (type), `PageContextHeader` (component) |

## Purpose

Padronizar o cabeçalho de uma página que pertence a um fluxo hierárquico, reunindo retorno explícito, breadcrumb, título e ações opcionais em uma unidade reutilizável.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Não declara trait próprio; a responsabilidade contextual está neste perfil e no contrato da molécula.

## Specific anatomy

O root é um `header` com link de retorno, bloco textual contendo `Breadcrumb` e `h1`, e uma região opcional de ações. A ordem DOM é retorno, breadcrumb, título e ações.

## Allowed variants

Não há variantes visuais abertas. A composição varia apenas pelos dados de título, retorno, itens de breadcrumb e pelo slot opcional `actions`.

## Particular states

O link de retorno e os ancestrais do breadcrumb são navegáveis e mantêm foco visível. O último item é `BreadcrumbPage`, anunciado como atual e sem destino. Sem `actions`, nenhuma região vazia é renderizada.

## Composition

Compõe `ui-breadcrumb`, `next/link`, ícone Lucide e o slot de ações fornecido pelo consumidor. Não busca dados, não calcula rotas e não chama histórico do navegador. Páginas e templates fornecem o nome dinâmico do paciente e os destinos explícitos.

## Content rules

Labels devem ser humanos e não podem expor IDs ou o identificador técnico `nova`. O nome do paciente pode ser dinâmico e deve permanecer disponível no nome acessível mesmo quando o overflow visual for aplicado. O retorno deve nomear o destino pai.

## Exceptions

Modais e destinos globais independentes não usam esta molécula sem uma nova rota hierárquica documentada.

## Consumers

`src/app/pacientes/[id]/page.tsx`, `src/components/templates/DietBuilderTemplate.tsx` e `src/app/pacientes/[id]/consulta/[date]/page.tsx`.

## Acceptance criteria

- o componente oferece o contrato público documentado em `contracts/page-context-header.md`;
- há um único `h1` no header;
- o retorno aponta para o pai explícito e é operável por teclado;
- os itens anteriores são links, o item atual não é navegável;
- o slot de ações preserva controles existentes sem impor Card ou outra superfície.

## Implementation status

Implementado como molécula de produto e adotado inicialmente nos fluxos de perfil, dieta e consulta.
