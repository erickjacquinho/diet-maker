# LoginForm

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-login-form` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/LoginForm.tsx` |
| Public exports | `LoginForm` (component) |

## Purpose

Coletar credenciais e iniciar uma sessão profissional sem expor tokens ao cliente.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md) com o trait `async`; compõe ações e feedback. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Campos rotulados de e-mail e senha, ação principal Entrar, retorno inline de estado e link discreto para recuperação.

## Allowed variants

Somente o estado de envio do login.

## Particular states

CSRF pendente mantém a ação desabilitada; envio exibe loading; falha de autenticação mostra mensagem genérica persistente; erros de campo são ligados ao controle e focados.

## Composition

Compõe `ui-input` e `atom-button`; o link de recuperação é um link de navegação independente.

## Content rules

Usa autocomplete `email` e `current-password`; nunca coloca senha, token ou detalhe técnico na mensagem.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- formulário funciona por teclado, tem labels e erros associados e anuncia loading;
- respostas não renderizam tokens nem detalhes do provedor.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
