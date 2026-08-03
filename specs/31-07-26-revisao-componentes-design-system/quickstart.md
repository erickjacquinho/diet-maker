# Quickstart Guide - Loop de Verificação de Componentes

Guia rápido para validar a conformidade dos componentes durante a revisão.

## Validações Automatizadas

1. **Auditoria Estática de Legado**:
   ```bash
   node scripts/verify-design-system-legacy.mjs
   ```

2. **Auditoria Atômica**:
   ```bash
   node scripts/audit-atomic-design.mjs
   ```

3. **Verificação de Tipagem**:
   ```bash
   npx tsc --noEmit
   ```

4. **Suíte de Testes**:
   ```bash
   npx vitest run
   ```
