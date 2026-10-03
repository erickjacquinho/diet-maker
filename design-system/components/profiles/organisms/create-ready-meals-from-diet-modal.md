# CreateReadyMealsFromDietModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-create-ready-meals-from-diet-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/CreateReadyMealsFromDietModal.tsx` |
| Public exports | `ReadyMealBatchEntry`, `CreateReadyMealsFromDietModalProps` (types), `CreateReadyMealsFromDietModal` (component) |

## Purpose

Selecionar opções de uma refeição da dieta e criar os registros de refeição pronta correspondentes.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) com o trait `nutrition-context`; campos, escolha e ações seguem suas categorias próprias.

## Specific anatomy

Dialog com título e descrição, lista de variações selecionáveis quando houver mais de uma opção, editor em lote de nome/horário e footer com `Descartar` e `Confirmar`.

## Allowed variants

Sem variações: edita uma refeição. Com variações: permite escolher uma ou mais; cada escolha é criada como uma refeição pronta independente.

## Particular states

Inicializa com a variação ativa da refeição. Opções sem alimentos ficam desabilitadas. Confirmação fica desabilitada sem seleção e bloqueia alterações durante gravação. Em `dieta/nova`, clicar fora pede confirmação; continuar preserva o formulário e sair o fecha descartando dados não salvos. Erros são anunciados no dialog.

## Composition

Base `ui-dialog`. Compõe `molecule-meal-basics-editor`, checkbox nativo, `ui-button` e `ui-input`; persistência pertence à página consumidora.

## Content rules

Os nomes e horários são editáveis por variação. Quando várias opções são selecionadas, seus nomes iniciam com o nome da refeição e o rótulo da variação.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`.

## Acceptance criteria

- Em `dieta/nova`, clicar fora pergunta se deseja sair; continuar preserva os dados preenchidos.

- identidade, source e exports coincidem com o registro;
- seleção múltipla anuncia estado checked e funciona por teclado;
- o modal não confirma sem uma variação com alimentos;
- footer permanece acessível com conteúdo longo.

## Implementation status

Implementado no fluxo do construtor; `specStatus` permanece `specified` no registro.
