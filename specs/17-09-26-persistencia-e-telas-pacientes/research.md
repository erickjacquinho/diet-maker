# Pesquisa técnica

## PGlite persistente no navegador

O projeto já fixa `@electric-sql/pglite@0.5.8` e `drizzle-orm@0.45.2`. O PGlite expõe o VFS `idb://` sem adaptador adicional; a documentação o recomenda para navegadores. O VFS abre os arquivos do banco em memória e os grava no IndexedDB após consultas alteradoras. Manter a durabilidade padrão para que o workspace sirva de recuperação; não usar `relaxedDurability` nesta mudança. OPFS depende de Web Worker e tem suporte diferente entre navegadores, então não é a escolha mínima.

- [PGlite Filesystems](https://pglite.dev/docs/filesystems)
- [PGlite API](https://pglite.dev/docs/api)
- Código instalado: `src/lib/infrastructure/local-db/client.ts`; runtime criado em `src/lib/application/browser-composition.ts`.

Hoje cada sessão usa `memory://` aleatório e importa o arquivo novamente. Para persistir pendências, é necessário derivar uma chave estável da Conta e não sobrescrever um workspace existente durante a reabertura. A restauração explícita continua substituindo esse workspace após validar o arquivo.

## Save e navegação

`createConfirmedOperationCoordinator` centraliza as mutações confirmadas de pacientes, clínica, dietas e biblioteca e chama `ProfileSession.sync()`. Essa sessão exporta o snapshot integral e o arquivo é substituído em cada sync. `SessionAwareAppShell` já acompanha `usePathname()`, o que permite uma tentativa central após a mudança de rota, sem interceptar `Link` e cada chamada `router.push()`.

O handle associado do arquivo já é lembrado no IndexedDB. A área de trabalho PGlite ainda é volátil; o editor de dieta já tem um `IndexedDbDietDraftStore`, mas o runtime do navegador usa `InMemoryDietDraftStore`.

## Telas e consultas

- `/pacientes` busca os pacientes ativos e seus resumos clínicos em lote (quatro consultas no teste atual de 100 pacientes, 2.000 dietas e 2.000 avaliações). Já evita hidratar históricos completos; busca, agrupamento e ordenação em `patientListView.ts` têm semântica local `pt-BR`. Preservar esse fluxo e usar paginação visual de 25 linhas.
- O perfil carrega todas as avaliações e todos os resumos de dieta. Cardápio completo já é consultado sob demanda. O salvamento clínico já evita recarregar o histórico dietético.
- Paginação real do perfil deve preservar avaliação mais recente e ordenação estável (`clinicalDate DESC`, `createdAt DESC`, `id ASC`). Dietas devem limitar planos antes de consultar suas variações e resumos.
- `listHistoryViews` agrega snapshots dos itens de todas as dietas em cada abertura. Persistir os totais derivados por variação junto ao save da dieta evita essa leitura repetida. Metas, dias, refeições, status e data já estão nas tabelas compactas.
- O `DataTable` atual corta o array recebido localmente. A extensão mínima é aceitar a contagem remota na paginação e manter o corte local quando essa contagem não for fornecida.

## Formato e decisões anteriores

O envelope `.nutridiet` atual é schema 6 e contém os dados relacionais completos; versões 4 e 5 continuam aceitas. O cache de resumos será local e derivável, portanto não exige alteração do envelope. Arquivos antigos reconstroem o cache durante a importação.

`refs/dieta-db/index.md` registra uma decisão anterior em que o banco era principal e o arquivo era backup. A instrução mais recente do usuário altera essa prioridade; atualizar a referência ao implementar para não manter contratos conflitantes.
