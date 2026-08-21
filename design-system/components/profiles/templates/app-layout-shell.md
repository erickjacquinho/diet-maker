# AppLayoutShell

## Identity

| Field | Value |
| --- | --- |
| Component ID | `template-app-layout-shell` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `template` |
| Target layer | `template` |
| Sources | `src/components/templates/AppLayoutShell.tsx` |
| Public exports | `AppLayoutShellProps` (type), `AppLayoutShell` (component) |

## Purpose

Reservar sidebar e região main do shell desktop.

## Category inheritance

Herda integralmente [structure](../../categories/structure.md). Traits autorizados: `collapsible`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root grid com slot `sidebar` e landmark `main`; somente main controla o fluxo da página.

The required props are `sidebar: ReactNode` and `children: ReactNode`. The shell exposes the pt-BR skip link `Pular para o conteúdo principal` targeting `main#main-content`; main is `tabIndex={-1}` and owns the independent desktop scroll.

## Allowed variants

Expanded-nav e collapsed-nav.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Slots são nomeados pela responsabilidade; títulos e landmarks preservam ordem de leitura.

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

Implementado em `template`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

