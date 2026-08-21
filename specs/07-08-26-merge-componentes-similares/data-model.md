# Data Model: Merge Seletivo de Componentes Similares

Este trabalho não altera entidades persistidas do domínio. O modelo abaixo descreve os registros de decisão e os contratos necessários para controlar a refatoração de UI.

## CandidateDecision

Representa um candidato avaliado para merge ou composição.

| Campo | Descrição | Regra |
|---|---|---|
| `id` | Identificador estável do candidato | Único dentro da feature |
| `sources` | Componentes/fontes envolvidos | Deve apontar para caminhos existentes no momento da implementação |
| `layers` | Camadas Atomic Design dos consumidores | Não pode introduzir dependência de camada superior |
| `sharedResponsibility` | Responsabilidade observavelmente comum | Deve ser específica e testável |
| `decision` | `compose`, `share-internal`, `keep-separate` ou `remove-alias` | Obrigatório antes da mudança |
| `publicContracts` | Exports, props, ações e estados que permanecem públicos | Não pode ser reduzido por conveniência |
| `excludedResponsibilities` | Regras que não podem entrar na unidade comum | Evita vazamento de domínio |
| `validationEvidence` | Testes, auditorias e revisão manual | Obrigatória antes de marcar como concluído |
| `lifecycle` | Estado documental: proposed, migration-required, deprecated, removed ou stable | Deve coincidir com registry e perfil |

## SharedCompositionUnit

Representa um fragmento interno ou wrapper de domínio compartilhado.

| Campo | Descrição | Regra |
|---|---|---|
| `name` | Nome da unidade | Deve expressar responsabilidade, não tela consumidora |
| `consumers` | Consumidores reais | Pelo menos dois, salvo justificativa explícita de composição |
| `inputs` | Valores e callbacks mínimos | Sem props booleanas mutuamente exclusivas |
| `states` | Estados funcionais aplicáveis | Preservar default, focus-visible, disabled, loading, error, empty e read-only quando aplicáveis |
| `a11yContract` | Nome, role, value, teclado e foco | Deve seguir WCAG 2.2 AA e regras canônicas |
| `domainBoundary` | O que permanece nos shells públicos | Não importar entidades de domínio para `ui`/`atoms` |

## PublicComponentContract

Contrato observável de cada modal, linha, input ou badge.

- Export e caminho canônicos.
- Props e valores padrão.
- Ações específicas de domínio e callbacks.
- Estados visuais e de interação.
- Regras de foco, teclado e semântica.
- Consumidores registrados no catálogo.
- Status de lifecycle e caminho de migração quando aplicável.

## ValidationEvidence

Conjunto de evidências associadas a uma decisão.

1. Testes unitários/integrados determinísticos do comportamento comum e dos shells.
2. Type-check e lint sem novas falhas.
3. Auditoria Atomic Design sem novas violações.
4. Verificação estrita do design system e links sem findings bloqueantes.
5. Revisão manual dos cenários de aceitação e regressão visual.

## State Transitions

```text
candidate-inventory
  -> decision-recorded
  -> composed-or-migrated
  -> candidate-validated
  -> catalog-synchronized
  -> accepted

composed-or-migrated -> reverted
reverted -> decision-recorded
deprecated-alias -> migration-required -> removed
```

Uma transição só avança quando a evidência da etapa atual está registrada. `reverted` retorna o candidato para decisão sem invalidar candidatos já aceitos.
