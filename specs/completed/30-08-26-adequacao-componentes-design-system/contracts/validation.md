# Validation contract

## Baseline

Executar os comandos globais do quickstart e registrar resultados com paths,
sem assumir estabilidade das contagens. Baseline observada em 2026-08-30:
17 erros de catálogo e 5 avisos TABLE016; tabelas 12/12 sem erros.
Registrar hashes das fontes protegidas e snapshot dos campos protegidos de
registry antes da implementação. Guardar evidências apenas nesta pasta.

## Conjunto obrigatório

1. Contratos de catálogo com fixtures válidas/inválidas e cobertura real das
   famílias/exports (inclusive MacroNutrientSummary e compound-parts).
2. Testes comportamentais anteriores às correções: categorias/variações,
   listas de receitas/refeições, ações de ícone, resumos, import/substituição/
   consulta e tabelas/rows.
3. Empty, erro, disabled, loading, somente leitura e seleção aplicáveis,
   teclado, nomes/roles, foco e longos textos.
4. Importações e compatibilidade: zero referência obsoleta; arquivos movidos
   verificados em testes estruturais, não omitidos.
5. Suíte default, suíte de catálogo explícita, type-check, lint, build,
   links, Atomic, z-index, legado, tabelas e catálogo.
6. Navegador desktop com fixtures isoladas: 1024px e 1440px de largura,
   alturas registradas, zoom 200% e reduced motion nos fluxos pertinentes.
   Essas larguras são amostras dentro do escopo, não novos breakpoints.
7. Comparação de invariantes antes/depois: mesmos resultados e callbacks,
   preservação de paginação/virtualização e nenhum I/O de dados pessoais.

## Critério de aprovação

Zero erro/aviso pendente do escopo; zero divergência introduzida em gates
globais; resultados globais apresentados integralmente. Novo erro externo
não é ignorado: registra bloqueio externo e impede afirmar “tudo passou”.
Nenhum skip/teste removido para esconder regressão. Avisos de filhos conhecidos
são resolvidos por ownership/cadastro, não lista de supressão.

Suíte de catálogo atualmente excluída pelo Vitest default deve ter config
dedicada da feature, não uma alteração global de filtros. Invocar o mesmo
auditor e preservar as fixtures negativas. Atualizar contagens históricas de
testes somente quando derivadas de inventário com mesmo rigor.

## Relatório final

validation-report.md e evidence/ conterão matriz requisito → teste → fonte,
resultado de cada gate, inspeção visual, comparação normativa e limitações.
Dois revisores previstos pela governança devem poder reproduzir a receita;
a execução do agente não substitui essas revisões nem inventa aprovações.

