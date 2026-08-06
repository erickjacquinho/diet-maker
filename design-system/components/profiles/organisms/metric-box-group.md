# MetricBoxGroup

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-metric-box-group` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/MetricBoxGroup.tsx` |
| Public exports | `MetricBoxGroupItem` (type), `MetricBoxGroupItems` (type), `MetricBoxGroupProps` (type), `MetricBoxGroup` (component) |

## Purpose

Agrupar de um a cinco `MetricBox` em uma superfície segmentada com colunas e divisores consistentes.

## Category inheritance

Herda integralmente [surfaces](../../categories/surfaces.md). Não possui traits adicionais. Os itens filhos herdam [data-display](../../categories/data-display.md) por meio de `MetricBox`.

## Specific anatomy

Root `Surface` com grid, borda e divisores verticais; cada filho é um `MetricBox` configurado por um item da propriedade `items`. O componente não contém título ou descrição.

## Allowed variants

`items` aceita de um a cinco configurações. O número de colunas acompanha a quantidade de itens. Cada item pode configurar os eixos públicos de `MetricBox`, sem props posicionais ou flags de modo no grupo.

## Particular states

Nenhum estado interativo ou estado próprio. Valores ausentes, tons e legendas permanecem sob responsabilidade do `MetricBox` fornecido em cada item. Coleções vazias ou acima de cinco itens são rejeitadas em runtime.

## Composition

Compõe `Surface`, `MetricBox` e ícones/conteúdo fornecidos pelo consumidor. O grupo controla somente o shell de superfície, grid e defaults de célula; não controla dados de domínio, foco ou ações. O título e a descrição da seção pertencem ao consumidor.

## Content rules

Cada item deve fornecer label e value conforme o contrato de `MetricBox`. Unidades e conteúdo crítico permanecem no valor ou legenda do item. Ícones são recebidos como `ReactNode` e não são redimensionados pelo grupo; o perfil do paciente preserva os ícones atuais em `12px` com `strokeWidth={1.75}`.

## Exceptions

`no-padding-grid-shell`: o shell usa `Surface` com `p-0` para preservar o grid sem padding interno; o override é de layout e não cria uma segunda receita visual.
ExceptionRecord: no-padding-grid-shell reviewAt: 2026-09-30 owner: design-system-maintainers

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- um a cinco itens produzem a quantidade correspondente de colunas;
- quatro itens reproduzem a estrutura visual atual do perfil do paciente;
- todos os parâmetros públicos de `MetricBox` podem ser definidos por item;
- a coleção não introduz props booleanas de modo nem render props;
- os itens permanecem semanticamente read-only e os valores não dependem de cor;
- nenhuma decisão de domínio é embutida no organismo.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
