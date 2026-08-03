# Data Model — Artefatos documentais da refatoração

Modelo dos artefatos criados/movidos pela refatoração. Não é modelo de dados de produto.

## Entidades

### Regra operacional (.agents/rules/)

- **Representa**: restrição obrigatória e checável aplicada ao editar código.
- **Atributos**: id (nome do arquivo), escopo, proibições, decisões, referência canônica.
- **Regras de validação**: no padrão MUST/NÃO do projeto; proibições objetivas; ponteiro para `design-system/README.md`.
- **Relações**: roteada por `AGENTS.md`; extraída de documento canônico (não autoritativa).

### Referência de tokens (docs/plan/tokens-reference.md)

- **Representa**: tabelas de valores oficiais consumidas pela implementação.
- **Atributos**: categoria (cor, tipografia, spacing, radius, borda, dimensão, ícone, motion, elevação, z-index, opacidade), token, valor, uso.
- **Regras de validação**: nenhum valor duplicado em outra fonte; unicidade de token por papel.
- **Relações**: fonte dos valores citados pelas regras.

### Registry de componentes (design-system/components/)

- **Representa**: dados executáveis (registry.json, categorias, perfis, contratos).
- **Atributos**: id, layer, categoria, traits, lifecycle, specStatus, consumers, exports.
- **Regras de validação**: verificado por `npm run verify:design-system`; IDs estáveis.
- **Relações**: **não renomear/alterar** nesta refatoração.

### Plano de migração (docs/plan/migration-plan.md)

- **Representa**: roadmap ordenado e baseline de auditoria.
- **Atributos**: ordem de migração, DoD, snapshot LEG (LEG001–017), estado verificado, verificação.
- **Regras de validação**: snapshot LEG preservado integralmente.
- **Relações**: referenciado pelo `AGENTS.md` e pelos testes legados.

## Regras de integridade (não funcionais)

- Identidade/unicidade: cada token e cada regra tem exatamente uma fonte canônica.
- Lifecycle: os estados documentais (proposed/experimental/stable/deprecated/removed) são preservados no migration-plan.
- Consistência de links: 100% dos links internos válidos (`npm run verify:links`).
- Verificação contínua: verifiers existentes permanecem verdes.
