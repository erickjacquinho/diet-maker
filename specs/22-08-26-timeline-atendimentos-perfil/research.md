# Research & Decisions: Timeline de Atendimentos

## Decisão 1: Abandono do Pareamento Forçado por Índice
- **Problema**: O modelo anterior pareava dietas e avaliações por índice de array, gerando linhas duplicadas e mensagens vazias.
- **Solução**: Tratar cada dieta e avaliação como um evento autônomo na timeline, agrupados por cabeçalho de data.

## Decisão 2: Substituição do Chevron por Ações com Progressive Disclosure
- **Problema**: Chevron minúsculo e mudo gerava ambiguidade de interação.
- **Solução**: Botão direto "Ver Cardápio" para dietas (abre modal) e botão "Ver Detalhes / Ocultar Detalhes" para expandir dobras inline na avaliação.

## Decisão 3: Filtros no Topo da Timeline
- **Solução**: 3 abas (`Todas`, `Avaliações`, `Dietas`) com contagens dinâmicas para permitir escaneamento focado.
