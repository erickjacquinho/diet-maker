# Quickstart: Validar o fluxo de criação e confirmação de dieta

## Pré-requisitos

- Checkout local com o profile de teste preparado conforme os testes do projeto.
- Instalar dependências somente se necessário para validação posterior.
- Implementação concluída seguindo este SDD; este guia ainda não foi executado.

## Validação automatizada após implementação

Executar primeiro as regressões focadas nos contratos alterados:

```powershell
npm run test -- tests/infrastructure/diet-snapshot-roundtrip.integration.test.ts tests/lib/diets/save-diet-as-active.test.ts tests/hooks/useDietBuilderPage.test.ts tests/app/pacientes/diet-editor-persistence.test.tsx tests/components/templates/DietBuilderTemplate.test.tsx tests/lib/diets/diet-validation.test.ts
```

Executar também as novas coberturas a serem criadas para:

- update de quantidade e substituição com snapshot já hidratado, incluindo TACO/custom/receita/refeição pronta;
- round-trip de `weightReferenceKg`, ausência histórica sem fallback e g/kg indisponível;
- commit, falha de cleanup, falha de checkpoint, rollback, conflito e resultado desconhecido;
- retry por identificador estável sem segunda dieta;
- bloqueio de navegação para todos os caminhos do editor quando o flush não retorna `SAVED`;
- edição bloqueada durante confirmação explícita, sem bloquear autosave em segundo plano;
- erro de abertura do paciente/dieta e retry/back acessíveis.

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
