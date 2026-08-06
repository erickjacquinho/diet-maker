# Quickstart Validation Guide - Design System Audit

Este guia resume os comandos para executar e validar a auditoria de inconsistências do Design System em todas as telas.

## Prerequisites

- Node.js instalados.
- Dependências instaladas (`npm install`).

## Validation Commands

1. **Auditoria Estática de Legado**:
   ```bash
   node scripts/verify-design-system-legacy.mjs
   ```
   *Resultado esperado*: `0 legacy findings across 69 files`.

2. **Auditoria de Atomic Design**:
   ```bash
   node scripts/audit-atomic-design.mjs
   ```
   *Resultado esperado*: Todos os componentes mapeados nas camadas atômicas sem divergências.

3. **Verificação de Tipagem TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
   *Resultado esperado*: 0 erros de compilação.

4. **Execução da Suíte Completa de Testes**:
   ```bash
   npx vitest run
   ```
   *Resultado esperado*: 30 arquivos de teste aprovados (112 testes).
