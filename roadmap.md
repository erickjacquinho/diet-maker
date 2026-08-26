# Roadmap — Montagem de Dietas

## Objetivo

Tornar a montagem da dieta mais rápida para o nutricionista e mais simples para o paciente seguir.

## Próximas funcionalidades

### 1. Refeições prontas no modal de alimentos

Adicionar uma área separada para refeições prontas dentro do modal de seleção de alimentos.

Cada refeição pronta deve carregar:

- alimentos;
- quantidades em gramas;
- substituições/opções já configuradas.

### 2. Salvar refeição ou receita durante a montagem

Adicionar no card da refeição uma ação para salvar a refeição atual como uma nova refeição pronta ou receita, podendo reutilizá-la em outras dietas.

### 3. Opções completas de refeição

Permitir criar opções completas para uma refeição, com todos os alimentos e quantidades editáveis pelo nutricionista.

O paciente deverá poder escolher uma opção completa, sem precisar misturar substituições entre opções.

### 4. Substituições equivalentes por macro

Permitir selecionar um macro de referência — proteína, carboidrato, gordura ou kcal — e gerar quantidades proporcionais em gramas para os alimentos substitutos.

O nutricionista poderá revisar e alterar todos os alimentos e quantidades antes de confirmar a opção.

### 5. Refatoração da escala

Refatorar a escala para uma experiência mais visual, flexível e fácil de entender, com controle claro sobre o que será alterado.

## Telas e componentes envolvidos

- **Construtor de dieta** (`/pacientes/[id]/dieta/[dietaId]`): opções completas, salvamento da refeição e edição das substituições.
- **Modal de seleção de alimentos** (`FoodSearchModal`): grupo separado para refeições prontas.
- **Modal de salvar refeição/receita**: nome e tipo do conteúdo salvo.
- **Modal de opções e substituições equivalentes**: seleção do macro de referência e calibração em gramas.
- **Biblioteca de refeições prontas** (`/refeicoes-prontas`): visualizar e reutilizar refeições salvas.
- **Biblioteca de receitas** (`/receitas`): salvar e reutilizar receitas criadas durante a dieta.
- **Interface de escala**: substituir o fluxo atual por uma versão visual.

## Etapas futuras

- Autosave e recuperação de rascunho.
- Exportação e entrega da dieta.

## Fora do escopo atual

- Medidas caseiras. A prescrição será feita somente em gramas.
