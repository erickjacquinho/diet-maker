# Auditoria de clarificação

Data: 2026-08-30. Uma pergunta feita e respondida. Resposta incorporada em
`spec.md`, seção Clarifications, FR-038, US2, Edge Cases e SC-011.

| Dimensão | Resultado | Evidência / decisão |
| --- | --- | --- |
| Objetivo, escopo e exclusões | Claro | Escopo, fontes e dependências; etapa 3 inteira, sem etapas 4–6 |
| Atores, propriedade e permissões | Claro | Conta/profissional/aba únicos; FR-001/002/019/033 |
| Entradas, saídas e estados | Resolvido | FR-003/015/038; mínimo de uma refeição com um alimento confirmado pelo usuário |
| Identidade, versões e lifecycle | Claro | FR-005/014/017–024/034; rascunho não é prescrição |
| Jornadas e interfaces | Claro | US1–US6 e decisões anteriores preservadas de Puxar informações |
| Integrações e dependências | Claro | Etapas 1/2, TACO e Conta local; etapas futuras explicitamente excluídas |
| Erros e recuperação | Claro | FR-007/020–024/033/037; falha local, rollback, resultado incerto e limpeza distintos |
| Segurança e privacidade | Claro | Isolamento local, sem autenticação/nuvem/logs clínicos; não prometer sigilo inexistente |
| Conformidade | Claro | Requisitos existentes do design system; nova política legal/eliminação física fora do escopo |
| Desempenho e operação | Claro | NFR-004, FR-037; busca <100 ms após inicialização, offline preparado, sem certificação adicional |
| Acessibilidade | Claro | NFR-001/002; desktop, teclado, foco e feedback acessível |
| Compatibilidade e transição | Claro | FR-035/036, preservação de Conta/pacientes; descartar somente legado de dietas de teste |
| Critérios de aceite e testes | Resolvido | SC-001–011; casos de falha e mínimo explícitos |
| Termos e pressupostos | Claro | Key Entities, glossário de dieta-db e fontes; sem pressuposto clínico não confirmado |

## Resoluções sem novas perguntas

- O mínimo é o da dieta no modo prescrito; não acrescentar requisito por
  variação ou número superior de refeições/alimentos.
- Cópia integral substitui o destino e cópia de metas usa a variação ativa:
  decisões já registradas no SDD anterior de Puxar informações, não novos
  comportamentos inferidos da divergência do código legado.
- Layout geral e novas fontes de biblioteca continuam fora do escopo.
- Precisão concreta, estrutura relacional, filas de autosave, erros tipados,
  identificação do dataset e organização de arquivos são decisões do plano
  para satisfazer os requisitos existentes; não são perguntas de produto.

Checklist de qualidade reavaliado: 13/16 → 16/16. Três itens passaram, sem
regressões. As notas iniciais do checklist foram preservadas como histórico.
Nenhuma ambiguidade de produto permanece aberta; seguir para Checklist.
