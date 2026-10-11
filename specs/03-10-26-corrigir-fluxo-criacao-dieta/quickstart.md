# Quickstart: Validar o fluxo de criação e confirmação de dieta

## Pré-requisitos

- Checkout local com o profile de teste preparado conforme os testes do projeto.
- Instalar dependências somente se necessário para validação posterior.
- As tarefas T001–T026 foram implementadas; T025 executou a validação final e T026 fechou uma lacuna de round-trip identificada na convergência.

## Resultado implementado

- Snapshots preservam a base nutricional capturada e passam a refletir alterações de quantidade e substituição de fonte.
- `weightReferenceKg` sobrevive às conversões; g/kg não usa o peso cadastral quando uma dieta existente não tem referência recuperável.
- Salvamento distingue commit local, cleanup pendente, checkpoint pendente, rollback, conflito e resultado incerto; reconciliação usa ID estável e revisões condicionais.
- Saídas do editor dependentes do rascunho exigem flush `SAVED`; confirmação explícita bloqueia edição, mantendo autosave não bloqueante.
- Falhas ao abrir paciente, dieta ou armazenamento deixam o spinner e oferecem retry e retorno seguro.

O log de implementação contém os resultados dos testes de cada tarefa; este quickstart registra a validação abrangente de T025.

## Validação automatizada após implementação

Executar primeiro as regressões focadas nos contratos alterados:

```powershell
npm run test -- tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts tests/lib/diets/save-diet-as-active.test.ts tests/application/diets/diet-application-checkpoint.test.ts tests/hooks/useDietBuilderSaveOutcome.test.ts tests/hooks/useDietBuilderPage.test.ts tests/hooks/useDietMealActions.test.ts tests/hooks/useDietCalculations.test.ts tests/app/pacientes/diet-editor-persistence.test.tsx tests/app/pacientes/diet-editor-load-errors.test.tsx tests/components/templates/diet-builder-template.test.tsx tests/lib/diets/diet-validation.test.ts
```

Depois das regressões focadas:

```powershell
npm run type-check
npm run test
```

## Verificação manual no navegador

1. Abrir um paciente ativo e uma dieta existente com item carregado de snapshot.
2. Alterar quantidade, substituir item, salvar e reabrir; comparar origem, quantidade, nutrientes e g/kg com o editor.
3. Inserir ao menos um item de cada fonte já suportada pelo editor e confirmar a dieta.
4. Mudar o peso cadastral após existir prescrição e confirmar que o g/kg histórico mantém a referência antiga; para plano legado sem referência, confirmar que não há inferência.
5. Simular falha de flush e tentar Voltar, abrir matriz de ciclo e prévia; nenhuma transição dependente deve sair sem `SAVED`.
6. Abrir um diálogo de edição e usar Ctrl+S/Cmd+S; a confirmação não começa. Depois iniciar Salvar e tentar editar a região principal; ela fica bloqueada até o resultado, enquanto autosave normal segue não bloqueante.
7. Simular resultado incerto com e sem commit já aplicado, cleanup pendente e falha de checkpoint; verificar mensagem e que cada retry atua somente na etapa pendente.
8. Abrir o editor para paciente/dieta ausente ou paciente arquivado e verificar estado de erro com retry/back, sem spinner infinito.

**Resultado esperado**: dados exibidos e confirmados coincidem; estados de commit, cleanup e checkpoint não se confundem; nenhuma repetição duplica dieta; falhas não abandonam a última revisão do draft.

## Resultados desta implementação — 2026-10-03

- Testes focados do quickstart após T026: 11 arquivos, 66 testes aprovados. O round-trip confirma persistência e reabertura dos quatro tipos de origem.
- `npm run type-check`: aprovado.
- `npm run lint`: sem erros; um aviso Atomic Design preexistente em `src/components/organisms/CreateReadyMealsFromDietModal.tsx:151`.
- `npm run build`: aprovado em cópia isolada do checkout para preservar o servidor de desenvolvimento ativo em `localhost:3000`.
- Smoke desktop com Python Playwright em contexto de navegador novo: criou perfil e paciente sintéticos, abriu uma dieta, alterou Feijão para 200 g, confirmou uma dieta única e escreveu o checkpoint simulado; Ctrl+S dentro do diálogo de alimento não submeteu a dieta; zero erros de página.
- `npm run test -- --reporter=verbose`, executado em T025 antes da tarefa de convergência T026: 930 aprovados e 24 falhas em 14 arquivos. As mesmas 24 falhas foram reproduzidas nos arquivos afetados em uma cópia do checkpoint `3896134`, antes das alterações desta feature. As falhas de baseline são inconsistências existentes em versões de migrations/backup (11/12 e 7/8), homologação/contagem do catálogo de componentes, uma expectativa de classe da tabela de prescrições e mocks do App Router em testes do perfil do paciente. A nova regressão T026 passou no conjunto focado.
- `git diff --check`: aprovado.
