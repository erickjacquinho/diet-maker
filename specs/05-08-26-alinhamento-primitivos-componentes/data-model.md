# Data Model: Catálogo de Componentes e Contratos

Esta iniciativa não altera dados de negócio ou armazenamento. O modelo abaixo representa os artefatos arquiteturais necessários para rastrear componentes e seus contratos.

## PrimitiveFamily

Representa uma família pública em `src/components/ui`.

| Field | Description | Validation |
|-------|-------------|------------|
| `id` | ID estável do registry | Único e não vazio |
| `name` | Nome público da família | Corresponde à exportação raiz |
| `source` | Caminho do módulo de origem | Deve apontar para arquivo real |
| `category` | Categoria visual canônica | Deve existir no catálogo de categorias |
| `layer` | Camada Atomic | Para primitives, `ui` |
| `status` | Estado documental | Um dos estados governados pelo design system |
| `parts` | Lista de partes públicas | Cada parte deve ser exportada pelo módulo |
| `consumers` | Arquivos consumidores conhecidos | Caminhos reais ou status migration-required |

## CompoundPart

Representa uma parte pública vinculada a uma `PrimitiveFamily`.

| Field | Description | Validation |
|-------|-------------|------------|
| `name` | Nome da parte, como `SelectItem` | Export público da família |
| `role` | Context, behavior, structure ou visual slot | Deve ser explicitado no contrato |
| `requiresRootContext` | Indica dependência do root | Não pode ser registrada como família independente quando verdadeira |
| `states` | Estados aplicáveis | Inclui focus, disabled, selected, loading, error ou empty quando aplicável |

## AtomWrapper

Representa um componente em `src/components/atoms` que usa ou substitui um primitive.

| Field | Description | Validation |
|-------|-------------|------------|
| `source` | Caminho do atom | Deve estar sob `src/components/atoms` |
| `primitiveBase` | Família primitiva usada, quando houver | Deve existir no registry |
| `addedValue` | Identidade, semântica, acessibilidade, default ou composição | Pelo menos uma dimensão deve ser documentada |
| `decision` | Mantain, consolidate, remove ou migration-required | Deve possuir justificativa |

## ConsumerContract

Representa a relação entre um componente e um consumidor.

| Field | Description | Validation |
|-------|-------------|------------|
| `consumer` | Caminho do consumidor | Deve existir no repositório |
| `importPath` | Caminho usado para importar | Deve respeitar a política `ui` versus `atoms` |
| `usageType` | Generic primitive, product atom ou compound composition | Compatível com a camada do consumidor |
| `layoutOverrides` | Overrides permitidos de composição | Não podem redefinir identidade oficial sem contrato |
| `migrationStatus` | Estado da relação | `current`, `migration-required` ou `deprecated` |

## Relationships

```text
PrimitiveFamily 1 ──── N CompoundPart
PrimitiveFamily 1 ──── N ConsumerContract
PrimitiveFamily 0 ──── N AtomWrapper
AtomWrapper 1 ──────── N ConsumerContract
```

## Committed-scope inventory

The implementation scope contains the following 16 public primitive families. Each family remains a single `src/components/ui` module; compound children are parts of the family, not independent families.

| Family | Root | Source | Compound/public parts | Known product consumers |
| --- | --- | --- | --- | --- |
| Badge | `Badge` | `ui/badge.tsx` | visual root | atoms, patient header, diet mode, food/read-only modals, pages |
| Button | `Button` | `ui/button.tsx` | visual root, recipe | atoms, meals, patient header, modals, pages, diet template |
| Card | `Card` | `ui/card.tsx` | Header, Footer, Title, Description, Content | pages and design-system catalog |
| Dialog | `Dialog` | `ui/dialog.tsx` | Portal, Overlay, Close, Trigger, Content, Header, Footer, Title, Description | food/read-only modals and pages |
| DropdownMenu | `DropdownMenu` | `ui/dropdown-menu.tsx` | Trigger, Content, Item, CheckboxItem, RadioItem, Label, Separator, Shortcut, Group, Portal, Sub, SubContent, SubTrigger, RadioGroup | sidebar and page actions |
| Input | `Input` | `ui/input.tsx` | visual root | molecules and pages |
| Popover | `Popover` | `ui/popover.tsx` | Trigger, Content | date picker and page controls |
| ScrollArea | `ScrollArea` | `ui/scroll-area.tsx` | ScrollBar | dense page regions |
| Select | `Select` | `ui/select.tsx` | Group, Value, Trigger, Content, Label, Item, Separator, scroll buttons | forms and page selectors |
| Separator | `Separator` | `ui/separator.tsx` | visual root | layout and sidebar regions |
| Spinner | `Spinner` | `ui/spinner.tsx` | loading visual root | Button and loading states |
| Sheet | `Sheet` | `ui/sheet.tsx` | Portal, Overlay, Trigger, Close, Content, Header, Footer, Title, Description | overlays and future desktop panels |
| Table | `Table` | `ui/table.tsx` | Header, Body, Footer, Head, Row, Cell, Caption | patient list and data pages |
| Tabs | `Tabs` | `ui/tabs.tsx` | List, Trigger, Content | page navigation and selectors |
| Tooltip | `Tooltip` | `ui/tooltip.tsx` | Trigger, Content, Provider | sidebar and icon-only actions |
| Calendar | `Calendar` | `ui/calendar.tsx` | CalendarDayButton | DatePickerField |

The complete machine-readable inventory, including roles, states and consumer IDs, is stored under `primitiveFamilies` in `design-system/components/registry.json`. `breadcrumb.tsx` is catalogued separately as a navigation UI source because it is an additional current source, not one of the 16 primitive-family contracts defined by this feature.

## State Vocabulary

- `proposed`: documentado como intenção, sem fonte implementada.
- `implemented`: fonte existente, ainda sujeita à validação de conformidade.
- `conforming`: fonte e validações alinhadas ao contrato.
- `migration-required`: divergência conhecida que precisa ser corrigida.
- `deprecated`: API mantida temporariamente durante migração.
- `removed`: não deve possuir consumidores ativos.
