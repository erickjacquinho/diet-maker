# Quickstart: validação da adequação

Este guia será executado após aprovação humana e implementação via
speckit-implement. Não é evidência de execução nesta criação do SDD.

## Preparação

Raiz: C:/Programmer/diet-maker. Usar dependências já instaladas; não rodar
instalação/update. Recapturar mudanças concorrentes antes de tocar no código.

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='specs/30-08-26-adequacao-componentes-design-system'
git status --short
npm run type-check
npm run lint
npm run verify:design-system
npm run verify:table
```

Na baseline, erros conhecidos são esperados e registrados. Salvar hashes/diffs
e resultados em baseline.md e evidence/ dentro deste SDD. Nenhuma escrita em
fontes protegidas ou dados de pacientes.

## Resolver tabelas

Exemplo após migração (na baseline, usar a fonte atual do inventário):

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='specs/30-08-26-adequacao-componentes-design-system'
npm run resolve:table -- --target src/components/organisms/diets/ImportPreviousDietModal.tsx --json
npm run verify:table -- --target src/components/organisms/diets/ImportPreviousDietModal.tsx --strict
```

Repetir para RecipeSearchResultsList, ReadyMealSearchResultsList,
PatientAssessmentsTable, PatientDietsTable, PatientConsultationHistoryTable e
PatientListTable. Resolver também FoodSearchResultsList quando exposto pelos
pais FoodSearchModal/SubstituteFoodModal. Ler contrato e filhos reportados;
não manter decisões de versão antiga. Os targets finais devem ter zero erro
e os avisos delimitados devem desaparecer por resolução de ownership.

## Test-first e regressões

Antes de mudar produção, acrescentar cenários nos testes existentes, preservando
todos os comportamentos já cobertos; os novos arquivos específicos ficam em tests.

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='specs/30-08-26-adequacao-componentes-design-system'
npm test -- tests/design-system/component-adequation.contract.test.ts
npm test -- tests/architecture/component-adequation.test.ts
npm test -- tests/components/component-adequation
npm test -- tests/components/organisms tests/components/molecules tests/components/overlays-accessibility.test.tsx tests/tooling/table-conformance.test.ts
```

O diretório tests/components/component-adequation será criado pelas tarefas
para cenários novos das famílias. Testes antigos próximos ao código serão
mantidos/migrados em caminho sem perder asserções.

A suíte tests/design-system/component-catalog.test.mjs é excluída pelo Vitest
default atual. A tarefa de testes criará uma config local da feature que mantém
plugins/setup e inclui explicitamente essa suíte e seu contrato, sem editar
a configuração global ou as expectativas para aceitar findings:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='specs/30-08-26-adequacao-componentes-design-system'
npx --no-install vitest run --config specs/30-08-26-adequacao-componentes-design-system/vitest.catalog.config.ts
```

## Gates finais

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='specs/30-08-26-adequacao-componentes-design-system'
npm run type-check
npm run lint
npm test
npm run build
npm run verify:links
npm run audit:atomic-design
npm run audit:z-index
npm run verify:design-system-legacy
npm run verify:design-system
npm run verify:table
```

Exigir zero erro do escopo e não aceitar exit 0 sozinho quando a saída reportar
violações/avisos. Executar a config de catálogo acima além de npm test.
Registrar resultados atuais, inclusive failures externos novos.

## Navegador isolado

Usar o runner Playwright já disponível com contexto descartável. Não reutilizar
banco/perfil do usuário nem capturar dados clínicos.
As tarefas criarão fixtures e tests/browser/component-adequation.spec.ts.
Criar playwright.config.ts dentro deste SDD, com testDir apontando para
tests/browser na raiz do projeto, seleção somente do teste desta feature,
servidor próprio em porta livre, reuseExistingServer: false e baseURL coerente.
Não alterar a config global. Validar isolamento antes de uso; abortar se houver
conflito, sem acoplar-se a servidor concorrente ou perfil com dados pessoais.

```powershell
$env:SPECIFY_FEATURE_DIRECTORY='specs/30-08-26-adequacao-componentes-design-system'
npx --no-install playwright test --config specs/30-08-26-adequacao-componentes-design-system/playwright.config.ts
```

| Cenário | Conteúdo e operações a validar |
| --- | --- |
| Ações/resumos | IconButton e Delete/Edit, macros com valores/ausência, ordem e unidades |
| Categorias/resultados | alimentos/refeições/receitas, busca vazia/sem resultado, seleção e nomes longos |
| Ciclos | seleção/modo, ações separadas e reordenação acessível existente |
| Modais | abrir por teclado, foco inicial/retorno, Escape, erro de importação, somente leitura, overflow |
| Histórico | pacientes, avaliações e dietas; vazio, linhas preenchidas, expansão, ordenação/seleção aplicáveis |

Amostrar 1024px e 1440px dentro do desktop vigente; registrar altura, zoom e
reduced motion. Confirmar header/footer acessíveis, ausência de perda de dados,
semântica e foco. Não congelar screenshot nova sem revisão visual.

## Resultado

Criar validation-report.md com FR/NFR/SC → fonte → teste/evidência, comparar
fontes protegidas/campos de registry e registrar limitações. Não declarar
revisores humanos como aprovadores sem revisão real. A implementação só está
concluída no escopo após cumprir contracts/validation.md; sucesso global exige
todos os gates globais verdes.
