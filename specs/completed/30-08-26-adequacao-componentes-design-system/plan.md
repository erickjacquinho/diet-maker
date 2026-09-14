# Implementation Plan: Adequação de componentes ao design system

**Directory**: specs/30-08-26-adequacao-componentes-design-system
**Date**: 2026-08-30
**Spec**: [spec.md](./spec.md)
**Status**: Proposto; aprovação humana e execução via speckit-implement pendentes.
Nenhuma branch criada ou trocada pelo SDD.

## Summary

Adequar as onze famílias citadas, seus filhos compartilhados e consumidores
necessários ao contrato vigente. Corrigir código e semântica, completar perfis
e reconciliar inventário. Não alterar fundamentos/tokens/primitivos/auditores.
As decisões D1–D8 estão em [research.md](./research.md), e a superfície-alvo
em [contracts/components.md](./contracts/components.md).

## Technical Context

**Language/Version**: TypeScript 5.7.3, React 19.2.8 e Next.js 15.5.22,
conforme package-lock.json lido nesta passagem.
**Primary Dependencies**: Radix/Shadcn locais, Tailwind 3.4.19, Lucide e componentes
canônicos existentes; nenhuma instalação/atualização de dependência.
**Storage**: apenas artefatos Markdown/JSON do catálogo; persistência clínica intocada.
**Testing**: Vitest 4.1.10, Testing Library, auditores Node e Playwright 1.62.1
já disponíveis; testes novos sob tests; config de catálogo dedicada no SDD.
**Target Platform**: web desktop canônico a partir de 1024px; tema vigente.
**Project Type**: aplicativo Next.js com componentes Atomic e catálogo local.
**Performance Goals**: preservar paginação/virtualização, resultados e comportamento
de busca; comparar datasets e quantidades de rows/eventos em testes determinísticos.
Nenhum SLO, tuning de banco ou benchmark clínico novo.
**Constraints**: fontes protegidas conforme D1; trabalho concorrente em dieta-db;
sem globals mutáveis, dados pessoais, perda de comportamento ou enfraquecimento
de gates; corrigir composição antes de inventar novo componente.
**Scale/Scope**: onze famílias principais, MacroSummary, famílias de rows e
pais necessários. Snapshot atual: 17 erros estritos e 5 avisos de filhos.

## Constitution Check

| Princípio | Antes da pesquisa | Após o desenho |
| --- | --- | --- |
| I — Atomic | PASS: classificar responsabilidade antes de editar | PASS: coordenadores em organisms, helpers em molecules, migração de consumidores sem reexport ascendente |
| II — Fonte canônica | PASS: categorias antes dos perfis | PASS: somente especializações/cadastro mudam; nenhuma regra visual nova |
| III — Desktop/a11y | PASS: limites existentes referenciados | PASS: testes teclado/estado e inspeção desktop/zoom/reduced motion |
| IV — Test-first/isolation | PASS: baseline antes de refatorar | PASS: regressões precedem código e dados sintéticos isolados |
| V — SDD | PASS: escopo documental | PASS: tasks futuras desmarcadas, execução bloqueada até aprovação humana |

PASS refere-se à conformidade do desenho, não ao código atual. Achados atuais
motivam a migração; não são ignorados. Conflito inesperado com fonte protegida
interrompe a alteração correspondente, sem “corrigir” a norma.

## Project Structure

### Documentation (this feature)

- spec.md, clarification-audit.md e checklists/requirements.md, design-system.md;
- plan.md, research.md, data-model.md;
- contracts/components.md e contracts/validation.md;
- quickstart.md e tasks.md;
- analysis-report.md (Estado Analyze);
- baseline.md, evidence/, validation-report.md, vitest.catalog.config.ts e playwright.config.ts
  serão criados somente na execução futura.

### Source Code (repository root)

- src/components/atoms/IconButton.tsx;
- src/components/molecules/{MacroProportionBar,MacroSummary}.tsx;
- src/components/molecules/food-search/{FoodSearchCategorySelector,ReadyMealSearchResultsList,RecipeSearchResultsList}.tsx;
- src/components/organisms/diet/{CarbCyclingVariationPanel,DietModeSwitcher}.tsx (destinos);
- src/components/organisms/foods/{FoodSearchModal,SubstituteFoodModal}.tsx (destinos);
- src/components/organisms/diets/{ImportPreviousDietModal,ReadOnlyDietModal}.tsx;
- src/components/organisms/patient/{PatientAssessmentsTable,PatientDietsTable,ConsultationHistoryRow,PatientListTableRow}.tsx;
- pais PatientConsultationHistoryTable, PatientListTable, DietContextSection;
- barrels, rotas, hooks e templates somente para integrar imports/contratos existentes;
- design-system/components/profiles/ e registry.json para especializações;
- tests/design-system/, tests/components/, tests/architecture/, tests/browser/
  e tests/fixtures/ para contratos e regressões.

**Structure Decision**: manter famílias por responsabilidade, sem aglutinar
milhares de linhas para evitar cadastro. Perfis da família de rows representam
parts do mesmo arquivo e enumeram todos os exports. Coordenação de seção sai
de molecules; fontes de dados e funções de cálculo não são movidas para ui/atoms.

## Phase 0 — Baseline e pesquisa executável

1. Recapturar status Git, fontes, consumidores diretos/barrels/dinâmicos e
   testes da matriz. Registrar estado dos arquivos já modificados por terceiros.
2. Registrar hashes das fontes protegidas e snapshot dos campos protegidos
   do registry, além dos achados completos de todos os gates.
3. Resolver DataTable em cada consumidor afetado via proj-table-adequation-v2.
   Divergência API/perfil é CONTRACT_DRIFT, nunca permissão para inventar regra.
4. Criar testes de regressão negativos e fixtures isoladas antes dos refactors;
   incluir suíte de catálogo excluída da configuração default e testes das
   fronteiras/caminhos finais antes de mover componentes.

## Phase 1 — Contratos documentais e inventário

Completar os perfis existentes de IconButton e MacroProportionBar; alinhar
categoria única, eliminar valores locais duplicados e referências tipográficas
incorretas. Completar perfis dos modais atuais e criar perfis das famílias já
existentes sem cobertura, segundo D6. Atualizar registros incrementalmente
com fontes reais e estado migration-required quando ainda não migrado.
Não declarar código conforme antes da Phase 3.

No registry, atualizar apenas componentes e relações cadastrais necessárias;
não alterar a definição, compatibilidade, limite ou lifecycle de categorias/traits.
Recalcular baseline após as migrações; número de fontes descobertas não é
igual a número de entradas/famílias.

## Phase 2 — Adequação de código por grupo

### A. Ações e resumos

Preservar IconButton e seus compound-parts, consumindo Button e tokens atuais.
Adequar MacroProportionBar/MacroSummary em tipografia, macro order, cores e
semântica, sem alterar funções de cálculo. Percentual dinâmico derivado de
dados é permitido; valor estático arbitrário não. Não forçar ausência a zero.

### B. Seleção, busca e substituição

Migrar painel/modo e busca/substituição para destinos organisms, fechando imports.
Adequar semântica de seleção via primitivos existentes e labels/estados.
Os resultados usam DataTable com empty/loading/error internos, chaves e
seleção tipada, preservando nutrientes/callbacks. Não alterar stores ou domínio.

### C. Importação e consulta

Mover a implementação de ImportPreviousDietModal para o destino organism;
retirar fachada invertida e caminho antigo após migração completa. Manter
promessas/erros de ações de importação e preservação da origem.
Manter o ReadOnly organism e corrigir suas receitas locais, borda, tipografia,
scroll e conteúdo sem recálculo. Retirar o ReadOnly molecule órfão somente com
evidência atual de zero uso; atualizar testes de presença para a fonte correta.

### D. Tabelas de pacientes e filhos

Adequar PatientAssessmentsTable/PatientDietsTable, MacroSummary e famílias de rows.
Sem card decorativo dentro de cells, roles que apaguem semântica de tabela,
valores arbitrários ou informação crítica dependente de cor. Reaproveitar
DataTable existente, sem duplicar seleção, cabeçalhos ou empty. Resolver os
cinco avisos de filhos com ownership/cadastro e testes diretos.

## Phase 3 — Validação e entrega

Executar [quickstart.md](./quickstart.md); revalidar todos os consumidores,
inclusive snapshots/fixtures da dieta em andamento. Reconciliar inventário/
baseline/exports finais, executar os gates globais e a suíte de catálogo
explícita, e inspecionar cada família em navegador isolado. Registrar hashes,
diffs, comandos, saídas, evidências e rastreabilidade.

O navegador usa config dedicada dentro deste SDD, servidor próprio em porta
livre e reuseExistingServer: false; abortar se não houver isolamento. Essa config
não altera o runner/config global. Fixtures e contextos são descartáveis.

Nomes/versões/contagens anteriores não são garantias de sucesso. Em caso de
novos achados fora do escopo, registrar bloqueio e não alegar aprovação global.

## Risks and recovery

| Risco | Prevenção | Recuperação |
| --- | --- | --- |
| Migração paralela de dietas altera API | baseline e releitura antes de cada edição compartilhada | preservar diff alheio; coordenar somente conflito concreto |
| Fachada confundida com implementação | comparar conteúdo/props e grafo de imports | não converter dados; reabrir decisão se consumidor novo surgir |
| Remoção quebra teste estrutural | inventariar literais e barrels, não apenas imports TS | migrar caminho mantendo as mesmas asserções |
| Auditor verde com problema visual | contrato + testes comportamentais + navegador | corrigir consumidor e repetir evidências afetadas |
| Bloqueio na camada primitiva protegida | resolver API viva antes de compor | registrar CONTRACT_DRIFT e pedir direção; nunca alterar a regra |
| Alteração de banco durante QA | fixtures e contextos descartáveis | abortar se a sessão não estiver isolada |
| Cadastro amplo sobrescreve concorrência | patch por entrada/campo e releitura de registry | reconciliar entradas atuais, sem substituir o arquivo por snapshot antigo |

## Complexity Tracking

Nenhuma exceção constitucional proposta. Impacto previsto: correções internas,
documentais e migração de caminhos internos com todos os consumidores atualizados.
Não há release/pacote externo, nova API de negócio ou compatibilidade de dados
a ser introduzida.
