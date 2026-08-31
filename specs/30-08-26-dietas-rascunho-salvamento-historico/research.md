# Research: Dietas — rascunho, salvamento e histórico

**Feature**: [spec.md](./spec.md)  
**Data**: 2026-08-31
**Status**: concluída; decisões aplicadas e validadas na implementação

## Decisão 1 — Integrar ao runtime local aprovado

**Decision**: Reutilizar TypeScript/Next.js/React e a base principal PGlite
`0.5.8` + Drizzle `0.45.2` já instalada. Estender o runtime aberto por
`src/lib/application/browser-composition.ts`, mantendo um único handle para
Conta, paciente e dietas. O rascunho continua em um IndexedDB lógico separado.

**Rationale**: As etapas 1 e 2 já fixaram motor, Conta e pacientes. Abrir outra
base ou reavaliar o provedor quebraria o escopo e a exclusividade por aba.

**Alternatives considered**: `localStorage` (legado sem invariantes), banco
online (fora da V1) e uma base PGlite separada para dietas (transação e escopo
fragmentados) foram rejeitados.

**Evidence**: `package.json`, `src/lib/infrastructure/local-db/client.ts`,
[PoC aprovada](../30-08-26-prova-tecnica-base-local/poc-report.md).

## Decisão 2 — Domínio e aplicação independentes dos adaptadores

**Decision**: Introduzir entidades puras de dieta/snapshot, portas
`DietRepository`, `DietDraftStore` e `PatientDietReader`, casos de uso sob
`src/lib/application/diets/` e uma `DietApplication` composta no runtime. Hooks
e componentes consomem somente essa aplicação e modelos de leitura.

**Rationale**: O código atual mistura `FullDietPlan`, strings formatadas, IDs
de interface e gravação direta no storage. A fronteira nova precisa validar
Conta, paciente, estados e versões sem expor PGlite ou IndexedDB à UI.

**Alternatives considered**: estender `dietStore.ts` como fonte canônica ou
acessar Drizzle nos hooks foram rejeitados. Um `TransactionRunner` genérico que
não recebe sessão transacional também não prova atomicidade; a operação atômica
de confirmação será contrato explícito de `DietRepository` e a implementação
local possuirá a transação completa.

## Decisão 3 — Documento local e agregado relacional confirmado

**Decision**: Manter `DietDraft` como documento aninhado completo, adequado à
edição, e normalizar a prescrição confirmada nas relações `diet_plans`,
`diet_variations`, `diet_variation_days`, `diet_meals`, `diet_meal_options`,
`diet_meal_items` e `diet_item_snapshots`. O item guarda ordem, papel e vínculo
de substituição; o snapshot 1:1 guarda a composição clínica autossuficiente. O
modo simples usa uma variação interna única; o modo ciclo usa as variações
existentes. A aplicação mapeia ambas para o editor atual.

**Rationale**: O draft precisa ser substituído/recuperado como unidade. O banco
confirmado precisa de FKs, ordem, consultas de histórico e snapshots sem JSON
monolítico. Uma representação uniforme evita colunas paralelas para refeições
simples e de ciclo.

**Alternatives considered**: persistir todo o plano como JSON (integridade e
consulta fracas) e criar tabelas separadas por modo (duplicação de contratos).

## Decisão 4 — Autosave por revisão, fila e remoção condicional

**Decision**: Implementar IndexedDB nativo em um namespace versionado, com
`draftId` como chave e índice único de contexto `(accountId, patientId,
routeDietId)`. `draftRevision` inteiro ordena gravações. Um coordenador por aba
serializa por draft e associa cada callback a um token em memória. Descartar
cancela tokens antigos e enfileira a exclusão depois da operação em curso.
Depois do commit, `removeIfRevision(draftId, confirmedRevision)` apaga apenas se
a revisão armazenada ainda for a confirmada.

**Rationale**: Comparar timestamp não basta para ordenar callbacks. Fila e
remoção condicional impedem que autosave antigo recrie o draft ou apague edição
nova, sem tombstone persistente, geração de base ou protocolo distribuído.

**Alternatives considered**: debounce sem flush, `updatedAt` como controle de
concorrência, fallback para `localStorage` e tombstones permanentes.

**Evidence**: a PoC possui um `IndexedDbDraftStore`, mas ordena por timestamp e
não atende sozinha ao protocolo final; será usada como aprendizado, não copiada
como produto.

## Decisão 5 — Protocolo de confirmação com resultado explícito

**Decision**: `saveDietAsActive` executa: congelar edição; drenar autosave;
persistir último documento; reservar e persistir `targetDietId` uma única vez;
validar conteúdo mínimo e snapshots; confirmar o agregado em uma transação;
aguardar durabilidade; remover condicionalmente a revisão; atualizar leitores e
navegar. Botão e `Ctrl+S` usam a mesma função assíncrona e o mesmo bloqueio.

O repositório retorna `COMMITTED_NEW`, `COMMITTED_UPDATE` ou
`ALREADY_COMMITTED`. Erros distinguem `ROLLED_BACK`, `RESULT_UNKNOWN`,
`VERSION_CONFLICT`, `VALIDATION`, `SCOPE`, `STORAGE_UNAVAILABLE` e
`CLEANUP_PENDING`. Em `RESULT_UNKNOWN`, o caso de uso lê pelo ID estável. Para
nova dieta, existência no mesmo escopo comprova a tentativa; para edição, a
identidade e versão esperada + 1 comprovam o resultado. Não comparar hash e não
gerar outro ID.

**Rationale**: Esta máquina de estados implementa as diferenças clínicas
exigidas entre rollback, incerteza e falha posterior ao commit.

**Alternatives considered**: retry automático, tabela de recibos, hash de
payload e ID novo a cada tentativa foram rejeitados pelas Decisões 01/14.

## Decisão 6 — Snapshot nutricional autossuficiente

**Decision**: Ao inserir TACO, capturar fonte, ID, versão explícita do dataset
empacotado (`TACO_DATASET_VERSION`), nome, rótulo original de preparo, estado
normalizado, base por 100 g, quantidade/unidade, fibra, macros, energia de
referência, proveniência da energia, regra de cálculo e conversões aplicadas.
O dataset empacotado atual tem 597 registros e deve receber uma versão de
manifesto incrementada sempre que o JSON mudar. A normalização mapeia
`inNatura` para `RAW`, `Cozido` para `COOKED`, preparos térmicos para
`PREPARED` e industrializado/conserva para `AS_SOLD`, preservando também o
rótulo original. Quantidade é recalculada a partir da base congelada. A etapa
3 restringe a fonte selecionável a TACO; abas de customizados, receitas e
refeições prontas não podem trazer dados legados.

**Rationale**: O `FoodAddPayload` atual perde versão, base e fibra, enquanto os
cálculos atuais recalculam kcal por 4–4–9. Isso não reproduz 128 kcal/100 g do
arroz TACO. Um snapshot completo elimina leitura viva e prepara as fontes da
etapa 4 sem implementá-las.

**Alternatives considered**: gravar somente macros totais, `JOIN` vivo com a
TACO, ou usar 4–4–9 mesmo quando kcal estão informadas.

## Decisão 7 — Precisão no banco e arredondamento na apresentação

**Decision**: Adicionar `decimal.js` `10.6.0` como dependência direta de
produção e usar `DecimalString` canônica no domínio, no IndexedDB e nos
contratos. As novas colunas de quantidade e nutrientes usam `numeric` no
Drizzle sem conversão para `number`. Um módulo nutricional configura precisão
explícita e `ROUND_HALF_UP`, rejeita `NaN`/infinito e recalcula sempre da base
congelada, sem arredondar itens ou refeições durante o cálculo. A apresentação
arredonda para uma casa em macros/fibra, inteiros em kcal e duas casas em g/kg.

**Rationale**: `number`/`real` não prova o contrato de precisão clínica e a PoC
usou `real`; portanto ela não cobre este risco. `DecimalString` atravessa sem
perda o draft, o banco e a futura exportação, enquanto o snapshot novo adota
precisão superior sem reescrever a etapa 2. A regressão 100→50→100 deve
recuperar exatamente a base.

**Alternatives considered**: depender do `decimal.js` transitivo de `jsdom`,
usar `number`/`real`, arredondar a cada alteração, derivar kcal da soma de
rótulos e mudar retroativamente colunas de paciente.

## Decisão 8 — Evolução aditiva e integridade de escopo

**Decision**: Acrescentar uma migration após a última existente no momento da
implementação, sem editar migrations aplicadas. Criar FKs compostas de
Conta/paciente/plano, checks de status/versão/posição/quantidade, e índice único
parcial de `ACTIVE` por `(accountId, patientId)`. O plano anterior só vira
`SNAPSHOT` dentro do mesmo commit que confirma a nova vigente.

**Rationale**: Filtros de aplicação não evitam referências cruzadas nem duas
vigentes em falha do adaptador. A migration deve preservar Conta/pacientes e
ser idempotente pelo journal existente.

**Alternatives considered**: alterar `0000`, confiar só no hook e demover a
vigente em operação anterior ao insert.

## Decisão 9 — Runtime único e bloqueio antes de abrir a base

**Decision**: Portar a trava Web Locks aprovada na PoC para a infraestrutura
principal e adquiri-la antes de abrir PGlite. O runtime unificado mantém a lease
até fechar a base. Falha ou segunda aba bloqueia toda aplicação local com erro
nominal; não abrir runtime paralelo de pacientes e dietas.

**Rationale**: `openLocalDatabase` e `getBrowserPatientRuntime` atuais ainda não
adquirem a trava. Reutilizar apenas a decisão documental não entrega a proteção.

**Alternatives considered**: coordenação de abas, eleição de líder, leitura
compartilhada e liberar a trava antes de fechar o banco.

## Decisão 10 — Perfil e histórico por leitores canônicos

**Decision**: `PatientDietReader` fornece vigente, histórico ordenado, fontes de
cópia e contagens a partir do banco. `PatientProfileReader` recebe suas
contagens reais. O perfil pode receber separadamente um resumo de draft para
“Retomar rascunho”; ele nunca é inserido na lista histórica. Histórico não
expõe excluir e só expõe editar para `ACTIVE`.

**Rationale**: `usePatientProfilePage` atualmente zera dietas e o componente
`PatientDietsTable` usa tipos legados, mostra editar/excluir em todas as linhas
e chama o estado “Ativa”. O cutover precisa ocorrer em conjunto.

**Alternatives considered**: reativar `patient.dietHistory`, mesclar resultados
do banco com `nutridiet_diets_*`, ou tratar draft como linha de tabela.

## Decisão 11 — Preservar o design system e resolver débitos no caminho

**Decision**: Reutilizar `DataTable`, controles e overlays catalogados. Adaptar
composições de domínio para status de autosave/salvamento, mínimo inválido e
descarte. O `ReadOnlyDietModal` será movido para a camada organism, como já
exige seu perfil `migration-required`. Qualquer renome ou nova composição de
descarte atualiza registry/profile depois de consultar `overlays`; não alterar
primitivos em `src/components/ui`.

**Rationale**: A mudança conecta estados de persistência; não cria uma direção
visual. Estados precisam de texto/live region, foco preservado e ações visíveis
por teclado, não só em hover/cor.

**Alternatives considered**: nova tabela customizada, toast para todo autosave,
ou semântica clínica adicionada aos primitivos Shadcn.

## Decisão 12 — Arquivamento canônico e limpeza local desacoplada

**Decision**: Após `archivePatient` confirmar no banco, chamar a invalidação de
drafts do paciente. Se a limpeza falhar, manter o paciente arquivado, retornar
estado `cleanupPending` e impedir o salvamento por revalidação do paciente. A
restauração não remove a invalidação nem recria documentos.

**Rationale**: IndexedDB e PGlite não compartilham transação. Desfazer o
arquivamento por erro local inverteria a autoridade canônica.

**Alternatives considered**: limpar antes de arquivar, rollback compensatório
do paciente e reativação automática após restaurar.

## Decisão 13 — Validação test-first e proporcional

**Decision**: Contratos/falhas precedem adaptadores. Testes cobrem domínio,
IndexedDB, repositório relacional, integração, hooks/componentes, fronteira
arquitetural, migration, reabertura real, offline preparado e busca TACO. Usar
fixtures simples, ciclo, conflito, rollback e resultado incerto. Registrar a
meta <100 ms após inicialização, sem nova certificação de 100 mil itens.

**Rationale**: Atomicidade, revisão e snapshot são invariantes com risco de
perda clínica; testes apenas visuais ou apenas em memória não os provam.

**Alternatives considered**: reaproveitar testes legados que afirmam
`localStorage`, medir dentro do render ou tratar o verificador global de design
system como evidência específica sem separar achados preexistentes.

## Conclusão

Não resta decisão técnica bloqueadora. As decisões mantêm o escopo da etapa 3,
incluem o mínimo confirmado pelo usuário e não criam recibos, sincronização,
biblioteca reutilizável ou backup. A implementação continua dependente de
validação humana e deve ser executada apenas por `/speckit-implement`.
