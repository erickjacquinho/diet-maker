# Quickstart & Verification Guide: Adequação Shadcn

## Runnable Verification Scenarios

### 1. Suíte de Testes Automatizados (Regressão)
Execute os testes unitários existentes para garantir que nenhuma alteração nos componentes quebre a aplicação:

```bash
npm run test
```

### 2. Validação Visual Manual
1. **Verificação do Avatar**:
   - Acesse a página de pacientes `/pacientes`.
   - Verifique o avatar do Dr. Lucas no menu lateral e o avatar com iniciais dos pacientes.
2. **Verificação do Histórico de Consultas**:
   - Acesse o perfil de um paciente ex: `/pacientes/pat-1`.
   - Verifique se a tabela de consultas é renderizada corretamente com a nova estilização de `@/components/ui/table`.
   - Clique em expandir/recolher em uma consulta para validar o acordeão na tabela.
3. **Verificação da Barra de Progresso e Métricas**:
   - Acesse o construtor de dietas.
   - Verifique os cards de macronutrientes (`MacroMetricCard`) e assegure que as barras de progresso são renderizadas utilizando `@/components/ui/progress`.
