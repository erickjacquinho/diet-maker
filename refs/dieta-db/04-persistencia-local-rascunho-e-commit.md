# 04. Persistência Dual: Buffer de Rascunho e Commit ACID

**Status:** Aprovado  
**Documento Anterior:** [03. Receitas, Refeições Prontas e Imutabilidade Clínica](./03-receitas-refeicoes-e-imutabilidade-clinica.md)  
**Próximo Documento:** [05. Arquivo Mestre de Perfil (.nutridiet)](./05-arquivo-mestre-perfil-nutridiet.md)

---

## 1. O Desafio da Experiência em Consultório

Durante uma consulta clínica ou esportiva:
- O nutricionista digita notas, altera gramas de alimentos e testa combinações em ritmo acelerado.
- Se o navegador fechar por engano ou faltar energia, nenhum caractere digitado pode ser perdido.
- Por outro lado, salvar dados incompletos diretamente nas tabelas principais do banco geraria registros inconsistentes e poluiria o histórico.

---

## 2. A Arquitetura Dual de Persistência

A solução divide a persistência em duas camadas complementares:

```mermaid
flowchart TD
    subgraph Layer1 [Camada 1: Buffer de Rascunho Contínuo (Draft Buffer)]
        Typing[Digitação / Alteração de Gramas] -->|Debounce 300ms| SessionStore[(Storage de Sessão / Draft DB)]
        SessionStore -->|Em caso de crash| Restore[Recuperação Automática de Rascunho]
    end

    subgraph Layer2 [Camada 2: Commit Transacional ACID (Banco Oficial)]
        ClickSave[Botão 'Salvar' ou Ctrl+S] --> Validate{Validação de Schema (Zod)}
        Validate -->|Válido| SQLTx[Transação Atômica db.transaction()]
        SQLTx --> LocalDB[(Banco Relacional Local - Drizzle)]
        SQLTx --> Outbox[(Tabela sync_outbox)]
        SQLTx --> ClearDraft[Limpa Rascunho da Sessão]
        SQLTx --> NotifyTabs[BroadcastChannel Notifica Outras Abas]
    end
```

---

## 3. Especificação das Camadas

### 3.1 Camada 1: Buffer de Rascunho Contínuo (*Draft State*)
- **Ciclo de Gravação**: Gravação assíncrona com *debounce* de 300ms a cada caractere ou valor numérico modificado.
- **Escopo**: Restrito à tela ativa do formulário (ex: `draft_diet_pat_123` ou `draft_recipe_rec_456`).
- **Recuperação de Crash**: Ao reabrir a tela, se houver um rascunho com timestamp mais recente que o banco consolidado, a UI restaura o formulário com indicador visual discreto: *"Rascunho não salvo recuperado"*.

### 3.2 Camada 2: Commit Transacional ACID (*Official Store*)
- **Gatilho**: Disparado pelo clique no botão primário **"Salvar"** ou pelo atalho de teclado global **`Ctrl + S`** (`Cmd + S` no Mac).
- **Validação de Schema**: Validação síncrona via schemas estritos Zod. Se houver erro de tipo ou campo obrigatório em branco, a transação não é iniciada e o erro é destacado no campo.
- **Atomicidade (Tudo ou Nada)**: Todos os registros relacionados (ex: Paciente + Dieta + 6 Refeições + 25 Itens) são inseridos ou atualizados em bloco único `db.transaction(async (tx) => { ... })`. Se qualquer item falhar, ocorre *rollback* imediato.
- **Limpeza e Notificação**: Com a transação confirmada, o rascunho temporário é descartado e um evento `BroadcastChannel('nutridiet_db_sync')` atualiza as demais abas abertas instantaneamente.

---

## 4. Tratamento de Exclusões e Integridade em Cascata

A integridade referencial é garantida pelo motor SQL:
- **Exclusão de Paciente**: Apaga em cascata (`ON DELETE CASCADE`) todas as dietas, avaliações corporais e consultas vinculadas, sem deixar registros órfãos.
- **Exclusão de Receita na Biblioteca**: **Não afeta** os snapshots imutáveis já prescritos nas dietas dos pacientes.

---

## Próximos Passos
Veja como os dados são empacotados e versionados no arquivo físico em [05. Arquivo Mestre de Perfil (.nutridiet)](./05-arquivo-mestre-perfil-nutridiet.md).
