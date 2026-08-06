# DatePickerField

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-date-picker-field` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/DatePickerField.tsx` |
| Public exports | `DatePickerFieldProps` (type), `DatePickerField` (component) |

## Purpose

Compor um campo de formulário de data com label persistente, apresentação localizada e valor canônico `YYYY-MM-DD`.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

O root contém label associado ao trigger, botão nativo semântico com a receita de `Input`, `PopoverContent` com `Calendar`, input hidden para submissão e área de description/validation. O trigger mostra `DD/MM/YYYY` ou placeholder; a API pública recebe e emite somente o valor date-only canônico.

## Visual contract

- O trigger reutiliza a receita `recipes.input` em densidade `standard`, mantendo altura, radius, borda, padding e tipografia do Input do produto.
- O popover é local ao DatePicker: usa `surface`, `border-subtle`, `rounded-surface` e `shadow-floating`, com alinhamento abaixo do trigger; o primitive `Popover` global não é alterado.
- A densidade visual do Calendar é aproximadamente 10% menor por padding/gaps internos, mantendo células de 32 px para preservar foco e interação.
- Mês, weekdays e dias usam text styles registrados; o dia selecionado permanece azul sólido, arredondado e com borda/foco visível.
- O componente não expõe props livres para cor, tipografia, radius ou spacing e não usa gradientes ou transforms de escala.

## Allowed variants

Permite os estados e conteúdos previstos em `fields`: vazio, preenchido, required, disabled e error, além de description opcional. Não expõe densidade, cor, radius ou spacing livres ao consumidor.

## Particular states

Valor vazio mantém placeholder sem transformar o placeholder em label. Ao selecionar uma data, o popover fecha e o foco retorna ao trigger pelo contrato do Radix. Error anuncia a mensagem por `aria-describedby` e `role="alert"`; invalid e required são declarados no trigger.

## Composition

Compõe `ui-calendar`, `ui-popover`, `ui-input` para o valor hidden e `atom-field-trigger` para o trigger semântico com receita de campo, além dos helpers date-only. O wrapper não conhece pacientes, eventos, persistência ou regras de domínio; essas responsabilidades permanecem na rota consumidora.

## Content rules

`value` e `onValueChange` usam `YYYY-MM-DD`; `formatDateOnly` apresenta `DD/MM/YYYY` em `pt-BR`. `name` é opcional e, quando fornecido, é usado no input hidden sem alterar o valor visual. O label é sempre obrigatório.

A migração substitui o único `Input type="date"` encontrado em `src/` — o campo `next-event-date` do diálogo de pacientes. Ícones `Calendar` usados como linguagem visual, datas de leitura e parâmetros de rota não são calendários nativos e permanecem inalterados.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; atualmente o diálogo de próximo acompanhamento em `src/app/pacientes/[id]/page.tsx` é consumidor.

## Acceptance criteria

- identidade, fonte, exports e categoria coincidem com o registro;
- label, trigger, helper/error e valor submetido permanecem semanticamente associados;
- seleção, placeholder, required, invalid, disabled, Escape e retorno de foco são verificáveis;
- o wrapper preserva a serialização date-only sem conversão implícita de fuso horário;
- nenhum estilo ou regra de pacientes é empurrado para a molécula genérica.

## Implementation status

Implementado em `molecule`, documentado antes da migração do calendário nativo e preparado para o consumidor de pacientes. A conformidade final é verificada pelos gates do catálogo, auditoria legacy, tipos e testes do feature.
