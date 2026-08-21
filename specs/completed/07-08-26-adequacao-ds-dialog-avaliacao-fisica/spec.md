# Especificação da Feature: Adequação do Dialog de Avaliação Física ao Design System e Composition Patterns

## Visão Geral

O modal de criação e edição de Avaliação Física (`EditAssessmentModal.tsx`) é um componente fundamental do fluxo de atendimento de pacientes no Diet Maker. Atualmente, este componente apresenta desvios em relação às diretrizes do Design System e aos padrões recomendados pelo `/vercel-composition-patterns`:
1. **Proliferação de Props Booleana / Modos Monolíticos (`architecture-avoid-boolean-props`)**: O componente utiliza `mode?: 'create' | 'edit'` para chavear comportamento de modo condicional internamente em uma estrutura monolítica de 359 linhas.
2. **Acoplamento de Estado e Implementação (`state-decouple-implementation`)**: O formulário gerencia rascunho de estado (`draft`), disparo de atualização de campos individuais e cálculo reativo de composição corporal (`calculateBodyComposition`) no topo da renderização da modal em vez de desacoplar via contexto/sub-componentes composáveis.
3. **Componentes Hardcoded e Estilos Fora do Design System**:
   - Uso de classes arbitrárias como `max-h-[85vh]` e `max-w-lg` no `DialogContent` em vez de tokens ou componentes de layout padronizados.
   - Modificador de opacidade arbitrário `bg-surface-subtle/30`, que viola a disciplina de tokens de superfície.
   - Ícones `Lucide` com tamanhos hardcoded inline (`size={18}`, `size={14}`) sem invólucro ou tokens de tamanho.
   - Tags HTML brutas (`<label>`, `<form>`) com CSS ad-hoc (`mt-1 h-9`) e misturas de classes inline como `text-text-muted` com `textStyle('caption')`.
   - Mensagem de erro de validação utilizando classes soltas `bg-error-soft border border-error-border rounded-control p-2` em vez de um componente de alerta/mensagem de erro padronizado.

Esta especificação define os requisitos para a refatoração completa do dialog de avaliação física, visando 100% de conformidade técnica, modularidade composável e legibilidade.

---

## Histórias de Usuário & Cenários

### Cenário 1: Nutricionista Acessa Modal de Criação ou Edição
- **Dado** que o profissional abre o dialog de avaliação física a partir do perfil do paciente ou da tela de consulta,
- **Quando** o dialog for renderizado,
- **Então** ele deve exibir o cabeçalho, as abas de "Tronco & Composição" e "Membros", e o resumo de composição corporal utilizando estritamente componentes atômicos e tokens do Design System, sem quebras visuais ou estilos hardcoded.

### Cenário 2: Cálculo Reativo e Preenchimento de Medidas
- **Dado** que o profissional altera o peso, tronco ou medidas de membros,
- **Quando** o contexto de estado da avaliação processar a alteração,
- **Então** o cálculo de BF %, Massa Gorda e Massa Magra deve ser reavaliado e transmitido reativamente para o componente de exibição em tempo real.

---

## Requisitos Funcionais

- **RF001**: O dialog de avaliação física deve ser estruturado utilizando padrões de composição de componentes (Compound Components / Provider), eliminando a prop monolítica de modo condicional onde aplicável.
- **RF002**: Toda a marcação de formulário deve utilizar componentes e tokens do Design System (`Dialog`, `Button`, `Input`, `Surface`, `MetricBoxGroup`, `textStyle`).
- **RF003**: Remoção total de seletores Tailwind arbitrários (`max-h-[85vh]`, `bg-surface-subtle/30`, `h-9` sob medida) e sustituição por tokens ou abstrações semânticas do projeto.
- **RF004**: Encapsulamento de rótulos e campos em um componente de campo padronizado (`FormField` / `MeasurementInput`), eliminando tags `<label>` e `<input>` ad-hoc repetidas em `TRUNK_FIELDS`, `UPPER_LIMB_FIELDS` e `LOWER_LIMB_FIELDS`.
- **RF005**: Normalização de ícones de interface para utilizar padrões de tamanho e cor do Design System.
- **RF006**: Preservação estrita do comportamento de cálculo corporal (`calculateBodyComposition` e `normalizePairedBodyMeasurements`) e garantias de acessibilidade (`aria-label`, `role="alert"`, validação de formulário).

---

## Requisitos Não Funcionais

- **RNF001**: **Arquitetura de Componentes**: Respeito integral às regras do `vercel-composition-patterns` (`architecture-avoid-boolean-props`, `architecture-compound-components`, `state-decouple-implementation`).
- **RNF002**: **Design System Clean Code**: Zero uso de modificadores de opacidade arbitrários (como `/30`) em tokens do sistema de design.
- **RNF003**: **Compatibilidade de Regressão**: Manter compatibilidade com os pontos de invocação existentes (`src/app/pacientes/[id]/page.tsx`, `src/app/pacientes/[id]/consulta/[date]/page.tsx` e `PatientConsultationHistoryTable.tsx`).

---

## Critérios de Aceite e Sucesso

- [ ] 0% de ocorrências de classes CSS com opacidade arbitrária (`/30`) ou alturas arbitrárias (`[85vh]`) no dialog.
- [ ] 100% dos campos de entrada de medidas utilizando abstratores de formulário e tokens do Design System.
- [ ] Refatoração do `EditAssessmentModal` aprovada em testes unitários e sem regressão funcional nas páginas de paciente e consulta.
- [ ] Sucesso na compilação do TypeScript (`npm run build` ou `tsc --noEmit`) sem erros de tipo.
