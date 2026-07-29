# Quickstart & Manual Verification Guide

## Visão Geral de Validação

Este guia documenta o fluxo de teste e validação manual para confirmar a adequação de 100% das telas e modais aos componentes do Shadcn UI.

---

## Passos para Validação

### 1. Iniciar o Servidor de Desenvolvimento
```powershell
npm run dev
```

### 2. Validação por Rota de Aplicação

#### A. Tela Tabela de Alimentos TACO (`http://localhost:3000/alimentos`)
- [ ] Verificar se a busca utiliza `Input` de `@/components/ui/input`.
- [ ] Verificar se a listagem de alimentos utiliza `Table` de `@/components/ui/table`.
- [ ] Clicar em "Novo Alimento Customizado" e confirmar que o modal é aberto usando `Dialog` com overlay acessível e botão de fechar Shadcn.

#### B. Tela Lista de Pacientes (`http://localhost:3000/pacientes`)
- [ ] Clicar no botão "Novo Paciente" (`Button`) e validar abertura do modal `Dialog`.
- [ ] Preencher o formulário utilizando `Input` e `Select` do Shadcn.
- [ ] Confirmar cadastro e fechamento do modal com tecla ESC.

#### C. Tela Detalhes do Paciente (`http://localhost:3000/pacientes/[id]`)
- [ ] Testar modal de "Novo Plano Alimentar" via `Dialog`.
- [ ] Confirmar layout dos cartões de métricas via `Card`.

#### D. Tela Montador de Dieta (`http://localhost:3000/pacientes/[id]/dieta/[dietaId]`)
- [ ] Clicar em "Adicionar Refeição" e validar modal `Dialog`.
- [ ] Clicar em "Buscar Alimento TACO" e validar pesquisa em tempo real com `Input` e `Dialog`/`Sheet`.
- [ ] Ajustar gramas e porção utilizando `Input` e botões de `Button`.

#### E. Tela Presets (`http://localhost:3000/presets`)
- [ ] Testar modal de criação e aplicar preset utilizando `Dialog` e `Button`.

#### F. Tela Refeições Prontas (`http://localhost:3000/refeicoes-prontas`)
- [ ] Testar modal de cadastro rápido de refeição utilizando `Dialog`, `Input` e `Button`.

---

### 3. Validação de Build sem Erros de TypeScript
```powershell
npm run build
```
Confirmar que o projeto compila 100% limpo sem erros de sintaxe ou tipos.
