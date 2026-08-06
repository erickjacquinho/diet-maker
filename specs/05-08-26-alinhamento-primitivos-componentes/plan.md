# Implementation Plan: Alinhamento da Arquitetura de Primitivos e Filhos

**Branch**: `05-08-26-alinhamento-primitivos-componentes` | **Date**: 2026-08-05 | **Spec**: [spec.md](spec.md)

## Summary

Esta iniciativa consolida o contrato arquitetural das 16 famílias em `src/components/ui` e de suas partes compound, define quais wrappers em `atoms` possuem valor real, corrige a direção de dependências entre camadas, padroniza o consumo de primitives versus atoms, migra tokens legados, sincroniza o registry e amplia a cobertura de testes. Nenhuma rule existente será modificada.

O trabalho será executado de forma incremental: primeiro o inventário e os contratos, depois os limites de camadas e wrappers, em seguida os tokens e consumidores, e por fim registry, testes e validação completa.

## Technical Context

**Language/Version**: TypeScript com React 19 e Next.js 15, conforme o projeto existente

**Primary Dependencies**: Radix UI, `react-day-picker`, `class-variance-authority`, Tailwind CSS, Lucide React e utilitários locais de receitas/tokens

**Storage**: N/A; não há alteração de dados persistidos

**Testing**: Vitest, Testing Library, TypeScript (`tsc --noEmit`), ESLint e validadores locais de Atomic Design e Design System

**Target Platform**: Aplicação web desktop a partir de 1024px

**Project Type**: Aplicação web Next.js com biblioteca interna de componentes

**Performance Goals**: Não introduzir custo perceptível de runtime, hidratação ou interação; preservar o comportamento atual dos componentes e manter a validação da suíte dentro dos limites atuais do projeto

**Constraints**: Não modificar `.agents/rules/`; não introduzir tokens fora do design system; preservar APIs públicas e mudanças preexistentes do worktree; não adicionar banco, API ou domínio novo

**Scale/Scope**: 16 famílias primitivas, todos os exports públicos de suas partes, atoms relacionados, molecules/organisms/templates consumidores, registry, testes de UI e validadores de conformidade

## Constitution Check

*GATE: PASS — verified before Phase 0 and to be re-checked after Phase 1 design.*

| Principle | Status | Evidence/Plan Response |
|-----------|--------|------------------------|
| I. Atomic Design Architecture | PASS | O plano mantém `ui → atoms → molecules → organisms → templates → app`, proíbe dependências ascendentes e corrige o caso molecule → organism. |
| II. Canonical Design System | PASS | Tokens, categorias e perfis existentes continuam sendo a fonte; a tarefa não cria regra visual paralela. |
| III. Desktop Scope and Accessibility | PASS | O escopo permanece desktop ≥1024px e preserva foco, teclado, nome/role/value e contratos acessíveis aplicáveis. |
| IV. Test-First Quality and Isolation | PASS | A cobertura de contratos e os validadores são parte explícita do plano; os testes permanecem sob `tests/`. |
| V. Spec-Driven Execution | PASS | O plano termina em `tasks.md`; a implementação ficará para `/speckit-implement` após validação humana. |

## Project Structure

### Documentation (this feature)

```text
specs/05-08-26-alinhamento-primitivos-componentes/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── component-family-contract.md
├── checklists/
│   ├── requirements.md
│   └── architecture.md
└── tasks.md
```

### Source Code (repository root)

```text
src/components/
├── ui/                  # 16 famílias primitivas e partes compound
├── atoms/               # atoms com valor adicional verificável
├── molecules/           # composição sem dependência de camadas superiores
├── organisms/           # blocos funcionais de produto
└── templates/           # composição de páginas

design-system/components/
├── registry.json        # catálogo de IDs, partes, camadas e consumidores
├── categories/          # contratos de categorias visuais
└── profiles/            # perfis individuais por camada

tests/components/
├── ui/                  # contratos, isolamento e acessibilidade dos primitivos
└── ...                  # testes de molecules, organisms e fluxos existentes

scripts/
├── audit-atomic-design.mjs
└── verify-design-system-components.mjs
```

**Structure Decision**: A arquitetura existente será preservada. A mudança é de consolidação de contratos, dependências, consumo, tokens, catálogo e validação dentro das pastas atuais; não haverá uma nova camada, pacote ou diretório paralelo.

## Implementation Phases

### Phase 0 — Inventory and contract baseline

Mapear as 16 famílias, suas partes públicas, dependências comportamentais, categorias, consumidores e divergências entre código, registry, testes e documentação. Formalizar o contrato raiz/filhos antes de qualquer migração visual.

### Phase 1 — Layer boundaries and wrapper decisions

Classificar cada atom wrapper como mantido, consolidado, removido ou migration-required. Corrigir dependências ascendentes e estabelecer o caminho canônico de consumo entre `ui` e `atoms` sem alterar as rules.

### Phase 2 — Primitive identity and consumer migration

Migrar tokens legados dos primitivos escopados e transformar overrides visuais repetidos em variantes ou wrappers de produto. Migrar consumidores sem remover compatibilidade antes da conclusão de cada grupo.

### Phase 3 — Catalog, tests and validation

Sincronizar registry e consumers, incluir todas as famílias nos testes, validar isolamento, acessibilidade, type-check, lint, Atomic Design e Design System.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Alteração visual não intencional em páginas existentes | Migrar por família, preservar APIs e validar consumidores antes/depois. |
| Wrapper removido ainda usado por consumidores legados | Marcar migration-required e migrar imports antes da remoção. |
| Registry divergente do código real | Gerar a lista de consumidores a partir de busca no repositório e revisar manualmente entradas incompletas. |
| Token legado necessário por comportamento estrutural | Separar token visual de variável estrutural do Radix e registrar exceção justificada. |
| Worktree com alterações preexistentes | Alterar somente arquivos relacionados ao escopo e validar diff antes da implementação. |

## Complexity Tracking

Nenhuma violação constitucional ou nova complexidade estrutural foi identificada. A iniciativa trabalha dentro das pastas e dos contratos já existentes.
