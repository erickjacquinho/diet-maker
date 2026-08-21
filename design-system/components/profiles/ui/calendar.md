# Calendar

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-calendar` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/calendar.tsx` |
| Public exports | `Calendar` (component), `CalendarDayButton` (compound-part) |

## Purpose

Expor uma grade de datas navegável para seleção single, multiple ou range, com contrato controlado do `react-day-picker`.

## Category inheritance

Herda integralmente [selection](../../categories/selection.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

`Calendar` compõe o `DayPicker` e fornece navegação de mês, caption, weekdays, grid e `CalendarDayButton`. `CalendarDayButton` é a única part visual pública da família e adapta o botão local para estados de seleção e foco. Week numbers, quando habilitados pelo consumidor, permanecem uma part estrutural sem contrato independente.

## Visual contract

- A grade usa padding e gaps compactos com células de 32 px, reduzindo o footprint visual sem reduzir os alvos de foco/interação.
- O primitive mantém apenas a densidade e a tipografia internas; a superfície premium do painel (`surface`, `border-subtle`, `rounded-surface`, `shadow-floating`) pertence ao `PopoverContent` do `DatePickerField`.
- O dia selecionado usa preenchimento `primary` sólido, texto `on-primary`, radius `control` e borda/foco `primary-focus`; o estado continua exposto por `aria-selected` e `data-selected-single`.

## Allowed variants

## Family contract

`Calendar` is the DayPicker-backed date-grid root. `CalendarDayButton` is its context-bound visual day slot; week-number markup remains structural and is not an independent family.

O componente expõe apenas `buttonVariant` como escolha da receita de ação já existente e repassa os modos e props de seleção do `DayPicker`. A família não cria variante visual autônoma nem aceita tokens livres.

## Particular states

O estado selected single é anunciado por `data-selected-single` e por `aria-selected` do grid; range usa os marcadores do DayPicker. Foco, disabled, outside, today, hidden e empty são estados observáveis pela semântica e pelas classes herdadas da categoria. A seleção não depende somente de cor.

## Composition

Sem primitive base local; compõe `react-day-picker`, `Button` e `cn`. A implementação não conhece pacientes, persistência, rotas ou regras de domínio. Consumidores podem substituir parts via o contrato de `components` do DayPicker sem alterar a receita base; o acabamento de superfície do popover é responsabilidade do wrapper consumidor.

## Content rules

Datas devem ser fornecidas como objetos `Date` pelo contrato do DayPicker. Localização de texto e labels pode ser fornecida pelo consumidor; o wrapper de produto `DatePickerField` fixa `pt-BR` e a serialização date-only fora deste primitivo.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; atualmente `molecule-date-picker-field` compõe esta família.

## Acceptance criteria

- identidade, fonte, exports e categoria coincidem com o registro;
- o primitivo mantém a API de seleção controlada do DayPicker;
- navegação, foco, disabled, selected, today e locale são observáveis e testáveis;
- a estilização usa Button, `cn` e tokens sem sobrescrever outros primitivos shadcn;
- nenhum consumidor precisa conhecer a implementação interna para compor um campo de data.

## Implementation status

Implementado em `ui`, documentado no catálogo e adequado aos contratos locais de Button, tokens e acessibilidade. A conformidade final é verificada pelos gates do catálogo, auditoria legacy, tipos e testes do feature.
