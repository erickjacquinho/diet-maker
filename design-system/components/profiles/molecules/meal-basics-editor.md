# MealBasicsEditor

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-meal-basics-editor` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/MealBasicsEditor.tsx` |
| Public exports | `MealBasicsEntry`, `MealBasicsEditorProps` (types), `MealBasicsEditor` (component) |

## Purpose

Editar nome e horário de uma ou mais refeições em um único formulário.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md) com o trait `nutrition-context`. O componente não muda validação, estados ou geometria dos controles base.

## Specific anatomy

Um grupo contém um fieldset por refeição e campos associados de nome e horário. A legenda opcional identifica a variação ou refeição; a quantidade de fieldsets acompanha os registros recebidos.

## Allowed variants

Entrada unitária ou em lote pela lista `entries`; não há variante visual pública.

## Particular states

Valor controlado pelo consumidor; disabled preserva valores e bloqueia edição durante gravação. Lista vazia não renderiza linhas; o consumidor apresenta a orientação do estado empty.

## Composition

Compõe `ui-input` para texto e horário. A mudança em um campo devolve a lista atualizada preservando os demais valores.

## Content rules

Nome e horário mantêm labels visíveis e associados. A legenda identifica o contexto sem substituir o label dos campos.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`organism-create-ready-meals-from-diet-modal` e `organism-save-ready-diet-modal`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- cada campo tem label visível e foco de teclado;
- a edição em lote preserva o ID e os metadados de cada refeição;
- categoria e trait são herdados sem redefinir estados ou tokens.

## Implementation status

Implementado como molécula compartilhada; contrato homologado documentalmente em 2026-10-10, protegido por testes de edição, seleção e confirmação.
