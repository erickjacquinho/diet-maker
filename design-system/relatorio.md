# Relatório — Refatoração de `design-system/`

> Objetivo: converter o que for possível em regras operacionais em `.agents/rules/` e simplificar o restante em um plano (`docs/plan/`), mantendo os dados executáveis intactos.

## 1. Situação atual

A pasta tem **17 documentos normativos** (01–15 + README + index) e `components/` com **11 categorias, 43 perfis, registry.json e contratos**. Alto acoplamento: normas ↔ dados executáveis ↔ scripts de verificação (`npm run verify:design-system`, `verify:design-system-legacy`).

Há três naturezas distintas misturadas:

| Natureza | O que é | Exemplos |
| --- | --- | --- |
| **Regras** | Restrição obrigatória ao escrever código | proibições (hex, `text-[Npx]`, `rounded-xl`), hierarquia de camadas, decisão usar/variar/compor/criar |
| **Referência de dados** | Tabelas de valores consumidas pela implementação | cores, tipografia, spacing, radius, z-index, motion |
| **Processo/plano** | Como propor, migrar, versionar e governar | ciclo de vida, ordem de migração, DoD |

## 2. Critério de classificação

- **Vira regra** (`.agents/rules/`): conteúdo acionável pelo agente durante edição de código — decisões, proibições, checagens. Estilo dos arquivos existentes (`atomic-design.md`, `shadcn-preservation.md`).
- **Vira plano** (`docs/plan/`): intenção de design, processo, roadmap de migração e governança.
- **Fica como dado**: `components/` (registry.json, categorias, perfis, contratos) e as **tabelas de valores** (cores, tipos, etc.) — são fontes executáveis verificadas por scripts; não devem virar regra nem processo.

## 3. Destino por documento

### → `.agents/rules/` (novos, seguindo o estilo existente)

| Novo arquivo | Origem | Conteúdo extraído |
| --- | --- | --- |
| `tokens.md` | 03 §4,7,9 | Convenção de nomes, valores proibidos (hex, arbitrários, `z-[N]`), política de tema único |
| `color-semantics.md` | 04 §9,10 + 02 §3.2 | Famílias, uso semântico, contraste, proibições |
| `typography.md` | 05 §1,10,11 | Catálogo fechado via `textStyle()`, pesos 400–700, proibições |
| `geometry-layout.md` | 06 §2,3,8,9,15 | Escala 4px, radius, borda 1px, dimensões, proibições de layout |
| `icons-motion-layers.md` | 07 | Lucide único, durações, easing, z-index, sombras, opacidade |
| `states-accessibility.md` | 08 | Receita de foco, matriz de estados, WCAG 2.2 AA, teclado, contraste |
| `component-decision.md` | 09 + 11 §4 | Sequência usar→configurar→variar→compor→criar, perguntas de bloqueio, proibições de API |

### → `atomic-design.md` (expandir, não criar novo)

| Origem | Acréscimo |
| --- | --- |
| 10 | Regras de dependência entre camadas, genérico vs domínio, quando usar Shadcn/Radix |

`shadcn-preservation.md` permanece como está.

### → `docs/plan/` (simplificados em 3–4 arquivos)

| Novo arquivo | Origem | Conteúdo |
| --- | --- | --- |
| `fundamentals.md` | 01 + 02 | Princípios e linguagem visual condensados (intenção, não regra) |
| `tokens-reference.md` | 03–08 | Tabelas de valores puras (cores, tipografia, spacing, radius, ícones, motion, z) |
| `governance.md` | 14 + 11 | Ciclo de vida, versionamento, depreciação, contrato mínimo |
| `migration-plan.md` | 13 | Ordem de migração (13 §15), DoD, verificação (LEG001–17) |

### → Ficam intactos

- `components/` inteiro (dados executáveis + `npm run verify:design-system`).
- `12`, `15`, `README` → absorvidos no novo `README.md` como índice; **12 e 15 podem ser removidos** pois já são índices humanos sem fonte normativa própria.
- `13` §18 (estado verificado) → move para `migration-plan.md`.

## 4. Estrutura-alvo

```text
design-system/
├── README.md              # índice + decisões fixadas + vocabulário (simplificado)
├── fundamentals.md        # (novo) 01-02 condensado
├── tokens-reference.md    # (novo) 03-08 tabelas de valores
├── governance.md          # (novo) 14+11 processo
├── migration-plan.md      # (novo) 13 roadmap
└── components/            # inalterado (dados executáveis)
```

```text
.agents/rules/
├── atomic-design.md           # expandido (10)
├── shadcn-preservation.md     # mantém
├── tokens.md                  # (novo)
├── color-semantics.md         # (novo)
├── typography.md              # (novo)
├── geometry-layout.md         # (novo)
├── icons-motion-layers.md     # (novo)
├── states-accessibility.md    # (novo)
└── component-decision.md      # (novo)
```

## 5. Passos de execução

1. Extrair regras → criar os 7 arquivos em `.agents/rules/` e expandir `atomic-design.md`.
2. Consolidar referências → montar `tokens-reference.md` copiando as tabelas de 03–08.
3. Criar `fundamentals.md`, `governance.md`, `migration-plan.md` e reescrever `README.md` como índice.
4. Remover 01–15 e `components/README` interno quando os novos arquivos cobrirem tudo.
5. Atualizar links: `AGENTS.md`, links documentais entre os arquivos e `npm run verify:links`.
6. Rodar `npm run verify:design-system`, `verify:design-system-legacy`, `test`, `lint`, `type-check` para garantir que registry/scripts não quebraram.

## 6. Pontos de atenção

- **Não renomear IDs/registry**: `registry.json`, categorias e perfis são fonte executável; renomear quebra o verifier.
- **Não apagar o snapshot LEG (§13/§18) sem preservá-lo** no `migration-plan.md` — é baseline histórico da auditoria.
- **As regras devem ser curtas e checáveis**, no estilo dos arquivos existentes (emojis, MUST/NÃO, listas), para não recriar a verbosidade atual.
- Links relativos quebram ao mover conteúdo → rodar `verify:links` após o passo 5.
