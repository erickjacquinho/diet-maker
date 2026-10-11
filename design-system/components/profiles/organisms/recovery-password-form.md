# RecoveryPasswordForm

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-recovery-password-form` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/RecoveryPasswordForm.tsx` |
| Public exports | `RecoveryPasswordForm` (component) |

## Purpose

Solicitar instruções de recuperação sem revelar se o e-mail pertence a uma conta.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md) com o trait `async`; compõe actions, feedback e loading. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Título e orientação precedem um campo rotulado de e-mail, a ação de envio e retorno para login. A resposta concluída é um status condicional com retorno para login.

## Allowed variants

Somente o estado de envio da solicitação.

## Particular states

CSRF pendente mantém a ação desabilitada; erro local fica associado e focado; envio anuncia loading; conclusão usa resposta genérica para endereços existentes e inexistentes; indisponibilidade permite tentar novamente.

## Composition

Compõe `ui-input` e `atom-button`; o retorno para login é um link de navegação independente.

## Content rules

Usa autocomplete `email`; não afirma que o link foi enviado nem repete o endereço digitado. Mensagens não expõem dados do provedor.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e trait são herdados sem redefinição local;
- formulário é operável por teclado, tem label e erro associado e anuncia loading/status;
- resposta não revela existência de conta.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
