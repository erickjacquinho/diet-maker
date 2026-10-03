# SaveReadyDietModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-save-ready-diet-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/SaveReadyDietModal.tsx` |
| Public exports | `ReadyDietMealBasicsEntry`, `ReadyDietSaveData`, `SaveReadyDietModalProps` (types), `SaveReadyDietModal` (component) |

## Purpose

Confirmar o nome de uma dieta pronta e permitir ajustar em lote o nome e o horário de cada refeição antes do salvamento.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) com o trait `nutrition-context`; formulário e ações seguem suas categorias próprias.

## Specific anatomy

Dialog com campo de nome da dieta, lista editável por refeição/variação e footer com `Descartar` e `Confirmar`.

## Allowed variants

Uma composição para dieta simples ou várias listas de refeições para ciclo de carboidratos; não há variante visual pública.

## Particular states

Confirmação exige nome da dieta, ao menos uma refeição e nome preenchido em cada linha. Durante a gravação, controles de edição e fechamento ficam desabilitados. Em `dieta/nova`, clicar fora pede confirmação; continuar preserva o formulário e sair o fecha descartando dados não salvos. Erros são anunciados no dialog.

## Composition

Base `ui-dialog`. Compõe `molecule-meal-basics-editor`, `ui-input` e `ui-button`; a persistência fica na página consumidora.

## Content rules

O título do template e os campos de refeição permanecem distintos. Horários ficam associados à refeição e podem ser deixados vazios.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`.

## Acceptance criteria

- Em `dieta/nova`, clicar fora pergunta se deseja sair; continuar preserva os dados preenchidos.

- identidade, source e exports coincidem com o registro;
- todos os campos mantêm label e foco de teclado;
- a confirmação não altera a dieta em edição;
- footer permanece acessível com conteúdo longo.

## Implementation status

Implementado no fluxo do construtor; `specStatus` permanece `specified` no registro.
