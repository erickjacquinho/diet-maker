# Especificação do Recurso: Remoção de Mocks e Limpeza do Aplicativo

**Diretório do Recurso**: `specs/30-07-26-remover-todos-os-mocks-das`
**Data**: 30/07/2026

## 1. Visão Geral e Objetivos

O objetivo deste projeto é remover completamente todos os dados simulados (mocks), registros padrão de demonstração e objetos fallback hardcoded espalhados nas páginas e stores da aplicação (`NutriDiet`). 

Após a conclusão, a aplicação iniciará em estado 100% limpo quando executada pela primeira vez (ou com o `localStorage` limpo), apresentando interfaces elegantes de "Estado Vazio" (*Empty States*) com chamadas claras para ação (*Call To Action - CTA*), permitindo testes reais e uso em produção sem contaminação de dados fictícios.

## 2. Padrões de Composição (Vercel Composition Patterns)

Para garantir uma arquitetura sustentável e escalável durante a remoção dos mocks:
1. **Evitar Proliferação de Props Booleanas (`architecture-avoid-boolean-props`)**: Componentes de lista e detalhes usarão composição explícita para renderizar seus estados de dados preenchidos vs. estados vazios.
2. **Elevação e Desacoplamento de Estado (`state-decouple-implementation`, `state-lift-state`)**: Os stores em `src/lib/` servirão como única fonte da verdade de persistência local, retornando arrays vazios `[]` ou `null` quando não houver dados, sem criar dados falsos em tempo de execução.
3. **Variantes Explícitas (`patterns-explicit-variants`)**: Estados sem registros (*empty states*) serão componentes compostos dedicados em vez de ramificações simples com `if/else` poluídos.

## 3. Escopo Detalhado das Alterações

### 3.1. Store de Pacientes (`src/lib/patientsStore.ts`)
- **Remover**: Constantes `MOCK_DIETS` e `MOCK_ASSESSMENTS`.
- **Ajustar `getConsultationRecord`**: Retornar apenas dietas, avaliações físicas e notas vinculadas a dados reais salvos no armazenamento local. Se não houver registro para a data solicitada, retornar campos vazios/indefinidos em vez de notas ou suplementos simulados.
- **Ajustar `updatePatientInStorage`**: Remover comentários e comportamentos de salvamento para pacientes inexistentes via fallback mock.

### 3.2. Store de Receitas (`src/lib/recipesStore.ts`)
- **Ajustar `getRecipesFromStorage()`**: Caso `localStorage` esteja vazio, retornar `[]` em vez da lista padrão com "Panqueca Proteica" e "Escondidinho Fit".

### 3.3. Página Prontuário do Paciente (`src/app/pacientes/[id]/page.tsx`)
- **Ajustar Estados Iniciais**: Alterar `dietHistory` e `bodyAssessments` de `useState([MOCK_DIETS...])` para `useState<HistoricalDiet[]>([])` e `useState<BodyAssessment[]>([])`.
- **Tratamento de Paciente Não Encontrado**: Se `getPatientById(patientId)` retornar `null`, exibir estado visual de "Paciente não encontrado" com botão para retornar à listagem de pacientes, eliminando a criação de `'Paciente Sem Nome'`.

### 3.4. Página Registro de Consulta (`src/app/pacientes/[id]/consulta/[date]/page.tsx`)
- **Tratamento de Registro Inexistente**: Remover o objeto fallback `'Paciente Sem Nome'`. Exibir mensagem clara de "Consulta / Registro não encontrado" com link para voltar ao prontuário.

### 3.5. Telas de Lista (`/pacientes`, `/receitas`, `/presets`, `/refeicoes-prontas`)
- Garantir que todos os *Empty States* das páginas de listagem utilizem os componentes do Design System (Cards com `Users`, `Utensils`, `Sliders`, etc.), incentivando o cadastro do primeiro item.

## 4. Requisitos Funcionais e Não-Funcionais

### Requisitos Funcionais (RF)
- **RF-01**: A lista de pacientes deve iniciar vazia se não houver registros salvos.
- **RF-02**: O histórico de dietas e avaliações no prontuário do paciente deve refletir exclusivamente dados criados pelo usuário.
- **RF-03**: O repositório de receitas deve iniciar vazio sem itens padrão de demonstração.
- **RF-04**: IDs inválidos de pacientes nas rotas `/pacientes/[id]` e `/pacientes/[id]/consulta/[date]` devem ser tratados com tela de erro/não encontrado amigável.
- **RF-05**: Toda a persistência em `localStorage` deve continuar operacional para novos dados criados.

### Requisitos Não-Funcionais (RNF)
- **RNF-01**: Sem regressões nos testes automatizados (`vitest`).
- **RNF-02**: Manutenção da identidade visual e tempos de resposta instantâneos no cliente.

## 5. Critérios de Aceite
1. Executar `localStorage.clear()` e navegar por todas as rotas do aplicativo sem erros de renderização ou dados mock visíveis.
2. Criar um novo paciente, nova receita, nova dieta e verificar se o fluxo funciona do início ao fim sem dependência de dados mock.
3. Passar em 100% dos testes unitários e de integração (`npm run test`).
