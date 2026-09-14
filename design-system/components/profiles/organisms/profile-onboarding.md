# ProfileOnboarding

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-profile-onboarding` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/profile-onboarding.tsx` |
| Public exports | `ProfileOnboardingSnapshot`, `ProfileOnboardingProps` (types), `ProfileOnboarding` (component) |

## Purpose

Apresentar o onboarding público e seus comandos de criação, carregamento ou retomada do último profile.

## Category inheritance

Herda integralmente [actions](../../categories/actions.md) e compõe structure, overlays e feedback. Trait autorizado: `async`.

## Specific anatomy

Região principal desktop com identidade NutriDiet, título, descrição, duas ações de entrada, ação condicional de retomada, status live e o dialog de criação.

## Allowed variants

Estado vazio/busy/error, hidratação inicial, save retomável e status de sincronização pausada; não possui variante de layout mobile.

## Particular states

Busy e hidratação inicial desabilitam as ações de entrada; quando a permissão do navegador precisa ser renovada, a ação de retomada identifica o arquivo lembrado; erro é anunciado como alert; sincronização pausada mantém a orientação visível enquanto a sessão continua utilizável.

## Composition

Sem primitive base único; compõe `atom-button` e `molecule-profile-create-dialog`. A rota injeta o snapshot e os callbacks de sessão.

## Content rules

As ações usam verbos explícitos (“Criar perfil”, “Abrir arquivo” e, quando aplicável, “Reabrir último save”); mensagens de erro e status descrevem o próximo passo sem depender de cor.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/Home/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- rota mantém `main`, hierarquia de heading e largura de formulário desktop;
- ações têm nome, foco, loading e disabled nativos;
- status e erro usam live regions distintas e texto persistente.

## Implementation status

Implementado em `organism` e homologado documentalmente no catálogo.
