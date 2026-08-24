# Feature Specification: Pesquisa de Concorrentes — Apps de Nutrição no Brasil

**Feature Directory**: `specs/24-08-26-pesquisa-concorrentes-apps-nutricao`  
**Created**: 2026-08-24  
**Status**: Ready for Planning / Validated  
**Input**: User description: "levantamento dos principais apps brasileiros para nutricionistas para administrar dieta e medidas dos pacientes. liste ao menos 10 bons concorrentes do mercado, os maiores. crie algumas sub categorias de pesquisa sobre cada um: preço (ticket medio, preço de planos, se achar churn e ltv); analise swot; nicho de mercado; principais estados e nichos atuantes; também me de mais informações relevantes sobre os concorrentes. crie uma estrutura bem separada para entendimento facil dos arquivos. crie um .html completo para mostrar o resultado da pesquisa. a pesquisa deve ser ultra detalhada."

---

## User Scenarios & Testing

### User Story 1 - Consulta Comparativa de Preços, Métricas SaaS e Políticas Comerciais (Priority: P1)

Como tomador de decisão de produto ou nutricionista pesquisador,  
Eu quero consultar uma tabela comparativa com os 10 maiores concorrentes de software de nutrição do Brasil contendo preços granulares (mensal, semestral, anual), taxas de desconto, ticket médio exato, estimativas de churn e LTV, além de políticas de cancelamento e retenção,  
Para que eu possa entender com máxima precisão o posicionamento de mercado e a viabilidade econômica do setor.

**Why this priority**: A viabilidade financeira, políticas de cobrança e estrutura de custos são essenciais para mapear a retenção e barreiras de entrada dos profissionais.

**Independent Test**: Pode ser testado abrindo o arquivo de tabela comparativa ou a aba "Matriz Geral" no dashboard HTML e verificando os valores de mensalidade, planos anuais, churn, LTV e regras comerciais dos 10 competidores.

**Acceptance Scenarios**:
1. **Given** a tabela comparativa aberta, **When** o usuário analisa os concorrentes, **Then** todos os 10 concorrentes possuem preços explícitos em Real (R$), faturamento anualizado, ticket médio calculado e projeção de churn/LTV.
2. **Given** os dados de precificação, **When** comparados entre si, **Then** é possível identificar a segmentação por faixas (< R$ 70, R$ 70-110, > R$ 110) e o impacto das políticas de cancelamento e lock-in de cada plataforma.

---

### User Story 2 - Análise SWOT Ultra-Detalhada e Protocolos de Medidas/Dietas (Priority: P1)

Como designer de produto ou arquiteto de software,  
Eu quero acessar análises SWOT aprofundadas (com mínimo de 4 itens por quadrante), dados de fundação/origem, stack tecnológica, recursos antropométricos (dobras cutâneas, bioimpedância, somatocarta) e bases de alimentos de cada um dos 10 concorrentes,  
Para identificar minuciosamente os gargalos de usabilidade e pontos de diferenciação técnica para o NutriDiet Local Pro.

**Why this priority**: O mapeamento exaustivo de fraquezas e fortalezas dos concorrentes justifica e blinda as decisões arquiteturais do projeto.

**Independent Test**: Pode ser validado inspecionando os cards de cada competidor com os 4 quadrantes SWOT detalhados, stacks de desenvolvimento e protocolos antropométricos suportados.

**Acceptance Scenarios**:
1. **Given** o detalhamento de um concorrente (ex: Webdiet, Dietbox ou Nutrium), **When** o usuário lê a seção SWOT, **Then** há ao menos 4 forças, 4 fraquezas, 3 oportunidades e 3 ameaças concretas documentadas.
2. **Given** o módulo de medidas, **When** inspecionado, **Then** são identificados com precisão os protocolos de composição corporal adotados (Pollock 3/7, Petroski, Faulkner, Guedes, ISAK, somatotipo de Heath-Carter, etc.).

---

### User Story 3 - Visualização Interativa em Dashboard HTML (Priority: P2)

Como usuário executivo ou pesquisador visual,  
Eu quero abrir um arquivo `.html` interativo no navegador com filtros por nicho, tier e faixa de preço, barra de busca instantânea e chaveamento entre visualização de cards e tabela,  
Para explorar os dados da pesquisa de maneira fluida, agradável e rica.

**Why this priority**: Facilita a apresentação dos resultados para stakeholders sem necessidade de ler dezenas de páginas de markdown brutos.

**Independent Test**: Abrir o arquivo `dashboard-pesquisa-concorrentes.html` em qualquer navegador web e testar os filtros de busca, cliques nas abas e responsividade visual.

**Acceptance Scenarios**:
1. **Given** o arquivo HTML aberto no navegador, **When** o usuário digita um termo no campo de busca (ex: "esportivo" ou "SP"), **Then** os cards e a tabela são filtrados em tempo real.
2. **Given** a barra de navegação superior, **When** o usuário clica em "Cards SWOT", "Matriz Geral" ou "Gaps & UVP", **Then** a visualização correspondente é exibida sem recarregar a página.

---

### Edge Cases

- **Dados Confidenciais de SaaS**: Para empresas com capital fechado, o churn e LTV utilizam modelos de regressão baseados em benchmarks públicos da ABStartups/SaaS Brasil combinados com índices de cancelamento em canais de suporte e reclamações públicas (Reclame Aqui).
- **Softwares Híbridos (Desktop + Cloud)**: A pesquisa discrimina separadamente a precificação de assinaturas web recorrentes e o custo de licenciamento perpétuo das versões desktop legadas.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE catalogar ao menos 10 dos maiores concorrentes brasileiros de software para nutricionistas (Webdiet, Dietbox, Nutrium, Avanutri, Dietpro, Dietwin, Nutrilize, Sistema SAN, HubNutri, EasyDiet Pro).
- **FR-002**: Cada concorrente DEVE conter levantamento de preços ultra-detalhado com valor mensal, desconto para planos semestral/anual, ticket médio mensal estimado, churn médio estimado e LTV projetado.
- **FR-003**: Cada concorrente DEVE possuir uma análise SWOT completa e exaustiva cobrindo Forças, Fraquezas, Oportunidades e Ameaças (mínimo de 4 itens por quadrante nos líderes).
- **FR-004**: Cada concorrente DEVE especificar seu nicho de mercado primário (Clínico, Esportivo, Hospitalar/UAN, Recém-formados) e principais estados/regiões de atuação no Brasil com base demográfica no CFN.
- **FR-005**: A pesquisa DEVE documentar com precisão cirúrgica os recursos de prescrição dietética (bases TACO, TBCA, USDA, IBGE) e avaliação antropométrica (Pollock 3/7, Petroski, Faulkner, Guedes, ISAK, Bioimpedância, Somatocarta) de cada player.
- **FR-006**: A documentação DEVE ser dividida em arquivos modulares na pasta `refs/pesquisa-mercadologica/` para fácil leitura e manutenção.
- **FR-007**: DEVE ser fornecido um arquivo HTML autocontido (`dashboard-pesquisa-concorrentes.html`) com interface interativa, filtros reativos e visualização rica.
- **FR-008 (Ultra-Detalhamento)**: A pesquisa DEVE incluir informações complementares institucionais e técnicas para cada concorrente: ano de fundação, sede/origem, modelo de integração com WhatsApp, aplicativos nativos para pacientes e políticas de retenção de prontuários.

### Key Entities

- **CompetitorProfile**: Entidade do concorrente (Nome, Tier, Fundação/Sede, Plataforma, Resumo, Ticket Médio, Stack/Integrações).
- **PricingStructure**: Estrutura de preços (Plano Mensal, Plano Semestral/Anual, Taxa de Churn estimada, LTV e Políticas de Cancelamento).
- **SWOTAnalysis**: Quatro listas de atributos aprofundadas (Forças, Fraquezas, Oportunidades, Ameaças).
- **MarketScope**: Segmentação de mercado (Nicho de atuação, Estados chave de penetração, Personas prioritárias).
- **FeatureSet**: Conjunto de funcionalidades nutricionais (Módulos antropométricos, bases de dados alimentares, exportação WhatsApp e PDF).

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos 10 concorrentes catalogados com todos os campos de preços, SWOT profunda, nichos, estados e recursos preenchidos sem lacunas.
- **SC-002**: O arquivo HTML interativo carrega em menos de 1 segundo em navegadores desktop modernos e possui busca reativa em tempo real.
- **SC-003**: A documentação técnica detalha ao menos 8 protocolos antropométricos distintos e 4 tabelas de composição de alimentos.
- **SC-004**: A pesquisa isola com clareza as 4 lacunas centrais de mercado (gargalos de velocidade, lock-in, falta de offline e escala de macros) para fundamentar a arquitetura do NutriDiet Local Pro.

---

## Assumptions

- Todos os dados foram coletados e calibrados com base em informações oficiais públicas, tabelas de preços vigentes e dados do Conselho Federal de Nutricionistas (CFN).
- O arquivo `.html` interativo opera 100% localmente no navegador, sem necessidade de servidores Node ou bancos de dados remotos.
