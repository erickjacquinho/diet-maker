# Breadcrumb

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-breadcrumb` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/breadcrumb.tsx` |
| Public exports | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` |

## Purpose

Fornecer a semântica e as partes genéricas de uma trilha hierárquica de navegação. O primitivo não resolve rotas, dados de domínio ou decisões sobre quando uma página deve oferecer retorno.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Não introduz traits ou variantes de produto.

## Specific anatomy

`Breadcrumb` é o landmark de navegação; `BreadcrumbList` organiza a ordem; `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage` e `BreadcrumbSeparator` compõem os segmentos; `BreadcrumbEllipsis` representa uma lacuna visual quando aplicável.

## Allowed variants

Somente as propriedades e slots fornecidos pelo primitivo Shadcn/Radix. Labels, destinos e regra de item atual são responsabilidade do consumidor.

## Particular states

Estados de link, foco e item atual são herdados da categoria e da implementação Shadcn. O primitivo não adiciona estado de domínio.

## Composition

Pode ser composto por moléculas e camadas superiores. Não importa pacientes, dietas, stores, templates ou páginas.

## Content rules

Use nomes humanos de destinos e marque apenas o segmento atual como `BreadcrumbPage`. Identificadores técnicos devem ser transformados pelo consumidor antes da renderização.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`PageContextHeader` é o consumidor inicial registrado no registry.

## Acceptance criteria

- a fonte permanece genérica e alinhada ao primitivo Shadcn;
- links anteriores mantêm semântica de destino e o item atual não é navegável;
- a ordem da lista é preservada e os separadores são decorativos;
- não há regra de paciente, dieta ou consulta no arquivo.

## Implementation status

Implementado em `ui`; perfil documental criado para registrar a fonte e separar o contrato genérico da composição de produto.
