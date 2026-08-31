# ReadOnlyDietModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-read-only-diet-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/diets/ReadOnlyDietModal.tsx` |
| Public exports | `ReadOnlyDietModalProps` (type), `ReadOnlyDietModal` (component) |

## Purpose

Apresentar uma prescrição confirmada em consulta somente leitura, incluindo sua composição e os snapshots nutricionais congelados.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: `read-only`, `nutrition-context`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Dialog com título, descrição, modo e peso de referência; corpo rolável com variações, refeições, opções e itens; cada item exibe quantidade, unidade e nutrientes do snapshot; footer com a única ação de fechamento.

## Allowed variants

Não possui variantes visuais autônomas. A ausência de ciclo mostra somente a composição simples confirmada.

## Particular states

O estado base é `read-only`. `loading`, `error` e `empty` pertencem ao consumidor que carrega o agregado. Fechar por botão ou Escape devolve o foco ao gatilho pelo primitivo do dialog.

## Composition

Compõe `ui-dialog`, `Badge`, ações genéricas e ícones Lucide. Não cria draft, não recalcula energia e não possui controles de editar, excluir ou salvar.

## Content rules

Os valores apresentados vêm do `DietPlan` confirmado e de seus snapshots; não devem consultar catálogo vivo nem apresentar alternativas mutuamente exclusivas como total somado.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- o dialog mantém nome acessível, foco, região rolável e fechamento por Escape;
- todos os itens confirmados são exibidos com os snapshots congelados;
- não há mutação clínica, criação de draft, edição ou exclusão;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
