# Research — Refatoração da documentação do design-system

## Unknowns resolvidos

### R1: Relação de autoridade entre `design-system/` e `.agents/rules/`

- **Decision**: `design-system/` permanece a fonte canônica; `.agents/rules/` é extração operacional sincronizada.
- **Rationale**: Preserva o `constitution.md` (Princípio II) e o papel já declarado de `.agents/rules/` no `AGENTS.md`, evitando emenda constitucional e rework de governança. O README mantém ponteiros para as regras.
- **Alternatives considered**: Tornar `.agents/rules/` autoritativo (rejeitado: exigiria emendar constituição e criar risco de duplicação de autoridade).

### R2: Destino do plano consolidado

- **Decision**: `docs/plan/` (criado se não existir).
- **Rationale**: `docs/` já hospeda prd/, context/ e adr/; `docs/plan/` segue o padrão de documentação do repositório sem colidir com `specs/` (SDD) nem com `design-system/` (canônico).
- **Alternatives considered**: Raiz `/plan` (rejeitado: polui a raiz); `specs/` (rejeitado: é espaço do Spec Kit).

### R3: Granularidade das regras em `.agents/rules/`

- **Decision**: 7 arquivos novos por domínio (tokens, color-semantics, typography, geometry-layout, icons-motion-layers, states-accessibility, component-decision) + expansão de `atomic-design.md`.
- **Rationale**: Alinhado ao roteamento por escopo do `AGENTS.md`; regras curtas e checáveis, sem recriar verbosidade.
- **Alternatives considered**: Regras consolidadas em 2–3 arquivos (rejeitado: perde roteamento granular); regras espelhando os 15 documentos (rejeitado: recria o problema atual).

### R4: Destino dos documentos 12 e 15 (índices redundantes)

- **Decision**: Absorvidos no novo `design-system/README.md`.
- **Rationale**: São índices humanos sem fonte normativa própria; o conteúdo executável vive em `components/registry.json`.
- **Alternatives considered**: Manter como arquivos (rejeitado: duplicação de índice).

### R5: Preservação do snapshot LEG

- **Decision**: O snapshot de auditoria (doc 13 §§13, 18) é movido integralmente para `docs/plan/migration-plan.md`.
- **Rationale**: É baseline histórico citado por testes e documentos; perda quebraria rastreabilidade.
- **Alternatives considered**: Deletar com o doc 13 (rejeitado: quebra referências e histórico de auditoria).

## Resultado

- Todos os NEEDS CLARIFICATION resolvidos.
- Nenhuma dependência externa nova; nenhuma integração externa.
- Verificadores existentes usados como garantia de não-regressão.
