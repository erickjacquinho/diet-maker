# Plano de Arquitetura e Implementação: Remoção de Mocks

**Diretório da Tarefa**: `specs/30-07-26-remover-todos-os-mocks-das`
**Data**: 30/07/2026

## 1. Abordagem Arquitetural (Vercel Composition Patterns)

Focaremos em desacoplar o estado de renderização dos dados e padronizar o comportamento dos componentes de UI quando o armazenamento local estiver limpo:

### 1.1. Modificação de Stores (`src/lib/`)
1. `patientsStore.ts`:
   - Remover os arrays exportados `MOCK_DIETS` e `MOCK_ASSESSMENTS`.
   - Ajustar `getConsultationRecord(patientId, rawDate)` para consultar o armazenamento local de dietas e avaliações físicas salvas. Retornar `notes` e `prescribedSupplements` vazios caso não haja registro.
2. `recipesStore.ts`:
   - Modificar `getRecipesFromStorage()` para retornar `[]` em vez dos 2 objetos mock.

### 1.2. Componentes e Páginas de UI (`src/app/`)
1. `src/app/pacientes/[id]/page.tsx`:
   - Inicializar `dietHistory` e `bodyAssessments` com `[]`.
   - Carregar dados reais de dietas e avaliações salvas para o paciente.
   - Adicionar tratamento amigável de erro se o paciente não existir no localStorage (ex: card "Paciente não encontrado" + botão de retorno).
2. `src/app/pacientes/[id]/consulta/[date]/page.tsx`:
   - Tratar caso em que paciente não é encontrado (retornar estado visual limpo com CTA).
3. `src/lib/__tests__/`:
   - Atualizar os suítes de testes em `patientsStore.test.ts` e `dietStore.test.ts` se algum teste dependia da presença implícita dos mocks exportados.

## 2. Matriz de Componentes e Alterações

| Arquivo | Mudança | Motivo |
|---|---|---|
| `src/lib/patientsStore.ts` | Remover `MOCK_DIETS`, `MOCK_ASSESSMENTS`, ajustar `getConsultationRecord` | Eliminar dados mock centralizados |
| `src/lib/recipesStore.ts` | Retornar `[]` em `getRecipesFromStorage()` | Eliminar receitas mock padrão |
| `src/app/pacientes/[id]/page.tsx` | Zerar estado inicial de dietas/avaliações, tratar ID inexistente | Garantir tela limpa sem mocks em tempo de execução |
| `src/app/pacientes/[id]/consulta/[date]/page.tsx` | Tratar paciente/consulta não encontrado sem fallback mock | Evitar criação de "Paciente Sem Nome" fictício |
| `src/lib/__tests__/patientsStore.test.ts` | Atualizar/Adicionar testes para validar retorno de listas vazias | Garantir cobertura e ausência de regressão |

## 3. Plano de Verificação e Testes

### 3.1. Testes Automatizados
- Executar a suíte de testes com `npm run test` (ou `npx vitest run`) e garantir aprovação de 100% das asserções.

### 3.2. Teste Manual no Navegador
1. Limpar `localStorage` no browser (`localStorage.clear()`).
2. Acessar `/pacientes`: Verificar exibição do *Empty State* "Nenhum paciente cadastrado".
3. Acessar `/receitas`: Verificar exibição do *Empty State* "Nenhuma receita cadastrada".
4. Cadastrar um novo paciente e verificar se os dados salvos são exibidos corretamente.
