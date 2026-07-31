# Quickstart: Migração segura do Design System

## Pré-requisitos

- Node.js e dependências instaladas;
- diretório raiz do projeto;
- servidor local disponível para validação visual;
- nenhuma alteração não relacionada misturada ao checkpoint.

## Baseline

```powershell
node scripts/capture-design-system-baseline.mjs --json > .artifacts/design-system/design-system-baseline.json
```

Resultado esperado: snapshot de fontes, rotas, exports e findings legados antes da primeira etapa.

## Gate de uma etapa

```powershell
node scripts/verify-design-system-legacy.mjs --strict
npm run verify:design-system
npm run type-check
npm run lint
npm test -- --run
npm run verify:links
```

Resultado esperado: zero findings bloqueantes, registry consistente e testes verdes. A etapa ainda exige revisão visual/acessível documentada.

## Revisão de rota

```powershell
npm run dev
```

Abrir cada rota do inventário, exercitar loading/empty/error/read-only e interações críticas, registrar o resultado em `RouteAcceptanceRecord` e capturar evidência do checkpoint.

## Gate final

```powershell
node scripts/verify-design-system-legacy.mjs --strict --json
npm run verify:design-system
npm run verify:links
npm run type-check
npm run lint
npm test -- --run
npm run build
```

Resultado esperado:

- `findings.length = 0` para o auditor legado;
- zero fontes públicas fora do registry;
- 39 componentes atuais e todas as rotas com evidência;
- zero tokens/classes/configurações legadas;
- build, testes, lint, type-check e links aprovados.

## Cenário controlado de regressão

Adicionar temporariamente `warm-bg`, `rounded-xl`, `font-black`, `text-[13px]`, `transition-all`, `sm:` ou um hex visual a uma fixture. O auditor MUST falhar com o código `LEG` correspondente; remover a linha MUST restaurar o checkpoint para verde.
