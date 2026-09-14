# ImportPreviousDietModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-import-previous-diet-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/diets/ImportPreviousDietModal.tsx` |
| Public exports | `ImportPreviousDietModalProps` (type), `ImportPreviousDietModal` (component) |

## Purpose

Permitir a seleção única de uma prescrição confirmada do mesmo paciente para importar metas ou copiar sua composição ao draft atual.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: `async`, `read-only`, `nutrition-context`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Dialog com header contextual, busca com atalho Ctrl/Cmd+F, `DataTable` canônico com ordenação, seleção única e expansão de ciclos, além de footer com ações de puxar metas e duplicar refeições.

## Allowed variants

Não possui variantes visuais autônomas. A tabela pode mostrar uma fonte simples ou expandir as variações de uma fonte em ciclo.

## Particular states

`empty`, `filtered-empty`, `selected`, `expanded`, `submitting` e `read-only` são estados observáveis. As ações permanecem desabilitadas sem seleção e durante a persistência; o dialog só fecha após o callback retornar com sucesso.

## Composition

Compõe `ui-dialog`, `molecule-data-table`, `Badge`, `Button` e ícones Lucide. A entrada histórica não recebe controles de editar ou excluir e a origem não é mutada.

## Content rules

Exibe somente prescrições confirmadas do mesmo escopo, em ordem decrescente de data. O texto diferencia metas da cópia integral e comunica ciclo, variações e refeições sem somar opções mutuamente exclusivas.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- a tabela usa o contrato canônico e mantém seleção única, foco e expansão acessíveis;
- ações sem seleção ou durante envio não podem ser repetidas;
- cancelar/fechar não persiste alterações e sucesso só é anunciado depois da persistência;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
