# Implementation Plan: Regras Visuais por Categoria de Componentes

**Branch**: `31-07-26-criar-a-especificacao-sdd-para` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/31-07-26-criar-a-especificacao-sdd-para/spec.md`

## Summary

Consolidar o design system em três níveis normativos: fundamentos globais existentes, onze categorias visuais reutilizáveis e perfis individuais enxutos. Atomic Design continuará governando responsabilidade e dependências, enquanto a categoria visual governará aparência e comportamento. Um registro estruturado e um validador determinístico garantirão cobertura dos 39 arquivos atuais, dos símbolos públicos e das quatro propostas, sem alterar `src/`.

## Technical Context

**Language/Version**: Markdown e JSON para contratos; Node.js ESM compatível com o runtime atual do projeto para validação documental

**Primary Dependencies**: APIs nativas de Node.js, scripts existentes de verificação de links e Vitest já instalado; nenhuma nova dependência de produção

**Storage**: Arquivos versionados no repositório; nenhuma persistência externa

**Testing**: Validador documental dedicado, testes Vitest do contrato, verificador de links e `git diff --check`

**Target Platform**: Repositório do produto web desktop; validação local e em CI nos ambientes já suportados pelo projeto

**Project Type**: Documentação normativa e tooling de conformidade dentro de aplicação web existente

**Performance Goals**: Auditoria completa de até 100 fontes/entradas em no máximo 5 segundos no ambiente local de desenvolvimento

**Constraints**: Zero alteração em `src/`; zero nova decisão estética global; nenhuma ficha pode duplicar regra de categoria; nenhuma categoria pode redefinir fundamento global; saída determinística e erros nominais

**Scale/Scope**: 11 categorias mínimas, 39 arquivos atuais, todos os símbolos públicos descobertos, 4 propostas e capacidade planejada para pelo menos 100 entradas sem mudança de contrato

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Pre-design result | Required handling |
| --- | --- | --- |
| I. Atomic Design Architecture | PASS | O plano preserva as camadas e explicita que categoria visual é eixo ortogonal. |
| II. Single Source of Truth | PASS after mandatory precondition | A primeira tarefa é uma atualização constitucional separada que remove linguagem visual histórica antes de qualquer contrato novo. |
| III. Accessibility & Semantic HTML | PASS after mandatory precondition | A mesma atualização troca o target mobile de 44px por WCAG 2.2 AA e pelas dimensões desktop canônicas antes do restante da execução. |
| IV. Test-First Quality & Isolation | PASS | Testes ficam em `tests/`; validadores não modificam estado global nem `src/`. |

As duas condições não são exceções permanentes: T001 é uma atualização constitucional explícita, separada e bloqueante. Nenhuma outra tarefa pode começar se essa emenda não for aprovada e concluída.

## Project Structure

### Documentation (this feature)

```text
specs/31-07-26-criar-a-especificacao-sdd-para/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── audit-contract.md
│   ├── category-contract.md
│   ├── component-profile-contract.md
│   └── registry.schema.json
├── checklists/
│   ├── requirements.md
│   └── category-requirements.md
└── tasks.md
```

### Repository files affected by the future implementation

```text
design-system/
├── README.md
├── 09-component-decision-model.md
├── 10-architecture-boundaries.md
├── 11-component-contract.md
├── 12-component-specifications.md
├── 13-implementation-and-compliance.md
├── 14-lifecycle-and-governance.md
├── 15-component-registry.md
└── components/
    ├── README.md
    ├── categories/
    │   ├── actions.md
    │   ├── fields.md
    │   ├── selection.md
    │   ├── navigation.md
    │   ├── surfaces.md
    │   ├── data-display.md
    │   ├── feedback.md
    │   ├── overlays.md
    │   ├── loading.md
    │   ├── nutrition-domain.md
    │   └── structure.md
    ├── profiles/
    │   ├── ui/
    │   ├── atoms/
    │   ├── molecules/
    │   ├── organisms/
    │   └── templates/
    ├── category-decisions.md
    └── registry.json
.specify/memory/constitution.md
agents.md
package.json
scripts/verify-design-system-components.mjs
tests/design-system/component-catalog.test.mjs
```

`src/components/` é somente entrada de inventário em modo leitura e não aparece entre os arquivos modificáveis.

**Structure Decision**: Categorias ficam separadas de perfis para impedir que a hierarquia Atomic Design seja usada como taxonomia visual. Perfis permanecem organizados por camada-alvo apenas para navegação arquitetural. O registro JSON é a fonte estruturada do inventário; documentos Markdown são a fonte normativa legível; o validador garante correspondência entre ambos.

## Phase 0: Research Decisions

As decisões consolidadas estão em [research.md](./research.md):

1. taxonomia mínima fechada para adoção e aberta somente por governança;
2. exatamente uma categoria principal mais traits limitados;
3. autoria category-first antes dos perfis individuais;
4. registro estruturado separado dos contratos Markdown;
5. cobertura por fonte e símbolo público;
6. exceção formal com revisão e possibilidade de generalização;
7. sincronização obrigatória da constituição e roteadores históricos.

## Phase 1: Design and Contracts

### Data model

[data-model.md](./data-model.md) define Category, Trait, ComponentEntry, SourceFile, PublicExport, ComponentProfile, ExceptionRecord, CategoryDecision e AuditFinding, incluindo relações, unicidade, validações e transições de lifecycle.

### Contracts

- [category-contract.md](./contracts/category-contract.md): seções e tabelas obrigatórias de uma categoria.
- [component-profile-contract.md](./contracts/component-profile-contract.md): conteúdo permitido e proibido em um perfil individual.
- [registry.schema.json](./contracts/registry.schema.json): formato estruturado do inventário.
- [audit-contract.md](./contracts/audit-contract.md): classes de erro, severidade e saída determinística.

### Validation path

[quickstart.md](./quickstart.md) descreve os cenários de cobertura válida, fonte ausente, categoria ausente, perfil incompleto, token inválido, duplicação, proposta incorreta e garantia de zero mudança em `src/`.

## Implementation Strategy

### 1. Sincronizar a constituição antes do conteúdo

Executar e aprovar a emenda constitucional que substitui valores históricos por referências ao guia canônico. Esta mudança é isolada e precede registro, contratos, categorias e perfis.

### 2. Fixar contratos antes do conteúdo

Criar o schema do registro, os templates normativos e o validador com fixtures controladas. O modo de inventário pode aceitar entradas ainda não homologadas; o modo estrito somente passa quando todas as categorias e perfis obrigatórios estiverem completos.

### 3. Escrever categorias antes de perfis

Produzir as onze categorias a partir dos fundamentos 03–08. Cada categoria deve decidir todas as propriedades compartilhadas e referenciar tokens, nunca valores locais. Relações entre categorias são registradas por composição e traits, não por cópia.

### 4. Inventariar e classificar o estado real

Descobrir arquivos e exports em `src/components/`, registrar caminho real, camada atual, camada-alvo, categoria principal, traits, lifecycle e consumidores. Reexports e compound parts permanecem explícitos. As quatro propostas não apontam para fonte existente nem contam na cobertura atual.

### 5. Criar perfis individuais enxutos

Cada perfil herda uma categoria e contém apenas particularidades. Uma diferença compartilhável deve voltar à categoria; uma diferença isolada exige ExceptionRecord. O validador bloqueia repetição de headings e tabelas que pertencem à categoria.

### 6. Consolidar governança e fontes de verdade

Transformar os documentos 09–15 em índices e regras de decisão coerentes com a nova arquitetura, sincronizar `README.md`, `agents.md` e a constituição, e marcar qualquer artefato histórico como não normativo.

### 7. Homologar sem implementar UI

Executar auditoria estrita, testes, links, diff check e prova de que `src/` permaneceu intacto. O catálogo homologado vira pré-requisito para SDDs posteriores de telas e migração visual.

## Testing and Validation

| Level | Validation |
| --- | --- |
| Contract | Fixtures válidas e inválidas para schema, categorias e perfis |
| Inventory | Toda fonte atual descoberta está registrada; fonte removida ou nova altera o resultado |
| Semantics | Categoria principal única, traits conhecidos, lifecycle válido e proposed sem fonte |
| Documentation | Seções obrigatórias, links, tokens e ausência de decisões abertas |
| Duplication | Perfis não redefinem tabelas normativas de categorias |
| Governance | Exceções e decisões possuem campos e estados exigidos |
| Isolation | `git diff --name-only -- src` não retorna arquivos |
| End-to-end | Auditoria estrita reporta 39 fontes cobertas, 4 propostas e zero finding bloqueante |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Categorias genéricas demais | Critérios de inclusão/exclusão, anatomia e estados obrigatórios; exemplos atuais em cada categoria. |
| Categorias específicas demais | Evidência de recorrência e avaliação de composição/variante antes de criar categoria. |
| Traits virarem múltipla herança informal | Uma categoria principal obrigatória; traits só podem adicionar capacidades listadas e não podem sobrescrever regra. |
| Perfis voltarem a duplicar regras | Contrato enxuto, headings restritos e auditoria de duplicação. |
| Registro divergir do código | Descoberta automática de fontes e símbolos públicos. |
| Documentação declarar migração concluída | Estados documental, implementado e conformidade separados. |
| Constituição histórica reintroduzir regras antigas | Atualização versionada e gate de consistência entre fontes normativas. |

## Constitution Check — Post-design

| Principle | Result | Evidence |
| --- | --- | --- |
| I. Atomic Design Architecture | PASS | Modelo separa `currentLayer` e `targetLayer` de `primaryCategory`; nenhum arquivo de `src/` é modificado. |
| II. Single Source of Truth | PASS after planned synchronization | Categorias referenciam fundamentos; perfis referenciam categorias; índices não duplicam contratos. |
| III. Accessibility & Semantic HTML | PASS after planned synchronization | Contrato de categoria exige WCAG 2.2 AA, teclado, foco, semântica e reduced motion conforme guia vigente. |
| IV. Test-First Quality & Isolation | PASS | Contratos e fixtures precedem conteúdo; testes ficam em `tests/design-system/`. |

## Complexity Tracking

Nenhuma violação arquitetural permanente foi aceita. As divergências atuais da constituição são dívida documental dentro do próprio escopo de sincronização e bloqueiam a homologação até serem removidas.
