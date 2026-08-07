# Quickstart & Validation Guide: Sidebar Typography

## Manual Verification Commands

### 1. Iniciar servidor de dev
```bash
npm run dev
```

### 2. Executar suíte de testes Vitest
```bash
npx vitest run tests/components/ui/sidebar.test.tsx
```

## Expected Outcomes
- O texto de todos os botões do menu lateral exibe o peso de fonte semibold (`600`) tanto no estado inativo quanto ativo.
- O componente preserva conformidade total com os testes unitários e com o `05-typography-system.md`.
