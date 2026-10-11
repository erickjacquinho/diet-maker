# RegistrationForm

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-registration-form` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/RegistrationForm.tsx` |
| Public exports | `RegistrationFormMode` (type), `RegistrationForm` (component) |

## Purpose

Reunir cadastro inicial, confirmação de e-mail e conclusão do perfil profissional.

## Category inheritance

Herda integralmente [fields](../../categories/fields.md) com o trait `async`; compõe selection, actions e feedback. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Um formulário identificado por título e texto de orientação. O modo de cadastro contém credenciais e perfil; o modo de confirmação tem uma ação; a conclusão pede somente perfil profissional.

## Allowed variants

`signup`, `confirm` e `complete`, definidos pela rota.

## Particular states

CSRF pendente mantém a ação desabilitada; erros locais ficam associados e recebem foco; envio é anunciado; cadastro e confirmação usam retorno genérico; perfil completo encaminha para saves.

## Composition

Compõe `ui-input`, o wrapper existente `SelectField` (sobre `ui-select`) e `atom-button`; labels e mensagens seguem fields/feedback.

## Content rules

Autocomplete indica e-mail, nome, sobrenome e senha nova. Métricas admitem zero e frações; experiência aceita as duas faixas em meses ou anos. Não ecoa dados enviados nas mensagens de resultado.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- todos os modos são operáveis por teclado, com labels e erros associados;
- submissões usam CSRF e loading acessível.

## Implementation status

Implementado em `organism`; perfil homologado documentalmente.
