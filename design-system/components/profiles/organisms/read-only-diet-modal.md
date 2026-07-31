# ReadOnlyDietModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-read-only-diet-modal` |
| Nature | `domain` |
| Lifecycle | `migration-required` |
| Current layer | `molecule` |
| Target layer | `organism` |
| Sources | `src/components/molecules/ReadOnlyDietModal.tsx` |
| Public exports | `ReadOnlyDietModalProps` (type), `ReadOnlyDietModal` (component) |

## Purpose

Apresentar uma dieta completa para consulta sem affordance de edição.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Traits autorizados: `read-only`, `nutrition-context`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Dialog com header, resumo nutricional, refeições/itens em body rolável e única ação de fechar.

## Allowed variants

Somente o subconjunto necessário da categoria; o componente não introduz variante visual autônoma.

## Particular states

Read-only é o estado base e nunca usa disabled em valores ou controles de rolagem.

## Composition

Base declarada: `ui-dialog`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

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

Implementado em `molecule`, especificado para `organism`; perfil homologado, código ainda requer migração em SDD posterior.

