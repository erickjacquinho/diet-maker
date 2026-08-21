# Data Model: Eliminação Total dos Débitos do Design System

**Branch**: `02-08-26-eliminacao-debitos-design-system` | **Date**: 2026-08-02

Entidades derivadas da spec (Key Entities) e do research, com campos e regras de validação.

## Rule

Contrato de verificação de uma categoria de desvio legado.

| Campo | Tipo | Regra de validação |
|-------|------|--------------------|
| `id` | `string` | Formato `LEG###` (LEG001–LEG017); único |
| `rule` | `string` | Slug kebab-case (ex.: `legacy-palette`, `space-utility`) |
| `pattern` | `RegExp` | Regex **com flag `g`**; sem `\b` após `]`; ancorado por início de token; coberto por fixtures de aceitação e rejeição |
| `message` | `string` | Nominativo e acionável; indica o canônico |
| `severity` | `'error'` (derivado) | Fixo no Finding, não na Rule |

**Relações**: `Rule` → gera `Finding`; `Rule` → coberto por fixtures `tests/fixtures/design-system-legacy/LEG###.fixture.tsx`.

## Finding

Ocorrência única de desvio reportado pela auditoria.

| Campo | Tipo | Regra |
|-------|------|-------|
| `code` | `string` | `rule.id` do Rule origem |
| `rule` | `string` | `rule.rule` |
| `path` | `string` | Caminho relativo ao projeto, normalizado `/` |
| `line` | `number` | 1-based |
| `message` | `string` | `rule.message` + `Encontrado: <match>` |
| `severity` | `'error'` | Constante |

**Regras**: um finding é gerado por match por linha por regra; ordenação: `path`, `line`, `code` (ordem canônica do auditor).

## Exemption

Exceção de caminho que isenta uma regra (ou todo o arquivo) de auditoria.

| Campo | Tipo | Regra |
|-------|------|-------|
| `pathPrefix` | `string` | Prefixo de caminho relativo (ex.: `src/components/ui/`, `src/design-system/`) |
| `reason` | `string` | Justificativa registrada (ex.: "primitivos shadcn preservados por design" — spec §Clarifications) |
| `appliesTo` | `'all-rules'` | Aplica-se a todas as regras no escopo do prefixo |

**Regras**: avaliação por prefixo; isenção NUNCA se aplica a `tests/fixtures/**`; registro documental no `registry.json`.

## ConversionMap

Mapeamento canônico de conversão papel→estilo (research.md U-03).

| Campo | Tipo | Regra |
|-------|------|-------|
| `legacyPattern` | `string` | Padrão legado (ex.: `text-sm`, `space-x-2`, `rounded-lg`) |
| `canonicalStyle` | `string` | `textStyle('<id>')` ou token canônico |
| `ruleId` | `string` | Rule que sinaliza a conversão |
| `verified` | `boolean` | Confirmado por fixture/inspeção antes do uso em migração |

## Baseline

Instantâneo reproduzível do estado da auditoria em um momento.

| Campo | Tipo | Regra |
|-------|------|-------|
| `capturedAt` | `string` | Data ISO |
| `mode` | `'strict'` | Sempre strict |
| `findings` | `Finding[]` | JSON completo da varredura congelada |
| `counts` | `{ files, findings }` | Agregação |

**Relações**: baseline pós-instrumentação (≥ ~798) orienta as tarefas; baseline final = zero findings.

## Diagrama

```text
Rule ──matches──> Finding ──filtrando──> (Exemption aplica-se? descarta)
  │                                       │
  └─ coberto por ── fixtures ─────────────┘
ConversionMap ── aplica-se em ──> migração de arquivos runtime
Baseline ── congela ──> estado da auditoria em T0 (instrumentação) e T1 (fechamento)
```
