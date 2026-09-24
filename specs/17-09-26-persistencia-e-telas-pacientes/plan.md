# Plano de implementação: persistência e desempenho dos perfis

**Branch**: `persistencia-e-telas-pacientes` | **Data**: 2026-09-17 | **Spec**: [spec.md](spec.md)

## Summary

Manter o `.nutridiet` como save principal e gravá-lo somente em saves confirmados, `Ctrl+S` ou mudança de tela quando houver pendências. O PGlite persistente no IndexedDB será a área local de trabalho e recuperação. `/pacientes` consultará no banco até 25 linhas já filtradas e ordenadas e buscará seus resumos em lote; o perfil fará o mesmo para avaliações e dietas, usando um resumo nutricional derivado persistido por variação e carregando o cardápio completo sob demanda.

## Technical Context

| Item | Escolha |
| --- | --- |
| Linguagem e plataforma | TypeScript, Next.js App Router, React 19, web desktop |
| Banco local | PGlite 0.5.8 + Drizzle 0.45.2; IndexedDB no navegador e `memory://` nos testes |
| Save principal | Arquivo portátil `.nutridiet`, validado e escrito pelo File System Access API |
| Testes | Vitest, `fake-indexeddb` e Playwright já instalados |
| Escala de aceite | 100 pacientes, 2.000 dietas e 2.000 avaliações; até 25 resultados retornados por página de lista e histórico |
| Limite deliberado | Checkpoint ainda serializa o save completo; a redução vem de gravar somente quando necessário |

O VFS `idb://` já existe na dependência instalada e é a opção recomendada pela documentação do PGlite para navegador. Ele carrega os arquivos do banco em memória ao abrir; a paginação limita os dados lidos e montados pela tela, mas a memória total do motor continua proporcional ao banco local. Não introduzir OPFS, serviço remoto, novo pacote ou formato de save em múltiplos arquivos nesta entrega.

## Implementation Decisions

1. **Área de trabalho por Conta:** abrir PGlite em uma chave IndexedDB estável derivada do `accountId`. Importar o `.nutridiet` ao criar a área local; em uma reabertura, manter o workspace persistido para não apagar confirmações ainda pendentes. Uma restauração explícita valida o arquivo e substitui o workspace em transação.
2. **Checkpoint único e rastreável:** o coordenador central de operações confirmadas marca uma revisão pendente; `ProfileSession.sync()` exporta e grava apenas se `workspaceRevision > checkpointRevision`. Após sucesso, avança o checkpoint somente até a revisão exportada. Falhas mantêm a pendência. Gatilhos simultâneos compartilham a mesma gravação.
3. **Gatilhos:** save confirmado e `Ctrl+S` chamam o checkpoint; `SessionAwareAppShell` tenta novamente ao observar mudança de pathname, sem bloquear a navegação. A tela continua acessível mesmo se o arquivo estiver pendente, com o estado e a ação de retry existentes.
4. **Resumo sem varrer o cardápio:** armazenar totais nutricionais exatos por variação em tabela derivada local, atualizada na mesma transação que confirma a dieta. A listagem consulta os resumos, metas, dias e contagem de refeições das 25 dietas da página; não hidrata itens, alternativas ou snapshots. A restauração de um `.nutridiet` antigo recompõe a tabela derivada uma vez. O arquivo continua contendo os dados completos e o cache não altera o envelope portátil.
5. **Paginação mínima:** adicionar à paginação do `DataTable` suporte opcional à contagem total remota, mantendo o comportamento local existente para alimentos. A consulta de pacientes aplica busca, agrupamento e ordenação atuais antes de `LIMIT/OFFSET`; os resumos em lote são buscados somente para os IDs da página. Avaliações e dietas usam a mesma paginação no repositório e contagem total.
6. **Compatibilidade e documentação:** manter a leitura dos envelopes `.nutridiet` compatíveis e o formato atual do arquivo. Atualizar a referência de persistência que hoje chama o arquivo de backup para registrar a decisão mais recente do usuário.

## Constitution Check

- **Passa:** mudanças seguem a aplicação, os repositórios PGlite e o `DataTable` existentes; nenhuma dependência ou camada de serviço nova.
- **Passa:** tabela remota continua genérica e acessível; atualizar o perfil da molécula para documentar a contagem remota opcional. Nenhuma mudança visual além do controle de páginas existente.
- **Passa:** cenários de sucesso, falha de arquivo, compatibilidade e ordenação serão cobertos em `tests/`; execução pelo `/speckit-implement`.
- **Decisão do usuário:** `.nutridiet` passa a ser o save principal, substituindo a referência anterior em `refs/dieta-db/index.md` que o tratava como backup manual.

## Project Structure

### Documentation (this feature)

```text
specs/17-09-26-persistencia-e-telas-pacientes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
└── tasks.md (created in the next SDD state)
```

### Source Code (repository root)

```text
src/app/SessionAwareAppShell.tsx
src/components/molecules/{DataTable.tsx,data-table/types.ts}
src/components/organisms/patient/{PatientAssessmentsTable.tsx,PatientDietsTable.tsx}
src/hooks/{usePatientsPage.ts,usePatientProfilePage.ts}
src/lib/application/{composition-root.ts,profile-session.ts,patients/,diets/}
src/lib/infrastructure/local-db/{client.ts,migrations.ts,schema.ts,patient-repository.ts,clinical-repository.ts,diets/}
src/lib/infrastructure/file-system-access/browser-save-file.ts
src/lib/patientListView.ts
design-system/components/profiles/molecules/data-table.md
refs/dieta-db/index.md
tests/lib/application/ tests/infrastructure/ tests/components/ tests/browser/
```

**Structure Decision**: manter a arquitetura Next.js atual, sem API externa ou contrato HTTP; não criar diretório `contracts/`.

## Complexity Tracking

| Escolha | Razão | Alternativa menor rejeitada |
| --- | --- | --- |
| Workspace PGlite persistido e duas revisões locais | Recuperar mutações confirmadas após falha ou recarga sem regravar o `.nutridiet` | Manter somente o banco em memória perde o trabalho ainda não checkpointado |
| Cache derivado por variação | Evitar reabrir snapshots de itens para calcular a página do histórico | Agregar os itens em cada abertura mantém o custo proporcional aos detalhes |
| Contagem remota opcional no DataTable | Reutilizar o mesmo controle acessível na lista e nos históricos do perfil | Criar paginadores separados duplica navegação e estados de borda |
