# ProfileCreateDialog

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-profile-create-dialog` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/profile-create-dialog.tsx` |
| Public exports | `ProfileCreateDialogProps` (type), `ProfileCreateDialog` (component) |

## Purpose

Coletar nome e telefone do profile antes da primeira escrita do arquivo.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos e ações. Trait autorizado: `async`.

## Specific anatomy

Dialog com título, descrição, campos Nome e Telefone lado a lado, feedback de validação e ação Salvar profile.

## Allowed variants

Somente criação; loading preserva a largura da ação e impede submissões concorrentes.

## Particular states

Nome vazio recebe erro associado e foco; falha de escrita permanece no dialog; cancelamento mantém a rota de onboarding.

## Composition

Base declarada: `ui-dialog`. Compõe `atom-input` e `atom-button`; a seleção do arquivo e a persistência são entregues por callback.

## Content rules

Os labels Nome e Telefone permanecem programaticamente associados; o telefone aceita formatação visível sem substituir o label.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/components/organisms/profile-onboarding.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- dialog usa title/description acessíveis e retorna foco ao gatilho;
- erro usa `aria-invalid`, `aria-describedby` e anúncio assertivo;
- loading bloqueia repetição sem esconder o label operacional.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
