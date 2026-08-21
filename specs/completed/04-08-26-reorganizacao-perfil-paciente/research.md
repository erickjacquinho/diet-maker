# Research: Reorganização estrutural do perfil do paciente

**Date**: 2026-08-04

## Decision 1: distinguir meta manual de plano vigente

**Decision**: a superfície do perfil não deve tratar `Patient.targetKcal`, `targetProtein`, `targetCarbs` e `targetFats` como a dieta mais recente. O resumo contextual deve ser derivado do registro de dieta vigente em `HistoricalDiet`; se houver mais de uma dieta marcada como ativa, prevalece a data de registro mais recente.

**Rationale**: os campos do paciente representam metas editáveis e podem sobreviver a uma troca de dieta. O histórico de dietas possui data, status e totais calculados a partir do registro de prescrição, oferecendo a origem temporal que falta à meta manual.

**Alternatives considered**:

- Manter a grade de metas no topo: rejeitada porque mistura intenção manual com estado prescrito e compete com os dados pessoais atuais.
- Remover todo e qualquer resumo de macros: rejeitada para o primeiro corte porque energia e distribuição resumida ainda podem ajudar a reconhecer a dieta vigente, desde que apareçam em baixa hierarquia e com origem explícita.

## Decision 2: manter o perfil como resumo, não como segunda página de dieta

**Decision**: o perfil mostra apenas contexto, status, data e totais resumidos do plano vigente; refeições, detalhes e versões continuam no fluxo da dieta e no histórico.

**Rationale**: duplicar o conteúdo da dieta aumenta a manutenção e reduz a clareza de qual tela é a fonte de detalhe.

**Alternatives considered**:

- Copiar toda a distribuição de macros e refeições para o perfil: rejeitada por duplicação e excesso de densidade.
- Exibir apenas um link sem contexto: rejeitada porque o nutricionista precisa reconhecer qual plano está vigente antes de abrir detalhes.

## Decision 3: preservar a hierarquia atual da jornada

**Decision**: manter a identidade e os dados pessoais no primeiro nível; indicadores corporais atuais e acompanhamento vêm em seguida; histórico permanece abaixo.

**Rationale**: essa ordem acompanha a decisão clínica cotidiana e respeita as mudanças visuais já realizadas na página.

**Alternatives considered**:

- Promover o histórico para o topo: rejeitada porque o histórico é contextual e longitudinal, não o estado atual do paciente.
- Promover o agendamento para o topo: rejeitada porque o acompanhamento é importante, porém secundário à compreensão clínica imediata.

## Decision 4: usar estados vazios sem inventar dados

**Decision**: ausência de dieta, medição ou acompanhamento deve ser comunicada com estado vazio contextualizado e ação apropriada, sem zerar ou reutilizar outro campo como fallback semântico.

**Rationale**: zeros e placeholders com aparência de valor atual podem induzir decisões nutricionais equivocadas.

## Local evidence

- `src/lib/patientsStore.ts` separa `Patient`, `HistoricalDiet`, `BodyAssessment` e `PatientNextEvent`.
- `src/app/pacientes/[id]/page.tsx` já carrega histórico de dietas e avaliações e consolida atualizações por data.
- `docs/context/CONTEXT.md` define o domínio de metas energéticas e macronutrientes, mas não transforma metas manuais em uma dieta histórica.
- A constituição do projeto exige Atomic Design, design system canônico, WCAG 2.2 AA, testes isolados e execução futura via `/speckit-implement`.

## Unresolved items

Não há dependências externas ou decisões de stack pendentes para o SDD. A escolha exata de composição visual dos componentes existentes será validada no plano de implementação e na revisão humana.

## Implementation mapping

- A seleção determinística de avaliação e plano será isolada em `src/lib/patientProfileSelectors.ts` para que regras temporais sejam testadas sem montar a rota ou tocar no armazenamento.
- A rota `src/app/pacientes/[id]/page.tsx` continuará responsável por carregar os dados e compor a interface; não haverá store novo nem componente visual de domínio para o resumo.
- A validação visual reutilizará `Card`, `MetricBox`, `Badge`, `Button`, `Dialog`, `Select`, `DatePickerField` e os tokens/classes já existentes no projeto.
