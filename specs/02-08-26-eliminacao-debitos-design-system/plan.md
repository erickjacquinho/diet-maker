# Implementation Plan: Eliminação Total dos Débitos do Design System

**Branch**: `02-08-26-eliminacao-debitos-design-system` | **Date**: 2026-08-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/02-08-26-eliminacao-debitos-design-system/spec.md`

## Summary

A migração do runtime para o design system canônico ficou incompleta: o auditor `verify-design-system-legacy.mjs` reporta **86 findings** nas regras vigentes (LEG001–LEG010) e a análise de lacunas revelou **~712 ocorrências em 7 categorias sem regra** (text-named-size 347, space-x-y 232, text-transform 65, tracking-wide 30, opacity 10, leading 19, size-arbitrary 9), totalizando **~798 desvios** concentrados em ~20 arquivos de runtime. O plano tem 3 frentes:

1. **Instrumentação (test-first)** — promover as 7 categorias a regras **LEG011–LEG017** em `design-system-legacy-rules.mjs`, introduzir **PATH_EXEMPTIONS** (`src/components/ui/**` isentos por decisão de clarificação 2026-08-02 + `src/design-system/**` canônica), criar fixtures por regra, atualizar o teste de cobertura para 17 regras e **congelar o baseline**.
2. **Migração** — converter ~20 arquivos (12 componentes em `src/components` + 8 páginas em `src/app`) para `textStyle()` de `@/design-system` e tokens canônicos, com tabela de conversão papel→estilo, iterando até **zero findings**.
3. **Fechamento** — zerar a auditoria global (`npm run verify:design-system-legacy`), fazer `legacy-audit.test.ts` passar, manter `tsc --noEmit` e `vitest run` verdes, e atualizar a documentação de conformidade (`design-system/13-implementation-and-compliance.md` + `design-system/components/registry.json`) **somente com evidência**.

## Technical Context

**Language/Version**: TypeScript (strict), Node ≥ 20 (ES Modules), Next.js App Router (Tailwind CSS 4).
**Primary Dependencies**: nenhuma nova; reuso de `node:fs/promises` (auditor), Vitest (testes), alias `@/design-system` (pacote de estilos).
**Storage**: N/A — a auditoria é análise estática de arquivos-fonte.
**Testing**: `vitest run` (`npm run test`), `tsc --noEmit` (`npm run type-check`), validadores CLI (`node scripts/*.mjs`).
**Target Platform**: web desktop a partir de `1024px` (constituição III).
**Project Type**: aplicação Next.js + camada de design system + ferramentas de auditoria em `scripts/`.
**Performance Goals**: auditoria completa em `src` < 5s (análise linear sobre arquivos-fonte); sem requisito de runtime.
**Constraints**: constituição I–V (Atomic Design, design system canônico, desktop-only, test-first, spec-driven); `src/design-system/**` e `src/app/design-system/page.tsx` intocáveis (FR-007); primitivos `src/components/ui/**` isentos por decisão registrada (FR-002).
**Scale/Scope**: ~798 findings, ~20 arquivos migrados, 17 regras de auditoria, 2 scripts alterados, 1 suíte de testes, 2 artefatos documentais.

## Constitution Check

*GATE: passado antes da Fase 0; re-avaliado após a Fase 1.*

| Princípio | Avaliação | Gate |
|-----------|-----------|------|
| I. Atomic Design | Migração é de classes, não de camadas; `ui/` permanece genérico e livre de domínio, isento de auditoria | PASS |
| II. Design System Canônico | Toda conversão usa `textStyle()`/tokens canônicos; nenhum valor inventado localmente; `src/design-system/**` é fonte da verdade | PASS |
| III. Desktop ≥ 1024px | `sm:`/`md:` são código morto e são removidos, não convertidos | PASS |
| IV. Test-First & Isolamento | Regras LEG011–LEG017 com fixtures antes de qualquer migração; findings nominais/acionáveis/reproduzíveis | PASS |
| V. Spec-Driven & Evidência | Execução via `/speckit-implement`; docs declaram conformidade somente após auditoria zerada | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/02-08-26-eliminacao-debitos-design-system/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Fase 0 — decisões e mapa de conversão
├── data-model.md        # Fase 1 — entidades (Rule, Finding, Exemption, ConversionMap)
├── quickstart.md        # Fase 1 — guia de validação executável
├── contracts/           # Fase 1 — contrato da auditoria (schema de regras, CLI, exceções)
│   └── audit-contract.md
├── checklists/
│   ├── requirements.md  # Quality checklist da spec (16/16)
│   └── compliance.md    # Checklist de qualidade dos requisitos (24 itens)
└── tasks.md             # Fase 2 (/speckit-tasks — criado no Estado 5)
```

### Source Code (repository root)

```text
scripts/
├── design-system-legacy-rules.mjs   # ALVO: +LEG011..LEG017 (7 regras)
└── verify-design-system-legacy.mjs  # ALVO: +PATH_EXEMPTIONS, arquitetura de regras

tests/
├── design-system/
│   └── legacy-audit.test.ts          # ALVO: zero findings + 17 regras com fixtures
└── fixtures/design-system-legacy/
    ├── LEG001..LEG010.fixture.tsx    # existentes
    └── LEG011..LEG017.fixture.tsx    # NOVOS (7 fixtures)

src/components/**                     # ALVO: ~12 componentes migrados
src/app/**                            # ALVO: ~8 páginas migradas (exceto design-system/page.tsx)

design-system/
├── 13-implementation-and-compliance.md  # ALVO (fechamento): estado verificado
└── components/registry.json             # ALVO (fechamento): baseline + exceções registradas
```

**Structure Decision**: manutenção do layout atual (scripts de auditoria em `scripts/`, testes em `tests/`, fixtures por regra); nenhuma reestruturação. A exceção de `src/components/ui/**` é registrada no auditor (PATH_EXEMPTIONS) e documentada no registry, sem alterar os arquivos.

## Complexity Tracking

Sem violações à constituição; tabela não aplicável (nenhuma exceção de gate necessária).

## Phase 0: Research (resolvido em `research.md`)

Unknowns resolvidos:
- **U-01** Semântica de matcher para LEG011–LEG017 (regex com casos-limite: `z-5` vs `z-50`, `\b` após `]`, `\b-` antes de negativos).
- **U-02** Desenho do PATH_EXEMPTIONS (prefixos `src/components/ui/` e `src/design-system/`; interação com fixtures e LEG009).
- **U-03** Mapa de conversão papel→estilo (tabelas textStyle, radius, motion, palette, opacity, gap, breakpoints).
- **U-04** Estrutura das fixtures e contrato do teste de 17 regras.
- **U-05** Como remover `sm:`/`md:` sem quebrar o layout canônico (produto desktop-only).

## Phase 1: Design & Contracts (ver `data-model.md`, `contracts/audit-contract.md`, `quickstart.md`)

- Entidades: `Rule`, `Finding`, `Exemption`, `ConversionMap`, `Baseline`.
- Contrato de auditoria: schema de entrada de `legacyRules`, contrato de `verifyLegacy()`, CLI (`--strict`, `--json`, `--paths`), semântica de exceções.
- Guia de validação (`quickstart.md`): comandos de verificação em cada etapa.

## Done When

- [x] Plan workflow executado (Technical Context, Constitution Check, estrutura)
- [x] `research.md` criado (U-01..U-05 resolvidos)
- [x] `data-model.md`, `contracts/audit-contract.md`, `quickstart.md` criados
- [x] Constitution Check re-avaliado pós-design: permanece **PASS** em todos os 5 princípios (sem novas violações; exceção `src/components/ui/**` registrada e justificada; `src/design-system/**` isenta por ser a fonte da verdade)
- [ ] Pronto para `/speckit-tasks` (Estado 5)
