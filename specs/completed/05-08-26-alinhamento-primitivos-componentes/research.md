# Research: Alinhamento da Arquitetura de Primitivos e Filhos

## Decision 1: Manter cada família compound em um único módulo público

**Decision**: A raiz e suas partes públicas permanecem agrupadas como uma família em `src/components/ui` e no registry.

**Rationale**: Dialog, Select, DropdownMenu, Sheet, Card, Table, Tabs, Tooltip, Popover, ScrollArea e Calendar dependem de contexto, estado ou convenções de composição. Separar cada filho como uma família independente fragmentaria o contrato e dificultaria a validação.

**Alternatives considered**:

- Criar um arquivo e um registro independente para cada filho: rejeitado porque confunde parte compound com componente independente.
- Mover os filhos para atoms: rejeitado porque os filhos ainda pertencem ao contrato genérico do primitivo.

## Decision 2: Usar a raiz como fonte do contrato visual quando ela for um elemento real

**Decision**: Button, Input, Badge, Spinner e Separator mantêm seus defaults visuais na própria família; em compound components, os slots visuais mantêm seus estilos nos filhos correspondentes.

**Rationale**: O elemento que efetivamente renderiza a superfície deve possuir seu contrato padrão. Isso reduz a necessidade de overrides em páginas e evita wrappers que apenas repassam propriedades.

**Alternatives considered**:

- Colocar todo estilo em atoms: rejeitado porque tornaria os primitives genéricos inutilizáveis sem uma camada superior.
- Colocar todo estilo somente na raiz compound: rejeitado porque filhos como Content, Item, Header e Title têm responsabilidades visuais distintas.

## Decision 3: Manter a direção de dependências existente e corrigir exceções

**Decision**: A direção válida é `ui → atoms → molecules → organisms → templates → app`; nenhuma camada importa uma camada superior.

**Rationale**: A constituição e o auditor Atomic Design já adotam essa direção. A correção necessária é remover a dependência molecule → organism identificada na sidebar, não criar uma nova hierarquia.

**Alternatives considered**:

- Permitir reexports convenientes entre camadas: rejeitado porque torna a dependência real invisível e cria acoplamento ascendente.
- Criar uma pasta compartilhada paralela sem contrato: rejeitado porque duplicaria a arquitetura atual.

## Decision 4: Migrar tokens por equivalência canônica, não por reestilização arbitrária

**Decision**: Tokens legados serão substituídos por equivalentes já definidos no design system; valores sem equivalente serão tratados como decisão de governança fora desta implementação.

**Rationale**: O objetivo é consolidar identidade visual, não criar novos valores locais. A migração deve preservar geometria e comportamento e tornar exceções observáveis.

**Alternatives considered**:

- Manter tokens legados indefinidamente: rejeitado porque perpetua dois vocabulários visuais.
- Inventar tokens diretamente no componente: rejeitado pela constituição e pelo contrato do design system.

## Decision 5: Validar com catálogo, isolamento, acessibilidade e auditorias existentes

**Decision**: A definição de pronto combina registry atualizado, testes das 16 famílias, isolamento, acessibilidade, type-check, lint e os dois validadores do projeto.

**Rationale**: Nenhuma verificação isolada cobre simultaneamente contrato público, direção de camadas, tokens e acessibilidade.

**Alternatives considered**:

- Validar somente com screenshots: rejeitado porque não detecta dependências, exports públicos ou acessibilidade.
- Validar somente com o auditor Atomic Design: rejeitado porque o auditor não cobre tokens, registry e todos os estados de interação.
