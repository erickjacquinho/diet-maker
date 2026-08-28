# CONTEXT.md - Glossário e Conceitos de Domínio (NutriDiet)

Este documento registra os termos do domínio de nutrição clínica e arquitetura do software definidos durante as sessões de entrevista e grilling.

> 📌 **Links de Referência**:
> - 📄 **PRD**: [PRD.md](file:///c:/Programmer/diet-maker/docs/prd/PRD.md)
> - 🏛️ **ADRs**: [docs/adr/](file:///c:/Programmer/diet-maker/docs/adr/)
> - 🤖 **Mapa para Agentes**: [AGENTS.md](file:///c:/Programmer/diet-maker/AGENTS.md)

---

## Conceitos de Domínio Nutricional

### 1. VET (Valor Energético Total) / Meta Calórica
- **Definição**: Quantidade total de calorias (kcal) planejada para o dia do paciente.
- **Decisão**: A meta de VET e de macronutrientes é informada **manualmente** pelo nutricionista para cada paciente, baseada em seu julgamento clínico e protocolo individual.
- *Ver*: [ADR-003: Metas Manuais e Tolerância Visual](file:///c:/Programmer/diet-maker/docs/adr/ADR-003-macro-targets-and-tolerance-ranges.md).

### 2. Macronutrientes (P / C / G)
- **Proteínas (P)**: 4 kcal por grama. Meta manual e métrica de g/kg.
- **Carboidratos (C)**: 4 kcal por grama. Meta manual e métrica de g/kg.
- **Gorduras/Lipídios (G)**: 9 kcal por grama. Meta manual e métrica de g/kg.
- **Fibras**: Métrica quantitativa de acompanhamento diário (g).

### 3. Métricas de Adequação (g/kg e Deltas)
- **g/kg**: Quantidade de gramas de um macronutriente por quilograma de peso corporal do paciente (ex: 2.0 g/kg de proteína).
- **Delta Remanescente/Excedente**: Diferença calculada em tempo real entre a meta estabelecida pelo nutricionista e o total somado dos alimentos na dieta.

### 4. Tabela TACO (Tabela Brasileira de Composição de Alimentos)
- **Definição**: Base oficial de composição nutricional dos alimentos no Brasil (valores padrão por 100g de parte comestível).
- **Custom Alimentos**: Alimentos ou suplementos criados pelo nutricionista armazenados localmente.

### 5. Escala Proporcional de Porções
- **Definição**: Operação matemática em lote que multiplica a gramatura de todos os alimentos de uma refeição ou dieta inteira por um fator percentual (ex: `+15%` ou `x 1.15`), permitindo ajuste rápido de caloria/volume sem re-digitar item por item.

### 6. Receitas Culinárias & Ingredientes
- **Definição**: Composição gastronômica estruturada contendo nome, rendimento (número de porções), tempo de preparo, instruções de preparo e lista de ingredientes (`amountGrams`, macros e alimento de origem).
- **Cálculo de Porção**: O sistema calcula automaticamente os macronutrientes totais da receita e os divide pelo número de porções para gerar a fração exata a ser incluída em uma dieta.
- *Ver*: [ADR-008: Backend Relacional Local e Armazenamento](file:///c:/Programmer/diet-maker/docs/adr/ADR-008-local-backend-recipes-meals-and-workspace-storage.md).

### 7. Refeições Prontas (Blocos de Refeição)
- **Definição**: Modelos pré-configurados de refeições inteiras (ex: *Café da Manhã Hiperproteico 450kcal*) reutilizáveis em múltiplos pacientes com 1 clique.

### 8. Imutabilidade Clínica (Prescription Snapshot)
- **Definição**: Princípio que congela os dados nutricionais e de composição de uma refeição ou receita no exato momento em que ela é prescrita e salva na consulta do paciente.
- **Finalidade**: Assegurar que alterações posteriores na biblioteca mestre de receitas não alterem retroativamente o histórico de planos alimentares já entregues aos pacientes.

### 9. Arquivo Mestre de Perfil (.nutridiet)
- **Definição**: Arquivo consolidado e portável contendo todos os dados do consultório (perfil do nutricionista, pacientes, histórico de consultas, avaliações corporais, dietas, alimentos personalizados, refeições prontas e receitas) com manifesto e versionamento semântico.

### 10. Arquitetura Dual de Persistência (Draft Buffer + Outbox Pattern)
- **Draft Buffer**: Armazenamento temporário contínuo que protege os inputs em digitação contra fechamentos acidentais da aba.
- **Transactional Commit**: Gravação atômica em banco relacional local via Drizzle ORM ao acionar "Salvar" ou `Ctrl+S`.
- **Outbox Pattern (`sync_outbox`)**: Fila de mutações transacionais que permite sincronizar o banco local com um banco online (Supabase/PostgreSQL) no futuro sem retrabalho.
