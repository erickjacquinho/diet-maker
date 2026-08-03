# Category: Feedback

Category ID: `feedback`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-feedback`  
Allowed traits: `nutrition-macro`  
Current consumers: `ui-badge`, `atom-badge`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Comunicar status, resultado, severidade ou orientação contextual com persistência e semântica proporcionais.

## Includes

Badges, mensagens inline, alerts e toasts futuros. Feedback de macro pode usar o trait `nutrition-macro`; cor de macro representa nutriente, não severidade.

## Excludes

Progresso indeterminado pertence a `loading`; validação de campo é composta em `fields`; dialog de confirmação pertence a `overlays`; métricas a `data-display`/`nutrition-domain`.

## Relationship map

Recebe resultados de `actions`, `fields` e fluxos assíncronos. Toast é apresentado na camada de `overlays`, mas mantém `feedback` como categoria principal. `nutrition-macro` adiciona apenas semântica oficial de macro.

## Base anatomy

Badge: root + label. Mensagem: icon opcional + title/message + action opcional + dismiss opcional. Obrigatório nomear a condição. Proibidos: ícone sem texto para severidade, múltiplas ações primárias e status somente por cor.

## Geometry

Badge tem mínimo 24, padding `badge`, radius `radius-compact` e borda 1px. Alert usa padding `surface-standard`, gap `space-related`, radius `radius-surface`, borda 1px. Toast largura de conteúdo controlada pelo viewport desktop e máximo de três simultâneos.

## Typography

Badge `badge-label`; título de alert `body-small-strong`; mensagem `body-small`; ação `link-inline`; validação usa estilos fechados de fields; texto auxiliar `helper`.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| info | background/text/border | `info-soft` / `on-info` / `info-border` |
| success | background/text/border | `success-soft` / `on-success` / `success-border` |
| warning | background/text/border | `warning-soft` / `on-warning` / `warning-border` |
| error | background/text/border | `error-soft` / `on-error` / `error-border` |
| neutral | background/text/border | `surface-subtle` / `text-secondary` / `border-subtle` |
| macro | background/text/border | `macro-*-soft` / `macro-*` / `macro-*-border` |
| floating toast | elevation | `shadow-floating` |

## Allowed variants

Severidades `neutral`, `info`, `success`, `warning`, `error`; formato `badge`, `inline`, `alert`, `toast`. Macro variants somente para protein/carbohydrate/fat e nunca para sucesso/erro.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | token da severidade | token da severidade | 1px semântico | mesma severidade | default | none | status quando relevante |
| hover | preservado | preservado | preservado | preservado | pointer apenas em ação | color 120ms só na ação | none |
| pressed | N/A no container; ação segue `actions` | N/A | N/A | N/A | N/A | N/A | N/A |
| focus-visible | N/A no container; ação/dismiss recebe ring | preservado | preservado | preservado | pointer | none | nome da ação |
| selected | N/A — feedback não representa escolha | N/A | N/A | N/A | N/A | N/A | N/A |
| disabled | N/A — feedback descreve estado; ação interna pode disabled | N/A | N/A | N/A | N/A | N/A | N/A |
| loading | N/A — comunicar via `loading` | N/A | N/A | N/A | N/A | N/A | N/A |
| error | `error-soft` | `on-error` | `error-border` | `error` | default | none | alert assertivo quando bloqueante |
| empty | N/A — sem mensagem, não renderizar | N/A | N/A | N/A | N/A | N/A | N/A |
| read-only | estado natural | preservado | preservado | preservado | default | none | status |

## Interaction and keyboard

Container não é interativo. Action/dismiss seguem categoria `actions`. Toast pausa expiração em hover/focus. Persistência: info 5s, success 4s, warning 7s ou até ação, error persistente; mensagens inline persistem até a condição mudar.

## Accessibility

Success/info não urgente usam `status`; erro bloqueante usa `alert`; toast não move foco. Ícone é redundante ao texto. Severidade possui texto; contraste AA; dismiss nomeado; reduced motion elimina deslocamento não essencial.

## Composition

Mensagem pode conter uma ação secundária curta. Alerts ficam próximos à origem; resumo de erros precede formulário. Badges não contêm button. Toast stack máximo 3, ordem cronológica e região nomeada.

## Content and overflow

Título é opcional quando a mensagem já nomeia o status. Mensagem explica o que ocorreu e próximo passo. Badge é curto e uma linha; não usar badge para frases. Alerts quebram sem truncar.

## Forbidden decisions

Usar azul primary como severidade genérica; macro color para status; auto-dismiss de erro; feedback só por cor; alert sem copy acionável; mais de três toasts; pill radius; border acima de 1px; sombra fora de toast.

## Current examples

`ui-badge` expõe o primitivo e recipe; `atom-badge` restringe variantes do produto. Alerts e toasts ficam documentados como extensões futuras da categoria.

## Category acceptance

Passa quando formato, severidade, persistência, live-region, copy, action e dismissal são determinados pelo tipo de evento, sem cor local ou ambiguidade macro/status.

## Change history

- `CAT-2026-07-31-feedback`: categoria estabilizada com persistência por severidade e limite de toasts.
