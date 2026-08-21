# FieldTrigger

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-field-trigger` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/FieldTrigger.tsx` |
| Public exports | `FieldTriggerProps` (type), `FieldTrigger` (component) |

## Purpose

Fornecer um controle nativo de botão para campos que abrem uma seleção, com a mesma geometria e tipografia do Input padrão.

## Category inheritance

Herda [fields](../../categories/fields.md) para geometria, estados e tipografia do controle. Não contém regra de domínio nem conhece o painel aberto.

## Specific anatomy

Root `FieldTrigger` é um botão semântico que recebe conteúdo inline e repassa atributos nativos; não possui partes visuais focáveis adicionais.

## Allowed variants

Permite somente densidade `compact`/`standard` e estado `default`/`error`, conforme a receita de `Input` e as restrições da categoria `fields`.

## Particular states

Foco, disabled, required, invalid e descrição são comunicados pelos atributos nativos/ARIA do consumidor. O átomo não cria estado de abertura nem regra de seleção.

## Contract

- Renderiza um `<button>` semântico com a receita `recipes.input` em densidade `standard` ou `compact`.
- Aceita somente os estados visuais de campo `default` e `error`; disabled, foco e nome acessível seguem os atributos nativos.
- Permite composição de conteúdo e ícones decorativos sem criar uma ação focável adicional.
- Não expõe cores, radius, tipografia ou spacing livres; `className` serve apenas para composição estrutural controlada.

## Composition

Compõe `recipes.input` e `cn`; não importa moléculas, organismos, rotas ou regras de domínio.

## Content rules

O consumidor fornece label acessível no contexto do campo e conteúdo textual curto; ícones devem ser decorativos quando não constituem uma ação independente.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`molecule-date-picker-field` usa o átomo como trigger do popover de calendário.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- altura, radius, borda e tipografia usam a receita de Input;
- estados nativos e de foco permanecem observáveis e acessíveis;
- nenhuma decisão visual livre é empurrada para o consumidor.

## Implementation status

Implementado em `atom`; perfil homologado documentalmente e usado pelo DatePickerField.
