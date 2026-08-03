# Contract: Visual Category Document

## Purpose

Este contrato define o conteúdo obrigatório de cada documento em `design-system/components/categories/`.

## Required metadata

| Field | Requirement |
| --- | --- |
| Category ID | kebab-case e igual ao registro |
| Lifecycle | `proposed`, `experimental`, `stable`, `deprecated` ou `removed` |
| Decision reference | Obrigatória para criação e mudança de estado |
| Allowed traits | Lista explícita, inclusive quando vazia |
| Current consumers | Entradas do registro, inclusive quando experimental |

## Required sections

1. **Purpose** — uma responsabilidade visual central.
2. **Includes** — critérios objetivos de entrada.
3. **Excludes** — fronteiras e categoria alternativa.
4. **Relationship map** — composições e traits, sem herança múltipla.
5. **Base anatomy** — partes required, optional e forbidden.
6. **Geometry** — dimensões, spacing, alignment, density, radius, border, layer e overflow.
7. **Typography** — papel textual para style semântico existente.
8. **Tokens by part** — parte, propriedade e token; valores primitivos são proibidos.
9. **Allowed variants** — nome, propósito, partes afetadas e combinações válidas.
10. **State matrix** — estado, background, text, border, icon, cursor, movement e semantic announcement.
11. **Interaction and keyboard** — pointer, keyboard, focus ownership e dismissal quando aplicável.
12. **Accessibility** — name, role, value, contrast, focus, reduced motion e relações semânticas.
13. **Composition** — categorias/parts permitidas, nesting, proximity e ownership de ações.
14. **Content and overflow** — truncation, wrapping, numerical alignment, empty content e localization quando aplicável.
15. **Forbidden decisions** — propriedades, variantes e combinações não permitidas.
16. **Current examples** — pelo menos um consumidor ou justificativa experimental.
17. **Category acceptance** — critérios objetivos de completude e reprodutibilidade.
18. **Change history** — decisões que alteraram contrato ou lifecycle.

## State coverage rule

Categorias interativas avaliam: `default`, `hover`, `pressed`, `focus-visible`, `selected`, `disabled`, `loading`, `error`, `empty` e `read-only`. Cada estado deve possuir linha completa ou `N/A` com motivo semântico. Ausência silenciosa é inválida.

## Inheritance rule

- Fundamentos globais prevalecem sobre categorias.
- Categoria principal prevalece sobre perfil individual.
- Trait pode adicionar capacidade permitida, mas não substituir token, geometria, tipografia ou acessibilidade da categoria.
- Exceção formal é o único mecanismo de divergência temporária.

## Prohibited content

- escala global duplicada;
- hex, font-size ou motion duration local quando existir token;
- termos abertos como “adequado”, “apropriado” ou “conforme necessário”;
- referência à camada Atomic como justificativa de estilo;
- exemplos atuais tratados como limite permanente da categoria;
- requisito mobile, tablet ou dark mode.

## Acceptance

Uma categoria somente pode alcançar `stable` quando todas as seções passam na auditoria, possui consumidor real, não conflita com fundamentos, cobre estados aplicáveis e dois revisores independentes chegam à mesma receita sem decisão adicional.

