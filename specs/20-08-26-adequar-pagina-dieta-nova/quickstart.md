# Quickstart: Validação da Página de Elaboração de Dieta

## 1. Executar Testes Automatizados
```bash
npm test tests/components/templates/diet-builder-template.test.tsx
npm test tests/components/templates/diet-builder-template.surface.test.tsx
```

## 2. Executar Auditoria de Atomic Design
```bash
node scripts/audit-atomic-design.mjs
```

## 3. Executar Auditoria de Regras Legadas de Design System
```bash
node scripts/verify-design-system-legacy.mjs
```

## 4. Validação Visual Manual
1. Iniciar servidor: `npm run dev`
2. Acessar `/pacientes/pat-1/dieta/nova`
3. Verificar a fidelidade visual dos cartões, badges de macronutrientes, edição de refeição, busca TACO, escala e exportação WhatsApp.
