# Data Model: registros de correção e evidência

Nenhuma entidade clínica, tabela, coluna ou versão de save será criada. Os registros abaixo são documentação de rastreabilidade e metadados da matriz de testes existente.

| Registro | Campos e validação | Relações |
| --- | --- | --- |
| Achado | ID único F1–F5, origem, confirmado/hipótese/pendente, requisito, tarefas, evidência e resolução | Um achado possui vários requisitos/tarefas; só encerra com aceite correspondente. |
| Página | arquivo relativo normalizado e único, rota única, natureza, parâmetros/destino se aplicável, estados, referências de teste ou lacuna explícita | Deve corresponder exatamente a um `page.tsx`; handlers/API não contam como páginas. |
| Evidência | camada, data, ambiente local/controlado/real/remoto, comando ou jornada, resultado passou/falhou/bloqueado/não verificado, interceptações e limites | Referencia achado/requisito/tarefa; nunca contém segredo ou dados pessoais. |
| Save de teste | identidade de conta/arquivo de teste, revisão/checkpoint, conteúdo sintético esperado | Mesmo arquivo entre checkpoint e reabertura; resultados podem usar IDs anonimizados. |

## Transições

- Achado confirmado → correção proposta → executada → verificada → encerrada. Se teste falha/bloqueia, permanece aberto.
- Hipótese de causa F5 → diagnóstico reproduzido → causa demonstrada → reparo mínimo ou nenhuma alteração necessária → prova real. 503 resolvido não apaga a interpretação histórica; log recebe complemento.
- Evidência controlada não muda de categoria após autenticação real: interceptações de saves e picker OPFS continuam declaradas.
- T008 anterior permanece pendente até os seus próprios critérios passarem. Concluir tarefas documentais desta feature não fecha T008.

## Invariantes

Sem migração do conteúdo clínico, transformação de payload, rotação de chaves, novo dado financeiro ou alteração da identidade de arquivos existentes. Não usar conteúdo capturado de grants em relatório de teste. Campos do inventário são mantidos no teste, sem export novo de runtime.
