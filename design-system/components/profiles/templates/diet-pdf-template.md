# DietPdfTemplate

## Identity

| Field | Value |
| --- | --- |
| Component ID | `template-diet-pdf-template` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `template` |
| Target layer | `template` |
| Sources | `src/components/templates/DietPdfTemplate.tsx` |
| Public exports | `DietPdfTemplateProps` (type), `DietPdfTemplate` (component) |

## Purpose

Apresentar o documento da dieta simples em formato legível para prévia e geração de PDF.

## Category inheritance

Herda integralmente [structure](../../categories/structure.md). Traits autorizados: `nutrition-context`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Cabeçalho com paciente e data; cada refeição usa seu nome e horário como título, seguido por uma `DataTable` de alimentos e quantidades com opções agrupadas; outra `DataTable` apresenta uma linha de macros por opção e total diário na última linha.

## Allowed variants

Somente dieta simples; cada opção pertence à refeição que a contém.

## Particular states

Estados vazios de refeições/opções e macros ausentes são apresentados sem inventar valores zero. Loading e erro pertencem à rota consumidora.

## Composition

Recebe um modelo de visualização já calculado; não consulta persistência nem recalcula nutrientes. Compõe `DataTable` para alimentos e macros, usando `TableRow` e `TableCell` para agrupar cada opção e suas linhas de alimentos. A rota controla prévia, navegação e download.

## Content rules

Exibe nome e quantidade/unidade dos alimentos. Macros seguem a ordem proteína, carboidrato, gordura e kcal; o total diário considera somente as opções principais.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- refeições e opções mantêm a hierarquia do documento;
- o resumo nutricional aparece após as refeições;
- nenhuma regra visual compartilhada da categoria é redefinida.

## Implementation status

Implementado em `template`; perfil homologado documentalmente. Homologação não certifica que todos os estados de paginação foram verificados visualmente.
