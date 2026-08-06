# Quickstart: Validação da Eliminação dos Débitos do Design System

**Branch**: `02-08-26-eliminacao-debitos-design-system` | **Date**: 2026-08-02

Guia executável de validação por etapa. Rodar do **repo root** (`C:\Programmer\diet-maker`). Contratos em [contracts/audit-contract.md](./contracts/audit-contract.md); entidades em [data-model.md](./data-model.md).

## Pré-requisitos

- Node ≥ 20 e dependências instaladas (`npm install`).
- Sem modificação em `src/design-system/**` nem `src/app/design-system/page.tsx`.

## Etapa A — Instrumentação (regras LEG011–LEG017)

```powershell
npm run test                                  # fixtures das 17 regras + zero findings + isenções
node scripts/verify-design-system-legacy.mjs --strict --json > baseline.json   # congelar baseline (~798 findings)
```

**Esperado**: o teste "zero findings" **falha** nesta etapa (dívida ainda presente) — é o estado de partida; o teste de cobertura e os testes de isenção (ui/, design-system/) **passam**.

## Etapa B — Migração (por arquivo)

Para cada arquivo migrado `F`:

```powershell
npm run verify:design-system-legacy          # findings decrescem; conferir que só restam os de F e pendentes
npm run type-check                            # sem novos erros de tipo
npm run test                                  # suíte verde (exceto o teste "zero findings" até zerar tudo)
```

**Esperado**: contagem de findings estritamente decrescente; nenhuma regressão nos gates.

## Etapa C — Fechamento

```powershell
npm run verify:design-system-legacy           # saída: "0 legacy findings across N files"
npm run test                                  # suíte completa verde, incluindo "zero findings"
npm run type-check                            # 0 erros
npm run verify:design-system                  # componentes intactos
npm run audit:atomic-design                   # pontuação >= 96%
npm run build                                 # build de produção sem erros
```

**Esperado**: todos os comandos terminam com código de saída 0.

## Verificação de isenções (prova da decisão registrada)

```powershell
node scripts/verify-design-system-legacy.mjs --strict --paths "src/components/ui"      # 0 findings
node scripts/verify-design-system-legacy.mjs --strict --paths "src/design-system"      # 0 findings
node scripts/verify-design-system-legacy.mjs --strict --paths "tests/fixtures/design-system-legacy"  # 17 códigos
```

## Fechamento documental

- `design-system/components/registry.json`: `baseline` → zero findings; exceção `src/components/ui/**` registrada.
- `design-system/13-implementation-and-compliance.md`: estado verificado (17 regras, exceções, arquivos conformes).
- Re-rodar os comandos da Etapa C após a atualização documental (a doc não mascara código não conforme).
