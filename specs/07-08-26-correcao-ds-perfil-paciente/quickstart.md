# Quickstart Validation Guide: Perfil do Paciente

## Prerequisites
- Node.js >= 18
- Projeto `diet-maker` instalado com dependências (`npm install`)

## Steps to Validate Design System Compliance

### 1. Verification of Automated Tests
Execute the Vitest test suite to confirm zero regressions in components and selectors:

```bash
npm test
```

### 2. Static Audit Check
Verify that `src/app/pacientes/[id]/page.tsx` contains 0 direct imports of `@/components/ui/`:

```powershell
Select-String -Path "src/app/pacientes/[id]/page.tsx" -Pattern "from '@/components/ui/"
```

*Expected Result: No matches returned.*

### 3. Visual & Interactive Manual Inspection
Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000/pacientes/patient-1` (ou selecione qualquer paciente na listagem) e verifique:
1. **Nome do Paciente**: Exibido com `textStyle('subsection-title')` limpo, sem sobredimensionamento nem `font-bold` extra.
2. **Indicadores Atuais & Acompanhamento**: Blocos padronizados com `MetricBox` e `Surface` sem estilos inline soltos.
3. **Histórico de Consultas**: Renderizado via `PatientConsultationHistoryTable` com expansão de acordeão fluida.
4. **Modais**: "Reagendar Acompanhamento", "Editar Dados", "Novo Objetivo" e "Excluir Paciente" operam sem erros visuais ou de foco.
