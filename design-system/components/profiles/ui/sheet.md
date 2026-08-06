# Sheet

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-sheet` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/sheet.tsx` |
| Public exports | `Sheet` (component), `SheetPortal` (compound-part), `SheetOverlay` (compound-part), `SheetTrigger` (compound-part), `SheetClose` (compound-part), `SheetContent` (compound-part), `SheetHeader` (compound-part), `SheetFooter` (compound-part), `SheetTitle` (compound-part), `SheetDescription` (compound-part) |

## Purpose

Expor painel modal lateral acessível para conteúdo contextual extenso.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Parts públicas cobrem root/trigger/portal/overlay/content, header/footer/title/description e close; o content lateral é a única região de painel.

## Allowed variants

## Family contract

`Sheet` provides side-panel context and open state. Portal, overlay, content, header, footer, title, description, trigger and close are context-bound parts of this family.

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Title único e copy objetiva; body contém a informação completa e footer somente ações.

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

Implementado em `ui`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

