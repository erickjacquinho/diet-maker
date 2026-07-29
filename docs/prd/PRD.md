# Product Requirements Document (PRD) - NutriDiet Local Pro

> 📌 **Navegação Rápida da Documentação**:
> - 📄 **PRD**: [PRD.md](file:///c:/Programmer/diet-maker/docs/prd/PRD.md)
> - 📖 **Glossário de Domínio**: [CONTEXT.md](file:///c:/Programmer/diet-maker/docs/context/CONTEXT.md)
> - 🏛️ **Decisões de Arquitetura**: [ADRs](file:///c:/Programmer/diet-maker/docs/adr/)
> - 🤖 **Instruções para Agentes**: [AGENTS_PATHS.md](file:///c:/Programmer/diet-maker/AGENTS_PATHS.md)
> - 🏠 **Índice Geral**: [README.md](file:///c:/Programmer/diet-maker/README.md)

---

## 1. Executive Summary

### 1.1 Problem Statement
Nutricionistas clínicos e esportivos perdem tempo precioso durante e após as consultas utilizando softwares genéricos lentos, dependentes de conexão de internet ou planilhas complexas com cálculos manuais de macronutrientes. A adaptação rápida de gramaturas, o envio de orientações pelo WhatsApp e o ajuste de escala de porções consomem minutos excessivos, reduzindo a atenção dedicada ao paciente e limitando a capacidade de atendimento.

### 1.2 Proposed Solution
O **NutriDiet Local Pro** é um aplicativo web local (offline-first), ultra-rápido e visualmente intuitivo, desenvolvido para centralizar a criação, adequação, cópia/cola e escala de dietas em ambiente visual. Ele une a base oficial brasileira de alimentos (TACO) a um construtor de refeições com recalculo instantâneo de macronutrientes, controle de metas manuais estritas (g/kg e Kcal), exportação limpa para PDF/WhatsApp e armazenamento local persistente em arquivos `.diet`.

### 1.3 Success Criteria & KPIs
- **Velocidade de Prescrição**: Tempo médio de criação/adaptação completa de uma dieta < 5 minutos.
- **Precisão Nutricional**: 100% de exatidão nos cálculos de calorias, macronutrientes e g/kg baseados na tabela TACO e peso do paciente.
- **Desempenho da Aplicação**: Carregamento da aplicação e tempo de resposta de busca de alimentos < 100ms.
- **Portabilidade de Dados**: 100% dos dados dos pacientes salvas em arquivos locais `.diet` portáveis, com zero dependência de nuvem externa.

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

#### User Story 5: Armazenamento e Gestão de Arquivos Locais (.diet)
- **Como** nutricionista,
- **Eu quero** salvar e abrir arquivos `.diet` diretamente nas pastas do meu computador e ter auto-save no navegador,
- **Para que** meus dados fiquem 100% protegidos, offline e sob meu controle total.
- **Acceptance Criteria**:
  - Permitir baixar o arquivo `.diet` (JSON estruturado) a qualquer momento.
  - Permitir carregar/importar arquivos `.diet` salvos anteriormente no disco.
  - Manter backup automático no `IndexedDB`/`LocalStorage` contra fechamento acidental da aba.
  - *Referência de Arquitetura*: [ADR-002: Persistência Híbrida e Arquivos Locais](file:///c:/Programmer/diet-maker/docs/adr/ADR-002-data-persistence-and-local-file-format.md).

### 2.3 Non-Goals (Fora do Escopo)
- Prontuário eletrônico estendido ou anamnese médica completa.
- Sistema de agendamento de consultas ou módulo financeiro/faturamento.
- Servidor em nuvem centralizado ou sincronização multi-usuário via API remota.
- Aplicativo móvel para pacientes (foco total na ferramenta de trabalho do nutricionista no computador).
- *Referência de Arquitetura*: [ADR-001: Escopo do Produto](file:///c:/Programmer/diet-maker/docs/adr/ADR-001-product-scope-and-architecture.md).

---

## 3. Technical Specifications & Architecture

### 3.1 Stack Tecnológica
- **Frontend Core**: React 19 + Vite 8.
- **Estilização**: TailwindCSS v4 + Lucide React Icons.
- **Manipulação de PDF**: `jspdf` + `html2canvas`.
- **Persistência**: HTML5 File API (Upload/Download de `.diet`) + IndexedDB / LocalStorage.

### 3.2 Estrutura do Arquivo de Dados (`.diet` / JSON Schema)
```json
{
  "app": "NutriDiet",
  "version": "1.0",
  "exportDate": "2026-07-29T00:00:00.000Z",
  "patient": {
    "id": "pat-123",
    "name": "Carlos Eduardo",
    "weight": 80.0,
    "height": 178,
    "age": 30,
    "objective": "Hipertrofia Muscular",
    "targetKcal": 2500,
    "targetProtein": 160,
    "targetCarb": 280,
    "targetFat": 65
  },
  "meals": [
    {
      "id": "meal-1",
      "name": "Café da Manhã",
      "time": "08:00",
      "items": [
        { "tacoId": "taco-18", "name": "Ovo de galinha inteiro cozido", "amountG": 150, "unit": "g" }
      ],
      "substitutes": [],
      "notes": "Consumir com café preto sem açúcar"
    }
  ]
}
```

---

## 4. Risks & Phased Roadmap

### 4.1 Technical Risks & Mitigations
- **Risco**: Perda de dados por fechamento acidental da janela do navegador durante a consulta.
  - **Mitigação**: Implementar salvamento automático síncrono no `IndexedDB` a cada alteração de input.
- **Risco**: Incompatibilidade na geração do PDF com tabelas grandes.
  - **Mitigação**: Renderização de página dupla adaptativa via `html2canvas` com tratamento de quebra de página A4.

### 4.2 Roadmap de Lançamento (Fases)
- **Fase 1 (MVP Local)**: Construtor por refeições, Tabela TACO, Metas Manuais, Escala %, Exportador WhatsApp/PDF e suporte a arquivos `.diet`.
- **Fase 2 (Templates Avançados)**: Biblioteca expandida de protocolos nutricionais (Low Carb, Cetogênica, FODMAPs, Jejum Intermitente).
- **Fase 3 (Impressão Personalizada)**: Suporte a inclusão de logotipo personalizado do consultório no cabeçalho do PDF.
