# 09. Roadmap de Implementação e Governança

**Status:** Aprovado  
**Documento Anterior:** [08. Testes, Desempenho e Homologação](./08-testes-performance-e-homologacao.md)  
**Índice Geral:** [Índice Canônico](./index.md)

---

## 1. Fases de Implementação e Entrega

A arquitetura do Dieta DB será entregue em 5 etapas progressivas e não-bloqueantes:

```mermaid
gantt
    title Roadmap de Implementação - Dieta DB
    dateFormat  YYYY-MM-DD
    section Fase 1: Fundação Relacional
    Drizzle ORM & Schemas SQL         :a1, 2026-09-01, 5d
    Repositórios DAL (Pacientes/Dietas):a2, after a1, 4d
    section Fase 2: Receitas & Refeições
    Tabelas de Receitas & Snapshots   :b1, after a2, 4d
    Refeições Prontas & Alimentos     :b2, after b1, 3d
    section Fase 3: Persistência Dual
    Draft Buffer & Commit ACID (Ctrl+S):c1, after b2, 4d
    BroadcastChannel Multi-Aba        :c2, after c1, 2d
    section Fase 4: Arquivo Mestre
    Import/Export .nutridiet & Checksum:d1, after c2, 4d
    Mecanismo de Auto-Migração        :d2, after d1, 3d
    section Fase 5: Lastro Nuvem
    Tabela sync_outbox & UUID v7      :e1, after d2, 3d
```

---

## 2. Matriz de Riscos Técnicos e Mitigações

| Risco Identificado | Impacto | Probabilidade | Estratégia de Mitigação |
| :--- | :---: | :---: | :--- |
| **Defasagem de schema entre versões do app** | Alto | Média | Versionamento semântico no manifesto e scripts de auto-migração sequenciais no Drizzle. |
| **Perda de digitação em queda de energia** | Alto | Baixa | Buffer de rascunho com salvamento contínuo em debounce (300ms). |
| **Colisão de dados ao sincronizar com nuvem** | Crítico | Baixa | Adoção estrita de UUID v7 (time-ordered) para todas as chaves primárias. |
| **Adulteração acidental do arquivo `.nutridiet`** | Médio | Média | Verificação automática de integridade por Checksum SHA-256 no momento da importação. |

---

## 3. Regras de Governança e Evolução

1. **Princípio da Fonte Única**: Nenhuma regra de persistência deve ser duplicada fora de `refs/dieta-db/` e dos ADRs oficiais (`docs/adr/`).
2. **Evolução de Schemas**: Toda nova coluna ou tabela deve:
   - Ser adicionada ao schema Drizzle (`src/lib/db/schema.ts`).
   - Gerar uma migração correspondente.
   - Incrementar o `schemaVersion` no manifesto do `.nutridiet`.
   - Incluir teste de migração regressiva na suíte de testes.
3. **Imutabilidade de Contratos DAL**: Componentes de UI não podem instanciar conexões diretas de banco de dados; toda interação deve passar por interfaces de repositório.
