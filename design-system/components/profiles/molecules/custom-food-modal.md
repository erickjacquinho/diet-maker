# CustomFoodModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-custom-food-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/CustomFoodModal.tsx` |
| Public exports | `CustomFoodFormData`, `CustomFoodPayload`, `CustomFoodModalProps` (types), `CustomFoodModal` (component) |

## Purpose

Capturar e editar alimentos customizados, incluindo composição de macronutrientes e remoção explícita de um alimento existente.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos e ações do sistema. Traits autorizados: `nutrition-context`, `destructive`.

## Specific anatomy

Dialog com título acessível, formulário rolável em duas linhas de identificação/classificação, seção de macros calculados e footer de ações. A ação destrutiva só aparece no modo de edição.

## Allowed variants

Create quando `food` é nulo e edit quando existe alimento. Não expõe props de estilo ou de infraestrutura do dialog.

## Particular states

O modo create inicia com valores padrão. O modo edit hidrata o rascunho a partir do alimento recebido. O submit exige nome; a exclusão é delegada ao consumidor para confirmação explícita.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input`, `ui-select`, `ui-button` e `molecule-auto-kcal-section`. Persistência e regras do catálogo permanecem na rota consumidora.

## Content rules

Labels devem permanecer associados aos controles, unidades de porção devem ser explícitas e os macros devem manter nomenclatura textual em português.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/alimentos/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- create/edit compartilham a mesma composição sem estado de negócio no primitive;
- dialog mantém title, scroll do body e footer de ações;
- exclusão requer confirmação fornecida pelo consumidor.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
