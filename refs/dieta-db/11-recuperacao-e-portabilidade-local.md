# Decisão 11 — Recuperação e Portabilidade Local

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
- **Data:** 2026-08-30
- **Escopo:** Backup, exportação e restauração dos dados canônicos locais

## 1. Decisão aprovada

A V1 oferecerá exportação e importação manual de um arquivo mestre
`.nutridiet` criptografado. Não haverá pop-ups invasivos, backup automático em
nuvem nem sincronização automática entre dispositivos.

O arquivo é o mecanismo de portabilidade e recuperação quando o navegador for
limpo, o computador for trocado ou o banco local precisar ser restaurado.

## 2. Conteúdo do arquivo mestre

O conteúdo criptografado de uma exportação inclui somente dados canônicos
confirmados da Conta local:

- identificação e configurações da Conta/perfil profissional;
- alimentos customizados, receitas e refeições prontas;
- pacientes, consultas, avaliações e objetivos;
- dietas vigentes e snapshots históricos;
- `schemaVersion`, datas, IDs e metadados necessários à integridade.

`DietDraft` **Em Criação** não integra o arquivo mestre. Ele é temporário,
local ao navegador e não constitui prescrição nem histórico clínico.

## 3. Operações permitidas

### Exportar

1. O nutricionista aciona uma exportação explicitamente.
2. O sistema lê apenas o banco relacional canônico.
3. Gera um arquivo criptografado e autenticado, com versão de schema e dados de
   integridade conforme a Decisão 13.
4. Não envia o conteúdo clínico para a nuvem.

### Importar/restaurar

1. O nutricionista escolhe explicitamente um arquivo `.nutridiet`.
2. O sistema valida o formato e desbloqueia o conteúdo criptografado antes de
   ler dados clínicos.
3. Valida a integridade e a compatibilidade de schema.
4. Executa migrations compatíveis antes da restauração, quando necessário.
5. A restauração substitui o conteúdo canônico da Conta local após confirmação
   explícita; a V1 não faz mesclagem automática de duas bases.
6. Drafts locais existentes são descartados ou preservados somente mediante
   confirmação explícita, pois não pertencem ao backup clínico.

## 4. Limites e feedback

- A interface pode indicar que a base é local e pode ser exportada, sem criar
  alerta recorrente ou bloquear o trabalho clínico.
- Falha de exportação ou importação não pode alterar parcialmente o banco
  canônico.
- Importação inválida não abre nem sobrescreve a Conta local.
- O arquivo não é um canal de comunicação entre profissionais; na V1 existe
  somente uma Conta e um profissional por base.

## 5. O que não faz parte desta decisão

Não há backup automático, armazenamento remoto do arquivo, colaboração,
sincronização, mesclagem de bases nem recuperação de dados apagados sem um
arquivo exportado previamente.
