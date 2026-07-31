# Contract: Individual Component Profile

## Purpose

O perfil documenta somente como uma família pública aplica uma categoria visual. Ele não é uma especificação visual autossuficiente nem uma cópia da categoria.

## Required sections

1. **Identity** — component ID, nome, nature, lifecycle, current layer, target layer, sources e exports.
2. **Purpose** — responsabilidade específica em uma frase.
3. **Category inheritance** — uma categoria principal e traits autorizados.
4. **Specific anatomy** — composição concreta e diferenças em relação à base.
5. **Allowed variants** — subconjunto da categoria ou variante já prevista.
6. **Particular states** — estados adicionais, removidos ou semanticamente especializados.
7. **Composition** — componentes consumidos, slots, ownership e proibições.
8. **Content rules** — labels, unidades, números, truncation e domínio quando específicos.
9. **Exceptions** — referências formais; seção presente mesmo quando vazia.
10. **Consumers** — rotas e componentes conhecidos.
11. **Acceptance criteria** — critérios particulares observáveis.
12. **Implementation status** — diferença entre documentado, existente, conforme e migration-required.

## Allowed specialization

- nomear slots concretos;
- restringir variantes da categoria;
- associar semantic text styles a conteúdo específico já previsto;
- declarar macro protein/carbs/fat conforme sistema nutricional;
- definir composição e ordem de partes;
- acrescentar estado de domínio sem redefinir a receita compartilhada;
- referenciar exceção aprovada.

## Forbidden duplication

O perfil não pode repetir:

- escala de spacing, radius, border, typography, motion ou icon;
- tabela completa de estados herdada;
- mapa de tokens compartilhado;
- regra de foco/teclado idêntica à categoria;
- definição geral da variante;
- fundamentos de plataforma ou acessibilidade.

Quando contexto mínimo for necessário, o perfil usa link e referência de seção, não copia o texto.

## Exception gate

Uma divergência sem ExceptionRecord torna o perfil inválido. A exceção não pode ser usada para contornar fundamentos globais, WCAG 2.2 AA, separação Atomic ou limites de plataforma.

## Compound families

Um perfil de compound component enumera todas as parts públicas e indica se cada uma é governada pela categoria principal, por sub-receita da categoria ou por regra não visual. Parts não recebem perfis separados quando não possuem contrato autônomo.

## Acceptance

Um perfil passa quando um revisor consegue identificar tudo que diferencia o componente e rastrear todo o restante até categoria, traits e fundamentos, sem encontrar regra compartilhada reescrita.
