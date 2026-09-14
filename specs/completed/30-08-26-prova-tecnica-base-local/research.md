# Research: Prova técnica e base local

**Feature**: [spec.md](./spec.md)
**Data**: 2026-08-30
**Status**: Concluída para planejamento; PGlite + Drizzle ainda não estão aprovados para o aplicativo.

## Decisão 1 — Avaliar PGlite + Drizzle como adaptador candidato

**Decision**: A PoC avaliará `@electric-sql/pglite` como motor relacional local no navegador e `drizzle-orm`/`drizzle-kit` como camada de schema, queries e migrations. As dependências ficarão no workspace isolado da PoC até o portão técnico.

**Rationale**: A documentação oficial do PGlite descreve PostgreSQL em WebAssembly com persistência em IndexedDB no navegador. A documentação oficial do Drizzle fornece integração específica com PGlite e fluxo de schema/migrations. Isso mantém o dialeto próximo do PostgreSQL futuro sem transformar a V1 em um produto dependente de rede.

**Alternatives considered**:

- Supabase/PostgreSQL remoto: rejeitado para a primeira etapa porque introduz rede, autenticação, RLS, sincronização e conflitos fora da V1 local-first.
- Somente IndexedDB: rejeitado como banco canônico porque não expressa sozinho as relações, transações, histórico e integridade exigidos pela Conta/Paciente.
- SQLite/WASM: permanece alternativa de reavaliação somente se a PoC demonstrar uma limitação essencial do PostgreSQL em WASM.

**Sources**:

- [PGlite — About](https://pglite.dev/docs/about)
- [Drizzle ORM — PGlite](https://orm.drizzle.team/docs/connect-pglite)

## Decisão 2 — Persistência real em IndexedDB e durabilidade não relaxada

**Decision**: O cenário de persistência usará o filesystem IndexedDB do PGlite. O modo em memória será reservado a testes isolados. A PoC não usará `relaxedDurability` para declarar sucesso de uma gravação canônica.

**Rationale**: A documentação do PGlite distingue o filesystem em memória do filesystem IndexedDB persistente. Ela também informa que a durabilidade relaxada pode retornar o resultado antes da conclusão do flush; isso é incompatível com a evidência necessária para o banco canônico. O relatório deve medir o custo real da persistência e registrar falhas de armazenamento de forma explícita.

**Alternatives considered**:

- Filesystem em memória: rejeitado para o cenário principal porque perde os dados ao fechar a instância.
- Durabilidade relaxada: rejeitada para o critério de confirmação canônica; pode ser comparada apenas como observação experimental, sem mudar o resultado da PoC.
- OPFS: não escolhido como caminho inicial porque a documentação do PGlite aponta limitação de suporte no Safari; a decisão 10 já prioriza IndexedDB.

**Sources**:

- [PGlite — Filesystems](https://pglite.dev/docs/filesystems)
- [PGlite — API](https://pglite.dev/docs/api)

## Decisão 3 — Migrations explícitas e versionadas

**Decision**: O schema ficará sob controle de versão, o Drizzle Kit gerará migrations SQL e a PoC aplicará migrations explícitas. O fluxo de referência será `generate` seguido de `migrate`; `push` ficará restrito a experimentos descartáveis, não ao caminho canônico.

**Rationale**: O fluxo versionado permite aplicar uma evolução sobre uma fixture existente e comparar registros antes/depois. O log de migrations torna a execução repetível e permite testar reexecução, versão incompatível e ausência de perda de dados.

**Alternatives considered**:

- Alterar tabelas por comandos imperativos espalhados no código: rejeitado por dificultar revisão, repetição e auditoria.
- `drizzle-kit push` como fluxo permanente: rejeitado; a documentação do Drizzle posiciona `push` para prototipagem rápida, enquanto o fluxo generate/migrate mantém histórico versionado.

**Sources**:

- [Drizzle ORM — Migrations](https://orm.drizzle.team/docs/migrations)
- [Drizzle Kit — migrate](https://orm.drizzle.team/docs/drizzle-kit-migrate)
- [Drizzle ORM — drizzle.config.ts](https://orm.drizzle.team/docs/drizzle-config-file)

## Decisão 4 — Exclusividade de aba com falha fechada

**Decision**: A PoC validará um lock exclusivo por origem/perfil antes de abrir o banco. A estratégia preferida é Web Locks com aquisição imediata (`ifAvailable`), mantendo o lock pela vida da instância ativa. Se o lock não puder ser adquirido ou a API não estiver disponível no contexto-alvo, a segunda instância não abrirá a base.

**Rationale**: A Web Locks API é definida para coordenação entre abas da mesma origem e suporta um único titular exclusivo. A aquisição imediata evita que a segunda aba fique aguardando indefinidamente e pareça funcional. Falhar fechado preserva a garantia de não abrir duas instâncias; eleição de líder, sincronização e fallback por relógio/localStorage ficam fora da V1.

**Alternatives considered**:

- Fila aguardando o lock: rejeitada para a UX da V1 porque a segunda aba deve ser bloqueada, não colocada em espera.
- Lease em `localStorage`: rejeitado como garantia primária por risco de stale lease, relógios divergentes e corrida entre abas.
- Eleição de líder/sincronização entre abas: rejeitada por ampliar o escopo para colaboração e edição concorrente.

**Source**:

- [MDN — Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)

## Decisão 5 — Draft em IndexedDB separado do banco canônico

**Decision**: O `DietDraftStore` usará namespace/object store próprio, separado do filesystem IndexedDB interno do PGlite. O draft carregará contexto e versão esperada, mas não será uma linha do banco relacional nem aparecerá na amostra confirmada.

**Rationale**: O contrato de Dieta DB define draft como edição local e o banco relacional como fonte canônica dos dados confirmados. A separação física/lógica evita que autosave seja confundido com commit e permite testar gravação/remoção de draft sem tocar em vigência ou histórico.

**Alternatives considered**:

- Armazenar draft em tabela relacional: rejeitado porque quebraria a fronteira entre edição e prescrição confirmada.
- Usar `localStorage`: rejeitado como modelo canônico e inadequado para payload relacional/limites de retenção.
- Reutilizar o mesmo object store do PGlite: rejeitado porque mistura responsabilidades e dificulta provar isolamento.

**Source**:

- [MDN — Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

## Decisão 6 — Browser-only boundary e offline limitado

**Decision**: A PoC será executada em uma página/harness client-only, depois que seus recursos forem carregados. APIs de browser não serão acessadas durante renderização server-side nem escondidas atrás de fallback silencioso. Offline será verificado apenas para a amostra preparada.

**Rationale**: O PGlite persistente e o lock de aba dependem de APIs do navegador. A documentação do Next.js orienta concentrar APIs de browser em Client Components; como esta etapa não integra o produto, um harness isolado reduz o risco de contaminar o App Router. A separação também torna explícito que “offline” não significa que recursos nunca carregados possam ser obtidos sem rede.

**Alternatives considered**:

- Inicializar o banco no servidor/Server Component: rejeitado porque não representa a base local por perfil de navegador.
- Declarar offline total sem preparar recursos: rejeitado porque extrapola a decisão 09 e mistura persistência com distribuição de assets.

**Sources**:

- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — use client](https://nextjs.org/docs/app/api-reference/directives/use-client)

## Decisão 7 — Evidência e gate do adaptador

**Decision**: A PoC será aprovada somente se o relatório comprovar persistência, atomicidade, integridade de escopo, migration, draft separado, exclusividade da aba, portabilidade lógica e operação local sem rede após preparação. Consulta isolada funcionando não é suficiente.

**Rationale**: Esse conjunto replica o portão técnico da Decisão 10 e reduz o risco de escolher um motor por uma demonstração superficial. Tempos serão registrados para diagnóstico; não serão convertidos em uma certificação de latência ou volume não solicitada.

**Alternatives considered**:

- Aprovar após apenas CRUD/consulta: rejeitado porque não cobre rollback, durabilidade, isolamento ou aba concorrente.
- Certificar carga extensa em múltiplos navegadores: rejeitado nesta etapa por não ser necessário para decidir o risco principal do motor.

**Sources**:

- [refs/dieta-db/09-topologia-v1-local-first-e-conta-local.md](../../refs/dieta-db/09-topologia-v1-local-first-e-conta-local.md)
- [refs/dieta-db/10-motor-local-drizzle-e-migrations.md](../../refs/dieta-db/10-motor-local-drizzle-e-migrations.md)
- [refs/dieta-db/14-consolidacao-e-portao-de-execucao.md](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md)

## Research conclusion

Não restam decisões técnicas bloqueadoras para decompor as tarefas da PoC. A escolha continua **candidata**, não aprovada; a aprovação depende do relatório produzido após a execução dos cenários definidos em `quickstart.md`.
