# MetricBox

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-metric-box` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/MetricBox.tsx` |
| Public exports | `MetricBoxTone` (type), `MetricBoxSize` (type), `MetricBoxSurface` (type), `MetricBoxLayout` (type), `MetricBoxProps` (type), `MetricBox` (component) |

## Purpose

Apresentar uma métrica com label, valor e legenda opcional dentro de uma célula de leitura rápida, com variantes explícitas de densidade, cor semântica e superfície.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Traits autorizados: `nutrition-context`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `MetricBox` renderiza uma célula composta por linha de label (ícone decorativo opcional + texto), valor e legenda opcional. Modos com caixa compõem `atom-surface`; o modo inline permanece sem caixa para grids que já fornecem o host.

## Allowed variants

Variantes explícitas por eixo, sem flags booleanas:

- `surface`: `boxed` (superfície própria) ou `inline` (célula sem superfície, para grids com box pai).
- `size`: `compact`, `standard`, `large` ou `hero` (hierarquia tipográfica do valor, conforme data-display).
- `tone`: `default`, `muted`, `protein`, `carbohydrate`, `fat`, `success` ou `warning` (cor do valor).

## Particular states

Valor `muted` comunica secundário sem mudar de hierarquia. Tom `warning`/`success` expressa semântica de valor, não erro.

## Composition

Base declarada: `atom-surface` para `boxed`, `raised` e `tinted`; `inline` é layout-only. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label sempre possui texto legível; valor carrega unidade quando ambíguo; legenda é curta e opcional. Ícone é decorativo e não substitui o label.

## Exceptions

`inline-surface-mode`: `inline` é uma exceção de modo sem caixa; sua geometria é fornecida pelo host e deve ser protegida pelos testes do `MetricBoxGroup`.
ExceptionRecord: inline-surface-mode reviewAt: 2026-09-30 owner: design-system-maintainers

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
