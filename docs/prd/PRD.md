# Product Requirements Document (PRD) - NutriDiet Local Pro

> 📌 **Navegação Rápida da Documentação**:
> - 📄 **PRD**: [PRD.md](file:///c:/Programmer/diet-maker/docs/prd/PRD.md)
> - 📖 **Glossário de Domínio**: [CONTEXT.md](file:///c:/Programmer/diet-maker/docs/context/CONTEXT.md)
> - 🏛️ **Decisões de Arquitetura**: [ADRs](file:///c:/Programmer/diet-maker/docs/adr/)
> - 🤖 **Instruções para Agentes**: [AGENTS.md](file:///c:/Programmer/diet-maker/AGENTS.md)
> - 🏠 **Índice Geral**: [README.md](file:///c:/Programmer/diet-maker/README.md)

---

> **Persistência consolidada — 2026-08-30:** requisitos, vocabulário,
> decisões e etapas estão reunidos em [dieta-db](../../refs/dieta-db/index.md).
> Este PRD preserva a visão geral do produto; os contratos de armazenamento
> devem ser mantidos naquela pasta, sem versões paralelas.

## 1. Executive Summary

### 1.1 Problem Statement
Nutricionistas clínicos e esportivos perdem tempo precioso durante e após as consultas utilizando softwares genéricos lentos, dependentes de conexão de internet ou planilhas complexas com cálculos manuais de macronutrientes. A adaptação rápida de gramaturas, o envio de orientações pelo WhatsApp e o ajuste de escala de porções consomem minutos excessivos, reduzindo a atenção dedicada ao paciente e limitando a capacidade de atendimento.

### 1.2 Proposed Solution
O **NutriDiet Local Pro** é um aplicativo web local (offline-first), ultra-rápido e visualmente intuitivo, desenvolvido para centralizar a criação, adequação, cópia/cola e escala de dietas em ambiente visual. Ele une a base oficial brasileira de alimentos (TACO) a um construtor de refeições com recalculo instantâneo de macronutrientes, controle de metas manuais estritas (g/kg e Kcal), exportação para PDF/WhatsApp e banco relacional local com backup manual `.nutridiet` em JSON, sem criptografia e sem senha.

### 1.3 Platform Scope
O projeto será desenvolvido exclusivamente para visualização e uso em **desktop**, considerando a faixa oficial a partir de `1024px`.

Não fazem parte do escopo do produto:

- versão mobile;
- versão tablet;
- layouts ou componentes específicos para telas estreitas;
- estratégia mobile-first.

Variações de largura dentro da faixa desktop devem preservar a usabilidade, mas não representam suporte a dispositivos móveis ou tablets.

### 1.4 Success Criteria & KPIs
- **Velocidade de Prescrição**: Tempo médio de criação/adaptação completa de uma dieta < 5 minutos.
- **Precisão Nutricional**: Resultados reproduzíveis a partir da TACO, valores informados e peso de referência da prescrição, com energia e arredondamento definidos na Decisão 06.
- **Desempenho da Aplicação**: Busca de alimentos em < 100 ms após inicialização. A PoC registra abertura e gravação com amostra representativa, sem acrescentar metas de volume ou memória não solicitadas.
- **Portabilidade de Dados**: Exportação/importação integral dos dados confirmados da Conta pelo `.nutridiet`, sem dependência de nuvem. Recuperação limitada ao último arquivo exportado disponível; drafts ficam fora do backup.

---

## 2. User Experience & Functionality

### 2.1 User Personas
- **Dr. Lucas (Nutricionista Esportivo/Clínico)**: Atende de 6 a 10 pacientes por dia no consultório. Precisa ajustar dietas em tempo real enquanto conversa com o paciente, duplicar refeições de templates anteriores, alterar a escala de carboidratos/proteínas em porcentagem e enviar a dieta imediatamente no WhatsApp do paciente ao encerrar a consulta.

### 2.2 User Stories & Acceptance Criteria

#### User Story 1: Definir Metas Manuais do Paciente
- **Como** nutricionista,
- **Eu quero** cadastrar o paciente e digitar manualmente as metas exatas de Proteínas (g), Carboidratos (g), Gorduras (g) e Kcal,
- **Para que** o sistema calcule automaticamente o g/kg e exiba os deltas remanescentes na dieta em tempo real.
- **Acceptance Criteria**:
  - Exibir campos numéricos para entrada direta de Proteínas (g), Carboidratos (g), Gorduras (g) e Kcal.
  - Calcular e atualizar instantaneamente a relação g/kg de cada macronutriente com base no peso do paciente.
  - Exibir indicadores de tolerância visual (Verde para ±5% da meta, Amarelo para próximo e Vermelho para desvio crítico).
  - *Referência de Arquitetura*: [ADR-003: Metas Manuais e Tolerância Visual](file:///c:/Programmer/diet-maker/docs/adr/ADR-003-macro-targets-and-tolerance-ranges.md).

#### User Story 2: Construtor Visual por Refeições e Busca TACO
- **Como** nutricionista,
- **Eu quero** adicionar refeições e buscar alimentos na tabela TACO integrada com autocompletar instantâneo,
- **Para que** a alteração da gramatura recalcule imediatamente as Kcal, Proteínas, Carboidratos, Gorduras e Fibras do prato.
- **Acceptance Criteria**:
  - Autocompletar por texto com filtro por nome e categoria de alimento em < 100ms.
  - Entrada de gramatura (`amountG`) editável na hora, com atualização reativa dos totais da refeição e do dia.
  - Suporte a inclusão de opções de substituição manual por refeição.
  - *Referência de Arquitetura*: [ADR-004: Modelo de Alimentos Substitutos](file:///c:/Programmer/diet-maker/docs/adr/ADR-004-food-substitutions-model.md).

#### User Story 3: Escala Proporcional em Lote (% / Factor)
- **Como** nutricionista,
- **Eu quero** aumentar ou reduzir a gramatura dos alimentos de uma refeição ou da dieta inteira por uma porcentagem (ex: +15% ou -10%),
- **Para que** eu possa adequar rapidamente o volume calórico sem precisar alterar alimento por alimento manualmente.
- **Acceptance Criteria**:
  - Modal interativo permitindo selecionar aumento (+%) ou redução (-%) com atalhos de 5%, 10%, 15%, 20%, 25%, 30%.
  - Multiplicação proporcional de todas as gramaturas dos alimentos envolvidos com arredondamento inteligente.

#### User Story 4: Exportação para WhatsApp e PDF Clinico
- **Como** nutricionista,
- **Eu quero** gerar um texto formatado com emojis para o WhatsApp e um documento PDF profissional com 1 clique,
- **Para que** o paciente receba o plano alimentar de forma clara e organizada no celular ou impresso.
- **Acceptance Criteria**:
  - Gerar texto estruturado por refeições, quantidades, horários e orientações de hidratação com botão "Copiar Texto".
  - Gerar arquivo PDF com cabeçalho clínico, dados do paciente, tabela de refeições, metas e observações.

#### User Story 5: Persistência Local e Backup Mestre (.nutridiet)

- **Como** nutricionista,
- **Eu quero** salvar os dados confirmados no banco local, proteger a edição
  com autosave e exportar/restaurar manualmente o arquivo mestre da Conta,
- **Para que** eu possa trabalhar offline e manter uma cópia portável sob meu controle.

Os critérios de aceite e limites desta história estão nos
[requisitos consolidados de dieta-db](../../refs/dieta-db/index.md#requisitos-consolidados).
A [divisão em SDDs](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md)
organiza sua implementação sem acrescentar funcionalidades.

### 2.3 Non-Goals (Fora do Escopo)
- Prontuário eletrônico estendido ou anamnese médica completa.
- Sistema de agendamento de consultas ou módulo financeiro/faturamento.
- Servidor em nuvem centralizado ou sincronização multi-usuário via API remota.
- Aplicativo móvel para pacientes (foco total na ferramenta de trabalho do nutricionista no computador).
- *Referência de Arquitetura*: [ADR-001: Escopo do Produto](file:///c:/Programmer/diet-maker/docs/adr/ADR-001-product-scope-and-architecture.md).

---

## 3. Technical Specifications & Architecture

### 3.1 Stack Tecnológica
- **Frontend Core**: React 19 + Next.js App Router, conforme ADR-006.
- **Estilização**: TailwindCSS v4 + Lucide React Icons.
- **Manipulação de PDF**: `jspdf` + `html2canvas`.
- **Persistência**: Repositórios tipados e banco relacional local; PGlite + Drizzle sujeitos à prova técnica. IndexedDB separado para drafts; File API para backup manual `.nutridiet` em JSON, sem criptografia ou senha.

### 3.2 Contrato do Arquivo Mestre (`.nutridiet`)

O contrato é mantido exclusivamente em
[dieta-db — Recuperação e portabilidade local](../../refs/dieta-db/11-recuperacao-e-portabilidade-local.md),
com os limites de proteção na
[Decisão 13](../../refs/dieta-db/13-protecao-local-e-backup-simples.md).
Não manter neste PRD outro schema, formato ou protocolo de restauração.


---

## 4. Risks & Phased Roadmap

### 4.1 Technical Risks & Mitigations
- **Risco**: Perda de dados por fechamento acidental da janela do navegador durante a consulta.
  - **Mitigação**: Autosave e tratamento de falhas definidos na [Decisão 01](../../refs/dieta-db/01-fluxo-paciente-dieta.md); limitações e validação centralizadas em dieta-db.
- **Risco**: Limpeza/expulsão do armazenamento pelo navegador ou perda do dispositivo.
  - **Mitigação**: Retenção local e backup manual conforme as [Decisões 09](../../refs/dieta-db/09-topologia-v1-local-first-e-conta-local.md) e [11](../../refs/dieta-db/11-recuperacao-e-portabilidade-local.md).
- **Risco**: Incompatibilidade na geração do PDF com tabelas grandes.
  - **Mitigação**: Renderização de página dupla adaptativa via `html2canvas` com tratamento de quebra de página A4.

### 4.2 Roadmap de Lançamento (Fases)
- **Fase 1 (MVP Local)**: Construtor por refeições, Tabela TACO, Metas Manuais, Escala %, Exportador WhatsApp/PDF, persistência relacional local, drafts separados e backup mestre `.nutridiet`. Execução conforme Decisões 04 e 14, após a prova técnica da Decisão 10.
- **Fase 2 (Templates Avançados)**: Biblioteca expandida de protocolos nutricionais (Low Carb, Cetogênica, FODMAPs, Jejum Intermitente).
- **Fase 3 (Impressão Personalizada)**: Suporte a inclusão de logotipo personalizado do consultório no cabeçalho do PDF.
