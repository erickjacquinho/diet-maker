# Quickstart de validação: Biblioteca reutilizável

Este roteiro valida a implementação posterior da etapa 4 sem depender de dados
legados. Ele deve ser executado a partir da raiz do repositório depois que os
testes e a implementação definidos em `tasks.md` estiverem concluídos.

## Pré-requisitos

- As etapas 1, 2 e 3 da persistência local estão presentes e validadas.
- Node.js 22.23.1 e as dependências do projeto estão instalados.
- O ambiente de testes usa fixtures determinísticas, `fake-indexeddb` e PGlite
  isolado por caso.
- O navegador Chromium está disponível para a jornada Playwright em viewport
  desktop de pelo menos 1024 px.
- O banco local é inicializado com uma Conta de teste. Nenhuma chave de
  biblioteca do `localStorage` é pré-carregada ou convertida.

## Preparação local

```powershell
npm install
npm run type-check
npm run lint
```

Os comandos acima verificam a base antes da implementação da etapa. Os testes
específicos abaixo passam a existir conforme as tarefas de cada fase forem
executadas.

## Fixture mínima

Prepare duas Contas isoladas, `account-a` e `account-b`, e um dataset TACO
somente leitura. Em `account-a`, crie:

1. um alimento customizado com unidade, rendimento e nutrientes decimais;
2. uma receita com alimento TACO e alimento customizado;
3. uma refeição pronta com item `FOOD` e item `RECIPE`;
4. uma dieta confirmada contendo um snapshot da receita;
5. uma dependência que impeça a exclusão física de um alimento usado.

Deixe `account-b` sem acesso aos agregados de `account-a`. Use pelo menos uma
segunda versão de um alimento e de uma receita para validar que versões antigas
continuam legíveis e que snapshots já persistidos não mudam.

## Validação automatizada por fase

Execute os testes de baixo para cima à medida que cada fase for implementada:

```powershell
npm test -- tests/lib/library
npm test -- tests/infrastructure/library-migration.integration.test.ts
npm test -- tests/infrastructure/library-repositories.integration.test.ts
npm test -- tests/application/library
npm test -- tests/components/library
npm test -- tests/app/alimentos
npm test -- tests/app/receitas
npm test -- tests/app/refeicoes-prontas
npm test -- tests/architecture/library-legacy-boundary.test.ts
npm run type-check
npm run lint
```

Depois, execute as verificações de governança e o build:

```powershell
npm run verify:links
npm run audit:atomic-design
npm run verify:table
npm run verify:design-system
npm run build
```

## Jornada Chromium

Execute a jornada em série para evitar concorrência entre bancos locais:

```powershell
npm run test:browser -- tests/browser/library.spec.ts --workers=1
```

A jornada deve comprovar, nesta ordem:

1. criar um alimento customizado e encontrá-lo na biblioteca;
2. editar o alimento e confirmar nova versão sem alterar a versão anterior;
3. criar uma receita usando TACO e alimento customizado;
4. criar uma refeição pronta usando alimento e receita;
5. selecionar a refeição pronta na montagem de dieta e observar a cópia no
   `DietDraft`;
6. verificar que a seleção não confirma nem altera a dieta salva;
7. editar a origem na biblioteca, salvar a dieta e reabrir o histórico para
   confirmar o snapshot original;
8. arquivar uma origem usada e rejeitar a exclusão enquanto houver dependência;
9. confirmar que `account-b` não lista, consulta nem altera dados de
   `account-a`;
10. confirmar que as chaves `nutridiet_custom_foods`, `nutridiet_recipes` e
    `nutridiet_ready_meals` não são lidas nem escritas.

## Matriz de falhas esperadas

| Situação | Resultado esperado |
| --- | --- |
| Nutriente, rendimento ou quantidade inválida | `LIBRARY_VALIDATION_FAILED`; nenhuma gravação parcial |
| ID de outra Conta | `LIBRARY_SCOPE_VIOLATION`; nenhum dado revelado |
| Atualização com versão obsoleta | `LIBRARY_VERSION_CONFLICT`; versão corrente preservada |
| Falha durante gravação de filho | `LIBRARY_TRANSACTION_FAILED`; rollback do agregado |
| Exclusão com dependência ativa | `LIBRARY_DEPENDENCY_EXISTS`; arquivamento continua disponível |
| Receita ou refeição pronta recursiva | `LIBRARY_COMPOSITION_CYCLE`; transação rejeitada |
| Item de biblioteca arquivado | Não aparece em novos seletores; snapshots existentes permanecem legíveis |
| Recarregamento após inserção no draft | Draft mantém novos IDs e snapshots independentes |

## Critérios de aceite cobertos

- `FR-001` a `FR-005`: ciclo de vida, escopo por Conta, TACO estática e
  versionamento de alimentos.
- `FR-006` a `FR-010`: receitas, ingredientes, cálculo decimal e proteção de
  versões usadas.
- `FR-011` a `FR-017`: refeições prontas, composição sem ciclo, inserção no
  draft, snapshots, cutover do legado e estados da interface.
- `NFR-001` a `NFR-004`: atomicidade, desempenho de busca, acessibilidade e
  ausência de migração/dual-write.
- `SC-001` a `SC-007`: CRUD completo, isolamento, precisão, preservação
  clínica, jornada de draft e remoção das chaves legadas.

## Limites desta etapa

Este quickstart não cobre exportação, backup, sincronização remota, login,
restauração de banco ou revisão clínica da etapa 5. Também não autoriza a
migração de dados do `localStorage`: dados antigos são deliberadamente
descartáveis e o runtime deve iniciar pela fonte relacional canônica.
