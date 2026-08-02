# Feature Specification: Eliminação Total dos Débitos de Migração do Design System

**Feature Branch**: `02-08-26-eliminacao-debitos-design-system`
**Created**: 2026-08-02
**Status**: Draft
**Input**: User description: "use essa skill para criar o plano de eliminação de todos os débitos de migração do design system (auditoria legada com ~798 findings no runtime)."

## Executive Summary

O produto possui um design system canônico já validado em `design-system/`, mas a migração do código de produção ficou incompleta: o auditor automatizado `verify-design-system-legacy.mjs` identifica **86 findings** nas regras vigentes (LEG001–LEG010) e uma análise de lacunas revelou **~712 ocorrências adicionais** em 7 categorias de desvio que ainda **não possuem regra de auditoria** (portanto invisíveis e não computadas). O conjunto total de ~798 desvios concentra-se em ~20 arquivos de runtime (12 componentes em `src/components` + 8 páginas em `src/app`).

Este SDD define: (1) a instrumentação das categorias descobertas como regras nomeadas LEG011–LEG017 com testes de fixture, (2) a migração dos arquivos de runtime para os contratos canônicos (`textStyle()` + tokens), (3) a isenção explícita e registrada dos primitivos shadcn em `src/components/ui/**` preservados por design, e (4) a atualização da documentação de conformidade somente com evidência real (auditoria zerada), conforme a constituição. O objetivo é "zero findings" mensurável, reproduzível e com a documentação fiel ao estado do código.

## Clarifications

### Session 2026-08-02

- Q: Escopo da exceção dos primitivos `src/components/ui/**` → A: Exceção registrada e permanente; "zero findings" = zero em todo o runtime fora dessa exceção.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detecção Completa de Desvios (Prioridade: P1)

A equipe de desenvolvimento quer que TODO desvio de estilo legado seja detectado automaticamente, sem depender de inspeção manual. Hoje, ao rodar o auditor, 86 desvios são reportados mas ~712 permanecem invisíveis porque as 7 categorias ainda não viram regra.

**Why this priority**: Sem visibilidade total, a migração não tem como ser completada nem validada; "zero findings" seria enganoso.

**Independent Test**: Rodar o auditor strict; cada uma das 7 categorias (text-named-size, space-x-y, text-transform, tracking-wide, opacity, leading, size-arbitrary) DEVE produzir findings nomeados LEG011–LEG017; um arquivo de fixture por regra reproduz o finding de forma determinística.

**Acceptance Scenarios**:

1. **Given** um arquivo contendo uma ocorrência de categoria não coberta, **When** a auditoria strict roda, **Then** a ocorrência é reportada com ID de regra LEG011–LEG017, arquivo e contagem, e nenhuma categoria conhecida permanece sem regra.
2. **Given** um arquivo sob `src/components/ui/**`, **When** a auditoria roda, **Then** ele é ignorado pela exceção registrada (PATH_EXEMPTIONS), sem gerar findings.

---

### User Story 2 - Runtime 100% Canônico (Prioridade: P1)

A equipe quer que o runtime do aplicativo consuma exclusivamente os contratos canônicos do design system (text styles nomeados e tokens), eliminando todos os desvios legados em componentes e páginas, sem alterar comportamento ou layout percebido.

**Why this priority**: É o objetivo central da migração; sem isso a auditoria continua falhando e o teste de conformidade `legacy-audit.test.ts` permanece vermelho.

**Independent Test**: Auditoria strict retorna **zero findings** em todo o runtime fora das exceções registradas; `legacy-audit.test.ts` passa; `tsc --noEmit` e `vitest run` permanecem verdes (sem regressão).

**Acceptance Scenarios**:

1. **Given** os ~20 arquivos de runtime com desvios, **When** migrados para `textStyle()`/tokens canônicos, **Then** o auditor strict reporta 0 findings no conjunto migrado e a renderização mantém a hierarquia visual pretendida.
2. **Given** a suíte de testes e o type-check, **When** a migração é aplicada, **Then** nenhum teste existente quebra e nenhum erro de tipo é introduzido.

---

### User Story 3 - Documentação Fiel à Realidade (Prioridade: P2)

A equipe quer que a documentação de conformidade reflita o estado real do código, evitando que o documento declare conformidade plena enquanto existem findings (violação do princípio V da constituição).

**Why this priority**: A constituição exige que nenhuma entrega documental declare conformidade sem evidência; a doc atual pode estar divergente do estado real.

**Independent Test**: Após a auditoria zerar, a doc `design-system/13-implementation-and-compliance.md` e o baseline de `design-system/components/registry.json` são atualizados; a auditoria continua zerada após a atualização documental.

**Acceptance Scenarios**:

1. **Given** auditoria strict com 0 findings, **When** a doc de conformidade é atualizada, **Then** ela descreve o estado verificado (regras LEG001–LEG017, exceções registradas e arquivos conformes).
2. **Given** a atualização documental, **When** a auditoria é re-rodada, **Then** permanece 0 findings (a doc não mascara código não conforme).

---

### Edge Cases

- **Desvios sem token equivalente**: uma ocorrência como `text-[9px]` pode não ter equivalência direta em text style nomeado; o mapeamento deve escolher o menor estilo canônico que preserve a hierarquia (documentado no plano de conversão).
- **Categorias com ocorrência mista no mesmo arquivo**: um mesmo arquivo pode acumular múltiplas categorias; a migração deve ser idempotente e o auditor deve continuar reportando as remanescentes até zerar.
- **Primitivos shadcn com valores não-canônicos**: `src/components/ui/**` contém valores arbitrários (spacing, layout, ease) que são preservados por design; a exceção registrada é a justificativa formal para sua não conformidade.
- **Falsos positivos de regex**: regras de auditoria precisam evitar padrões que casem prefixos de tokens válidos (ex.: `z-5` não pode casar `z-50`); cada regra DEVE ter fixture de aceitação e de rejeição.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O auditor DEVE cobrir as 7 categorias não computadas como regras nomeadas LEG011–LEG017 (text-named-size, space-x-y, text-transform, tracking-wide, opacity, leading, size-arbitrary), cada uma com testes de fixture determinísticos e sem falsos positivos.
- **FR-002**: O auditor DEVE respeitar uma lista de exceções de caminho (PATH_EXEMPTIONS) que isenta `src/components/ui/**` de forma **permanente e registrada**, preservando primitivos shadcn como não-dívida.
- **FR-003**: Os ~20 arquivos de runtime (12 componentes em `src/components` + 8 páginas em `src/app`) DEVEM migrar para estilos canônicos (`textStyle()` de `@/design-system` e tokens), mantendo comportamento e hierarquia visual.
- **FR-004**: A auditoria strict DEVE reportar **zero findings** em todo o runtime fora das exceções registradas, de forma reproduzível.
- **FR-005**: O teste de conformidade `tests/design-system/legacy-audit.test.ts` DEVE passar sem modificar a semântica das regras.
- **FR-006**: A documentação de conformidade (`design-system/13-implementation-and-compliance.md` e baseline de `design-system/components/registry.json`) DEVE ser atualizada somente com evidência de auditoria zerada, sem declarar conformidade inexistente.
- **FR-007**: Os artefatos fonte do design system (`src/design-system/**` e `src/app/design-system/page.tsx`) NÃO DEVEM ser modificados neste SDD.
- **FR-008**: A entrega DEVE manter os gates de qualidade verdes: `tsc --noEmit` e `vitest run` sem regressão.

### Key Entities

- **Finding**: Ocorrência única de desvio reportada pelo auditor — atributos: `ruleId` (LEG001–LEG017), `file`, `line`, `severity`, `category`.
- **Rule**: Contrato de verificação — atributos: `id`, `category`, `matcher`, `acceptedFixtures`, `rejectedFixtures`.
- **Exemption**: Exceção registrada de caminho — atributos: `pathPattern`, `reason` (ex.: "primitivos shadcn preservados por design").
- **ConversionMap**: Mapeamento canônico de conversão — atributos: `legacyPattern`, `canonicalStyle` (textStyle id ou token).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Auditoria strict retorna **0 findings** em todo o runtime fora das exceções registradas.
- **SC-002**: 100% dos arquivos migrados (12 componentes + 8 páginas) consomem `textStyle()`/tokens canônicos, verificado pelo próprio auditor.
- **SC-003**: Teste `tests/design-system/legacy-audit.test.ts` passa com as 17 regras ativas.
- **SC-004**: `tsc --noEmit` e `vitest run` permanecem verdes, sem regressões.
- **SC-005**: Documentação de conformidade e registry descrevem estado verificado (regras LEG011–LEG017, exceções e conformidade), sem divergência doc-código.

## Assumptions

- `src/components/ui/**` contém primitivos shadcn **preservados por design** (constituição, princípio I) e será tratado como **exceção registrada e permanente**, não como dívida a migrar — **confirmado na clarificação de 2026-08-02 (Opção A)**.
- O produto é exclusivamente web desktop a partir de `1024px`; breakpoints `sm:`/`md:` (LEG006) são código morto e DEVEM ser removidos, não convertidos.
- O mapeamento de conversão segue a tabela papel→estilo já levantada na análise de lacunas (text-named-size → `textStyle()`; space-x/y → `gap`; radius → tokens; motion → tokens; palette → tokens semânticos; opacity → `opacity-*` canônicos; breakpoints → remoção de código morto).
- Os números de baseline (~798 findings, ~20 arquivos) foram levantados por varredura das regras vigentes e por análise de lacunas em `docs/superpowers`/scripts temporários; valores finais serão revalidados pela instrumentação LEG011–LEG017.
- `src/design-system/**` e `src/app/design-system/page.tsx` são intocáveis neste SDD.
