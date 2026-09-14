# Quickstart: Prova técnica e base local

Este documento descreve a execução da PoC implementada em `poc/local-db-proof/`. Os resultados e limites de aprovação estão em [poc-report.md](./poc-report.md).

## Prerequisites

- Node/runtime e package manager registrados no relatório da PoC.
- Navegador desktop utilizado pelo projeto, em origem local compatível com IndexedDB e Web Locks.
- Perfil de navegador limpo ou namespace de PoC resetável.
- Rede disponível somente para instalar dependências e carregar os recursos pela primeira vez.

## Setup

A partir da raiz do projeto:

```text
cd poc/local-db-proof
npm install
npm run db:generate
```

O workspace deve manter suas dependências e migrations isoladas do `package.json` principal até a aprovação do adaptador.

## Automated validation

```text
npm run type-check
npm run test
npm run test:browser -- --workers=1
npm run lint
npm run build
```

Resultados esperados:

- a fixture sintética é carregada e comparável;
- o conjunto de testes cobre persistência/reabertura, rollback, escopo, unicidade, draft separado, migration e portabilidade;
- o cenário de navegador cobre segunda aba e rede desligada após o carregamento;
- falhas produzem resultados nominais e não deixam a base em estado parcialmente confirmado.

## Browser validation sequence

1. Execute `npm run dev` dentro de `poc/local-db-proof` e abra a origem indicada no terminal.
2. Inicialize a fixture e registre o tempo de abertura, a consulta de leitura e a gravação confirmada.
3. Feche e reabra a página no mesmo perfil; compare contagens, IDs, relações e snapshots nutricionais.
4. Abra uma segunda aba na mesma origem. Ela deve ser bloqueada antes de inicializar ou consultar a base. Feche a primeira e confirme que uma nova aba pode abrir.
5. Grave um draft, altere/remova o draft e compare a base confirmada antes e depois. Não deve haver mudança em vigência ou histórico.
6. Execute a migration simples sobre a fixture e compare registros antes/depois. Uma segunda execução deve ser idempotente ou produzir erro controlado.
7. Exporte e importe a amostra lógica em uma base compatível. Compare IDs, relações e valores nutricionais; confirme que drafts não estão no arquivo.
8. Com os recursos da PoC carregados, ative o modo offline do navegador e repita inicialização, consulta, gravação, reabertura e portabilidade da amostra.
9. Em cada erro de armazenamento, migration, importação ou lock, confirme que o resultado é explícito e que não houve fallback para `localStorage`.

## Acceptance evidence

O relatório da PoC deve anexar ou referenciar:

- versão do runtime, dependências, navegador e modo de execução;
- fixture e identificadores comparados;
- resultado por cenário: pass/fail, evidência e limitação;
- tempos observados de abertura, consulta e gravação;
- comportamento de rollback, segunda aba, draft, migration, importação e offline;
- decisão final: **approved**, **rejected** ou **needs re-evaluation**, com justificativa.

## Failure interpretation

- Qualquer falha de persistência real, atomicidade, integridade de escopo, separação de draft ou exclusividade da instância bloqueia a aprovação.
- Uma limitação de performance deve ser registrada e classificada; só bloqueia quando houver travamento/degradação que inviabilize a amostra.
- Falha de um navegador não cria automaticamente uma certificação multi-browser; registra a limitação e segue o escopo da Decisão 14.
- A aprovação não autoriza integrar módulos clínicos, migrar `localStorage` ou entregar backup completo. Essas decisões pertencem aos SDDs seguintes.
