# DietModeSwitcher

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-diet-mode-switcher` |
| Nature | `domain` |
| Lifecycle | `migration-required` |
| Current layer | `molecule` |
| Target layer | `organism` |
| Sources | `src/components/molecules/DietModeSwitcher.tsx` |
| Public exports | `DietModeSwitcherProps` (type), `DietModeSwitcher` (component) |

## Purpose

Coordenar a escolha única entre modos de construção da dieta.

## Category inheritance

Herda integralmente [selection](../../categories/selection.md). Traits autorizados: `nutrition-context`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `DietModeSwitcher` e exports visuais registrados: `DietModeSwitcher`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Somente os modos de dieta definidos pelo domínio, cardinalidade single.

## Particular states

A mudança de modo só conclui após confirmação quando descartaria edição; pending mantém a escolha anterior.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Cada opção tem label estável; valor persistido não depende da apresentação.

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

