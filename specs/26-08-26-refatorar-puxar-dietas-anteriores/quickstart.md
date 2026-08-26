# Quickstart: Validação da Refatoração do botão Puxar Metas Anteriores com Modal

## Cenários de Teste e Validação Rápida

### 1. Testes Automatizados
Executar a suíte de testes do componente modal, hooks e funções de duplicação:

```bash
npm run test tests/components/molecules/ImportPreviousDietModal.test.tsx
npm run test tests/lib/dietDuplication.test.ts
npm run test
```

### 2. Validação Manual em Desenvolvimento (`npm run dev`)

#### Cenário A: Paciente sem dietas anteriores
1. Acessar a lista de pacientes `/pacientes` e criar ou selecionar um paciente sem histórico de dietas.
2. Clicar em "Criar Dieta" (navega para `/pacientes/[id]/dieta/nova`).
3. Verificar a barra de ações de metas: o botão "Puxar Metas Anteriores" / "Puxar Dieta Anterior" deve estar visualmente desabilitado (`disabled`).
4. Tentar clicar no botão: o modal não deve abrir.

#### Cenário B: Paciente com múltiplas dietas anteriores - Puxar apenas Macros
1. Acessar `/pacientes/[id]/dieta/nova` para um paciente que possua 2 ou mais dietas salvas.
2. Verificar que o botão está habilitado.
3. Clicar no botão para abrir o modal `ImportPreviousDietModal`.
4. Verificar que a tabela exibe todas as dietas anteriores ordenadas por data (mais recente no topo).
5. Observar que os botões "Puxar apenas os macros" e "Puxar todas as refeições" iniciam desabilitados.
6. Clicar em uma linha da tabela para selecionar uma dieta.
7. Verificar que os dois botões passam a estar habilitados.
8. Clicar em "Puxar apenas os macros".
9. O modal deve fechar, exibir toast de sucesso e atualizar apenas os valores de proteínas, carboidratos, gorduras e calorias nos cards de meta. As refeições continuam vazias.

#### Cenário C: Paciente com múltiplas dietas anteriores - Puxar todas as Refeições (Duplicação)
1. Abrir o modal novamente na mesma tela `/dieta/nova`.
2. Selecionar uma dieta que contenha refeições cadastradas.
3. Clicar em "Puxar todas as refeições".
4. O modal deve fechar, emitir toast de sucesso e carregar todas as refeições com seus respectivos alimentos e quantidades.
5. Editar a quantidade de um alimento ou o nome de uma refeição.
6. Clicar em "Salvar Dieta".
7. Navegar até o perfil do paciente e verificar:
   - A dieta anterior original permaneceu intacta e sem alterações.
   - O novo plano alimentar foi salvo com sucesso como um registro independente no histórico.
