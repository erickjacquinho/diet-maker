# Quickstart — Guia de validação da refatoração

Cenários executáveis que provam a refatoração ponta a ponta, sem depender de implementação do produto.

## Pré-requisitos

- Repositório em uma branch de feature (esta feature).
- Node.js + npm disponíveis.

## Cenário 1 — Estrutura-alvo alcançada

1. `Test-Path design-system/README.md` → verdadeiro.
2. `Test-Path design-system/components/registry.json` → verdadeiro (intacto).
3. `Get-ChildItem design-system -File -Filter *.md | Measure-Object` → 1 arquivo (README).

**Esperado**: 1 arquivo na raiz de `design-system/` + `components/` intacto.

## Cenário 2 — Regras operacionais presentes

1. `Get-ChildItem .agents/rules -File -Filter *.md` → 9 arquivos (atomic-design, shadcn-preservation, tokens, color-semantics, typography, geometry-layout, icons-motion-layers, states-accessibility, component-decision).
2. Cada arquivo novo contém seção de proibições/decisões no padrão MUST/NÃO.

**Esperado**: 7 regras novas + 2 existentes, todas legíveis.

## Cenário 3 — Plano consolidado em docs/plan

1. `Test-Path docs/plan/fundamentals.md` → verdadeiro.
2. `Test-Path docs/plan/tokens-reference.md` → verdadeiro.
3. `Test-Path docs/plan/governance.md` → verdadeiro.
4. `Test-Path docs/plan/migration-plan.md` → verdadeiro.

**Esperado**: 4 documentos em `docs/plan/`.

## Cenário 4 — Verificações de não-regressão

Executar na raiz do repositório:

```powershell
npm run verify:design-system
npm run verify:design-system-legacy
npm run verify:links
npm run test
npm run lint
npm run type-check
```

**Esperado**: todos os seis comandos terminam sem erro.

## Cenário 5 — Snapshot LEG preservado

1. `Select-String -Path docs/plan/migration-plan.md -Pattern 'LEG001'` → encontra LEG001–LEG017.
2. `Select-String -Path docs/plan/migration-plan.md -Pattern '2026-08-02'` → encontra o estado verificado.

**Esperado**: baseline de auditoria presente em `migration-plan.md`.

## Cenário 6 — Descoberta em ≤2 passos

1. Abrir `design-system/README.md`.
2. Localizar a seção de roteamento para "referência de tokens".
3. Seguir para `docs/plan/tokens-reference.md` e encontrar `radius-control` e `primary`.

**Esperado**: valor visual encontrado em no máximo dois cliques/passos a partir do README.

## Validação de entrega

- Commit criado na branch `02-08-26-refatorar-design-system-rules-plano`.
- PR aberto com a branch para `main`.
- CI/CD executa as verificações acima.
- Merge na main **somente** se a CI passar.
