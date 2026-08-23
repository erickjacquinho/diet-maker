# Research & Decisions: Duas Tabelas Especializadas

## Decisão 1: Reutilização da Molécula DataTable Canônica
- **Benefício**: Mantém padronização visual, acessibilidade, estilo de bordas, hover e estados vazios sem duplicação de CSS.

## Decisão 2: Empilhamento Vertical em Duas Seções
- **Benefício**: Cada domínio (Composição Corporal e Prescrição Nutricional) ganha seu próprio espaço de leitura com largura total, sem conflitos conceituais ou colunas espremidas.

## Decisão 3: Ações Especializadas por Linha
- **Dieta**: Botão "Ver Cardápio" primário + Editar.
- **Avaliação**: Botão "Ver Detalhes" (expansão inline) + Editar.
