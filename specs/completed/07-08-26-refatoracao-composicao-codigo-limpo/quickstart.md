# Phase 1: Quickstart & Validation Guide

**Feature**: [plan.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-composicao-codigo-limpo/plan.md)

---

## Runnable Verification Scenarios

### Scenario 1: Compilação TypeScript e Checagem Estática de Tipos
Garantir que a refatoração e decomposição de componentes não quebre contratos de tipos.
```bash
npm run build
# ou
npx tsc --noEmit
```
**Resultado Esperado**: Zero erros de compilação ou inconsistências de tipo.

---

### Scenario 2: Suíte de Testes Automatizados
Execução de toda a suíte de testes de componentes, páginas e stores.
```bash
npm test
```
**Resultado Esperado**: 100% dos testes passando sem falhas nem avisos de regressão.

---

### Scenario 3: Auditoria do Design System & Limites de Linhas de Código
Rodar scripts de verificação do repositório e contar linhas por arquivo refatorado.
```bash
node scripts/verify-design-system-components.mjs
node scripts/audit-z-index.mjs
```
**Resultado Esperado**: Todos os testes do catálogo do Design System passam, e o número de linhas de cada página refatorada em `src/app` fica abaixo de 250 linhas.
