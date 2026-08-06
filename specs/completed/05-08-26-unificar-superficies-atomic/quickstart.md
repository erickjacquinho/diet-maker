# Quickstart de validação

Este guia valida a implementação depois que o plano for aprovado e executado. O SDD atual não altera `src/`.

## Pré-requisitos

- Node.js e dependências do projeto instaladas.
- Diretório de trabalho em `C:\Programmer\diet-maker`.
- Execução feita com `SPECIFY_FEATURE_DIRECTORY=specs/05-08-26-unificar-superficies-atomic` quando o comando Spec Kit depender do diretório ativo.

## Validação da base

```powershell
npm run type-check
npm run lint
npm test -- tests/components/atoms/surface.test.tsx
npm test
```

Resultado esperado: `Surface` aceita as variantes documentadas, repassa semântica/atributos, não renderiza estado de domínio e não introduz erros de tipos ou lint.

## Validação dos consumidores

```powershell
npm test -- tests/components/molecules/metric-box.test.tsx tests/components/molecules/macro-metric-card.test.tsx
npm test -- tests/components/organisms/metric-box-group.test.tsx
npm test -- tests/components/organisms/integration.test.tsx
```

Resultado esperado: conteúdo, props públicas, estados e callbacks dos consumidores permanecem compatíveis.

## Validação estrutural

```powershell
npm run audit:atomic-design
npm run verify:design-system
npm run verify:design-system-legacy
```

Resultado esperado: nenhuma dependência ascendente, nenhum primitivo UI acoplado ao domínio, catálogo sincronizado e nenhuma nova repetição proibida de tokens visuais.

## Validação visual e de entrega

1. Abrir as rotas principais de pacientes, consulta, dieta, receitas e alimentos.
2. Comparar superfícies default/subtle e os mapeamentos de consumidor tinted/inline com os estados existentes.
3. Validar teclado, foco visível, conteúdo opcional e estados vazios.
4. Registrar qualquer diferença intencional como exceção no catálogo.

```powershell
git diff --check
git diff --name-only -- src tests design-system
```

O conjunto de arquivos deve conter apenas a implementação da feature, seus testes e a documentação do catálogo.

## Execution evidence

Em 2026-08-05, o smoke test Playwright percorreu `/pacientes`, `/pacientes/pat-1`, `/pacientes/pat-1/consulta/2026-01-01`, `/pacientes/pat-1/dieta/nova`, `/receitas`, `/refeicoes-prontas`, `/presets`, `/alimentos` e `/design-system` em viewport 1440px, além de `/pacientes`, `/pacientes/pat-1/dieta/nova`, `/receitas` e `/refeicoes-prontas` em 1024px. Todas responderam HTTP 200 e não houve erros de console. Nenhuma diferença visual inesperada foi observada no smoke DOM; a homologação visual detalhada permanece responsabilidade do reviewer.
