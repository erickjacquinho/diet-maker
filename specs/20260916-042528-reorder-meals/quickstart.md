# Validação rápida

## Testes focados

```powershell
npm test -- --run tests/app/pacientes/diet-nova-carb-cycling-sync.test.tsx
npm test -- --run tests/components/organisms/diet-meals-section.test.tsx
npm test -- --run tests/hooks/useDietMealActions.test.ts
```

## Verificação estática

```powershell
npm run type-check
```

## Fluxo manual

1. Abrir a criação de dieta com pelo menos duas refeições.
2. Clicar em `Reordenar`, mover um card por arraste e confirmar; durante o movimento, conferir que os cards vizinhos abrem caminho e deslizam, em vez de apenas exibir um ghost.
3. Reabrir, mover por teclado e testar `Esc`/clique fora com e sem alterações.
4. Abrir o tooltip da badge de itens e conferir nome, quantidade e macros.
5. No ciclo de carboidratos, repetir em duas variações e confirmar que só a ativa mudou.
6. Partindo de uma dieta simples, trocar para ciclo e clicar em `Nova Refeição`; conferir o card e a busca de alimentos.
