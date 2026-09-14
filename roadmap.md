# Roadmap — Montagem de Dietas

## Objetivo

Tornar a montagem da dieta mais rápida para o nutricionista e mais simples para o paciente seguir.

## Próximas funcionalidades

### 1. Arquitetura de persistência local (Alimentos, Refeições e Receitas)

Definir e implementar a arquitetura de armazenamento local (IndexedDB via store/repositório dedicado) para o catálogo próprio do nutricionista:

- **Modelagem de dados e esquemas**:
  - Alimentos customizados (tabela nutricional própria por 100g/porção, micronutrientes opcionais e fonte);
  - Refeições prontas (alimentos, gramagens, opções completas e substituições configuradas);
  - Receitas (ingredientes com gramas, cálculo automático de macros totais e por porção/rendimento, modo de preparo e tempo).
- **Camada de Repositórios/Stores Locais**:
  - Operações CRUD desacopladas da UI;
  - Versionamento de schema e migrações locais;
  - Mecanismo de exportação/importação (backup/restore) dos catálogos locais.
- **Camada de indexação e busca**:
  - Busca unificada e de alta performance combinando base oficial (TACO/IBGE), alimentos customizados e receitas.

### 2. UI e Workflow do Catálogo de Alimentos Customizados

Interface completa para gestão dos alimentos criados pelo nutricionista:

- **Listagem e busca** (`/alimentos`): visualização em tabela/cards com filtros por categoria, busca rápida e ordenação por macronutrientes.
- **Formulário de cadastro/edição**:
  - Nome do alimento, marca/fabricante (opcional) e porção de referência (100g / personalizada);
  - Entrada de macros (kcal, carboidratos, proteínas, gorduras totais, fibras e sódio);
  - Validação em tempo real dos valores nutricionais.
- **Ações de gestão**: editar, duplicar e excluir alimentos personalizados.

### 3. UI e Workflow da Biblioteca de Refeições Prontas

Interface dedicada para criar, gerenciar e inspecionar refeições prontas:

- **Biblioteca de refeições** (`/refeicoes`):
  - Listagem com visualização do resumo de macronutrientes (kcal, P, C, G) e total de itens;
  - Filtros por tipo de refeição (café da manhã, almoço, lanche, jantar, etc.) e busca textual.
- **Workflow de criação e edição de refeição pronta**:
  - Montagem direta via interface dedicada (adicionar alimentos, definir gramas e criar opções/substituições);
  - Cálculo instantâneo do balanço calórico e distribuição de macros da refeição;
  - Nomeação, tags e observações.
- **Ações de gestão**: duplicar refeição para criar variações, editar componentes e excluir.

### 4. UI e Workflow da Biblioteca de Receitas

Interface para elaboração e gestão de receitas do nutricionista:

- **Biblioteca de receitas** (`/receitas`):
  - Listagem com cards visuais contendo foto (opcional), tempo de preparo, rendimento (porções e peso total estimado) e tabela nutricional por porção;
  - Filtros por categoria e busca por ingredientes.
- **Workflow de criação e edição de receita**:
  - Inserção de ingredientes em gramas a partir da busca de alimentos (TACO + customizados);
  - Definição de rendimento (número de porções e peso final);
  - Cálculo automático e em tempo real da tabela nutricional consolidada (total da receita e fracionada por porção);
  - Campo estruturado para modo de preparo, tempo de execução e dicas nutricionais.
- **Ações de gestão**: editar ingredientes, ajustar rendimento, duplicar e excluir receitas.

### 5. Refeições prontas no modal de alimentos

Adicionar uma área separada para refeições prontas dentro do modal de seleção de alimentos.

Cada refeição pronta deve carregar:

- alimentos;
- quantidades em gramas;
- substituições/opções já configuradas.

### 6. Salvar refeição ou receita durante a montagem

Adicionar no card da refeição uma ação para salvar a refeição atual como uma nova refeição pronta ou receita, podendo reutilizá-la em outras dietas.

### 7. Opções completas de refeição

Permitir criar opções completas para uma refeição, com todos os alimentos e quantidades editáveis pelo nutricionista.

O paciente deverá poder escolher uma opção completa, sem precisar misturar substituições entre opções.

### 8. Substituições equivalentes por macro

Calcular matematicamente e sugerir quantidades em gramas para alimentos substitutos com base em um macronutriente-alvo (ou valor calórico), garantindo equivalência nutricional com controle visual completo:

- **Seleção da referência e macro-alvo**:
  - O nutricionista define o alimento base da refeição (ex: 100g de Frango Grelhado = ~31,5g de Proteína) e escolhe qual parâmetro de referência deve ser equiparado (Proteína, Carboidrato, Gordura ou Kcal total);
- **Cálculo proporcional automatizado**:
  - Ao selecionar um alimento substituto (ex: Tilápia, Patinho, Ovos ou Tofu), o sistema calcula automaticamente a quantidade exata em gramas via regra de três para atingir a mesma quantidade do macro de referência;
- **Painel comparativo de deltas**:
  - Exibição em tempo real do impacto colateral nos demais nutrientes e nas calorias totais (ex: ao igualar a proteína trocando frango por ovo, exibir o acréscimo de gordura gerado);
- **Calibração e ajuste fino**:
  - O nutricionista pode travar valores, arredondar gramas para valores práticos e customizar as quantidades antes de confirmar a substituição na dieta.

### 9. Refatoração da escala

Refatorar a escala para uma experiência mais visual, flexível e fácil de entender, com controle claro sobre o que será alterado.

### 10. Limitações dietéticas no cadastro do paciente

Após a conclusão das migrations pendentes, adicionar ao cadastro e à edição do paciente um campo de texto livre para registrar todas as suas limitações dietéticas, incluindo alergias, intolerâncias, restrições e preferências relevantes. Manter essa informação persistida junto ao perfil do paciente para consulta na montagem da dieta.

## Telas e componentes envolvidos

- **Construtor de dieta** (`/pacientes/[id]/dieta/[dietaId]`): opções completas, salvamento da refeição e edição das substituições.
- **Cadastro de pacientes** (`/pacientes`): campo de limitações dietéticas no cadastro e na edição do paciente.
- **Catálogo de alimentos customizados** (`/alimentos`): listagem, busca e formulários de cadastro/edição de alimentos próprios.
- **Biblioteca de refeições prontas** (`/refeicoes`): listagem, criação/edição dedicada e inspeção nutricional de refeições salvas.
- **Biblioteca de receitas** (`/receitas`): listagem, construtor de receitas com cálculo automático por porção e modo de preparo.
- **Modal de seleção de alimentos** (`FoodSearchModal`): grupos separados para base oficial, alimentos customizados, receitas e refeições prontas.
- **Modal de salvar refeição/receita**: nome, categoria e tipo do conteúdo salvo a partir do construtor de dieta.
- **Modal de opções e substituições equivalentes**: seleção do macro de referência e calibração em gramas.
- **Interface de escala**: substituir o fluxo atual por uma versão visual.

## Etapas futuras

- Autosave e recuperação de rascunho.
- Sincronização em nuvem e backup dos dados locais.
- Exportação e entrega da dieta.

## Fora do escopo atual

- Medidas caseiras. A prescrição será feita somente em gramas.
