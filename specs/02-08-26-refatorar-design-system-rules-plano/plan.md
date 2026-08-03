# Implementation Plan: Refatoração da documentação do design-system

**Branch**: `02-08-26-refatorar-design-system-rules-plano` | **Date**: 2026-08-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/02-08-26-refatorar-design-system-rules-plano/spec.md`

## Summary

Converter a pasta `design-system/` (17 documentos normativos) em uma estrutura simplificada: conteúdo normativo acionável migra para `.agents/rules/` como extração operacional (design-system permanece canônico), intenção/processo/roadmap são consolidados em `docs/plan/`, o README vira índice, e `design-system/components/` (dados executáveis) permanece intacto. Entrega via commit + PR com CI/CD, merge na main apenas se a CI passar.

## Technical Context

**Language/Version**: Markdown; sem código de produto novo.

**Primary Dependencies**: Nenhuma nova. Verificadores existentes: `scripts/verify-design-system-components.mjs`, `scripts/verify-design-system-legacy.mjs`, `scripts/verify-links.js`.

**Storage**: N/A (arquivos de documentação versionados em git).

**Testing**: `npm run verify:design-system`, `npm run verify:design-system-legacy`, `npm run verify:links`, `npm test`, `npm run lint`, `npm run type-check`.

**Target Platform**: Documentação do repositório (web desktop app NutriDiet).

**Project Type**: Documentação / refatoração de fonte canônica.

**Performance Goals**: N/A. Descoberta de qualquer valor visual em ≤2 passos a partir do README (SC-005).

**Constraints**: `design-system/components/` intocado; snapshot LEG preservado; constituição Princípio II mantida; `constitution.md` e `AGENTS.md` atualizados somente onde o roteamento for afetado.

**Scale/Scope**: raiz de `design-system/` de 17 → 1 documento (README), 4 consolidados em `docs/plan/`; `.agents/rules/` de 2 → 9; conteúdo normativo preservado.

## Constitution Check

*GATE: Passa antes da pesquisa. Re-checado após design.*

- **Princípio I (Atomic Design)**: `atomic-design.md` é expandido com os limites arquiteturais (doc 10) — reforça, não viola.
- **Princípio II (Canonical Design System)**: `design-system/` permanece canônico; `.agents/rules/` é extração operacional; README continua a fonte de roteamento. Sem violação.
- **Princípio III (Desktop/A11y)**: Não afetado — nenhuma regra de produto é alterada.
- **Princípio IV (Test-First)**: Verificadores preservados e continuam verdes após a mudança.
- **Princípio V (Spec-Driven)**: Execução via `/speckit-implement`; estados documentais preservados no migration-plan.
- **GATE de governança**: emenda à constituição **não** necessária (canonicidade mantida). Atualização de `AGENTS.md` é necessária e é um requisito (FR-008).

## Project Structure

### Documentation (this feature)

```text
specs/02-08-26-refatorar-design-system-rules-plano/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 (guia de validação)
├── checklists/
│   ├── requirements.md
│   └── documentation.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
# Estrutura-alvo após a refatoração

design-system/                         # Fonte canônica: índice + dados executáveis
├── README.md                          # Índice canônico + decisões fixadas + vocabulário + roteamento
└── components/                        # INALTERADO (dados executáveis)

docs/plan/                             # (novo) conteúdo normativo consolidado (referenciado pelo README)
├── fundamentals.md                    # (novo) 01-02 condensados
├── tokens-reference.md                # (novo) 03-08 tabelas de valores
├── governance.md                      # (novo) 14+11 condensados
└── migration-plan.md                  # (novo) 13 roadmap + snapshot LEG preservado

.agents/rules/                         # Restrições operacionais
├── atomic-design.md                   # expandido com limites arquiteturais (doc 10)
├── shadcn-preservation.md             # mantém
├── tokens.md                          # (novo) doc 03
├── color-semantics.md                 # (novo) doc 04 + 02 §3
├── typography.md                      # (novo) doc 05
├── geometry-layout.md                 # (novo) doc 06
├── icons-motion-layers.md             # (novo) doc 07
├── states-accessibility.md            # (novo) doc 08
└── component-decision.md              # (novo) docs 09 + 11 §4

AGENTS.md                              # roteamento atualizado para a nova estrutura
```

**Structure Decision**: Três árvores complementares. `design-system/` mantém a canonicidade via `README.md` (índice + decisões fixadas + vocabulário) e preserva `components/` (dados executáveis). `docs/plan/` consolida o conteúdo normativo simplificado (fundamentals, tokens-reference, governance, migration-plan), referenciado pelo README. `.agents/rules/` concentra as restrições operacionais de edição, no padrão dos arquivos existentes.

## Complexity Tracking

> Sem violações de constituição — seção não aplicável.

## Fase 0 — Pesquisa (research.md)

Decisões resolvidas em [research.md](./research.md).

## Fase 1 — Design e contratos

- Modelo de dados documental: [data-model.md](./data-model.md).
- Contratos de interface: **skip** — refatoração puramente interna, sem interfaces externas (documentação + regras).
- Guia de validação: [quickstart.md](./quickstart.md).

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Links relativos quebram ao mover conteúdo | `npm run verify:links` ao final; atualizar `AGENTS.md` |
| Snapshot LEG perdido | Preservado integralmente em `docs/plan/migration-plan.md` |
| `feature.json` divergente | Já alinhado a `specs/02-08-26-refatorar-design-system-rules-plano` |
| Constituição degradada | Canonicidade mantida via `design-system/README.md` (índice); conteúdo referenciado em `docs/plan/` |
| Scripts dependentes de caminhos documentais | `components/` intacto; verifiers rodam sem alteração |

## Definition of Done

- `design-system/` com 1 arquivo raiz (`README.md`) + `components/` intacto.
- `docs/plan/` com os 4 documentos consolidados (fundamentals, tokens-reference, governance, migration-plan).
- 7 regras novas em `.agents/rules/` + `atomic-design.md` expandido.
- `AGENTS.md` atualizado.
- `npm run verify:design-system`, `verify:design-system-legacy`, `verify:links`, `test`, `lint`, `type-check` verdes.
- Commit + PR; CI verde; merge na main.
