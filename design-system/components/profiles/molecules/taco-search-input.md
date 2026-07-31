# TacoSearchInput

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-taco-search-input` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/TacoSearchInput.tsx` |
| Public exports | `TacoSearchInputProps` (type), `TacoSearchInput` (component) |

## Purpose

Capturar termo TACO, buscar assincronamente e expor resultados.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md). Traits autorizados: `nutrition-context`, `async`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `TacoSearchInput` e exports visuais registrados: `TacoSearchInput`. Base declarada: `atom-input`.

## Allowed variants

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Debouncing não muda estado visual; refreshing preserva resultados anteriores e expõe busy.

## Composition

Base declarada: `atom-input`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label e tipo são explícitos; placeholder não substitui label; unidade fica fora do valor editável.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- anatomia e variantes acima são suficientes para reproduzir a família;
- estados particulares são observáveis e não contradizem a categoria;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `molecule`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

