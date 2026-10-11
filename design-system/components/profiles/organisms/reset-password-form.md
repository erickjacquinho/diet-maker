# ResetPasswordForm

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-reset-password-form` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/ResetPasswordForm.tsx` |
| Public exports | `ResetPasswordForm` (component) |

## Purpose

Definir nova senha com uma autorização de recovery válida e conduzir ao login normal.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md) com o trait `async`; compõe actions, feedback e loading. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Título e orientação precedem nova senha, confirmação, ação principal e retorno para login. Link expirado ou já utilizado oferece nova solicitação.

## Allowed variants

Somente os estados de envio, falha de autorização e conclusão.

## Particular states

CSRF pendente mantém a ação desabilitada; validação local associa e foca o primeiro campo inválido; envio anuncia loading; sucesso oferece login; autorização inválida orienta pedir outro link.

## Composition

Compõe dois `ui-input` de senha e `atom-button`; os links são navegação independente.

## Content rules

Usa autocomplete `new-password`, exige ao menos 12 caracteres e limita tamanho conforme o servidor. Nunca renderiza token nem detalhe técnico do provedor.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e trait são herdados sem redefinição local;
- campos e erros são rotulados/associados, loading e retorno são acessíveis;
- recuperação termina em login sem expor tokens ao cliente.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
