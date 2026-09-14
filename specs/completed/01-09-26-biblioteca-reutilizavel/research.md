# Research: Biblioteca reutilizável por Conta

**Date**: 2026-09-01
**Scope**: decisões de domínio, persistência, integração e validação da etapa 4

## Decision 1 — Manter o motor local aprovado

**Decision**: Reutilizar PGlite + Drizzle no banco local canônico e IndexedDB
somente para `DietDraft`.

**Rationale**: A etapa 1 aprovou o motor para persistência relacional,
transações, migrations, isolamento e exclusividade de aba. As etapas 2–3 já
usam o mesmo runtime; trocar o adaptador aumentaria risco e quebraria a
fronteira existente.

**Alternatives considered**:

- Guardar a biblioteca em JSON/`localStorage`: rejeitado por não oferecer as
  constraints, transações e escopo exigidos.
- Persistir a biblioteca no draft: rejeitado porque biblioteca é dado da Conta,
  não edição local de uma dieta.

## Decision 2 — TACO permanece dataset estático

**Decision**: Não criar linhas de Conta para a TACO. O adaptador existente
continua fornecendo busca e snapshots de alimentos do sistema; somente
alimentos customizados serão persistidos como dados da Conta.

**Rationale**: Evita duplicação, mantém uma origem de manutenção do dataset e
preserva a distinção entre fonte do sistema e fonte proprietária do consultório.

**Alternatives considered**:

- Copiar toda a TACO para cada Conta: rejeitado por duplicação e por permitir
  divergência entre bases.
- Continuar misturando customizados no `tacoStore`: rejeitado porque mantém
  escrita legada e impede o cutover canônico.

## Decision 3 — Agregados relacionais com snapshot por uso

**Decision**: Criar tabelas separadas para alimentos customizados, receitas,
ingredientes, refeições prontas e itens de refeições prontas. Cada relação de
origem usada por receita, refeição pronta, draft ou dieta guarda sua versão e
snapshot nutricional/composicional.

**Rationale**: A separação preserva os limites de domínio: receita não é
refeição pronta, template não é refeição de paciente e snapshot clínico não
depende de leitura viva. A estrutura permite listar, versionar, arquivar e
validar dependências sem composição recursiva.

**Alternatives considered**:

- Um JSON único por Conta: rejeitado por consultas, constraints e falhas
  parciais menos controláveis.
- Reutilizar tabelas de `diet_*`: rejeitado por misturar catálogo vivo com
  prescrição clínica congelada.

## Decision 4 — Versionamento lógico no agregado

**Decision**: Edição explícita incrementa `version`, atualiza `updatedAt` e
substitui o conteúdo ativo do agregado. Não será criado histórico de cada
versão do catálogo nesta etapa; snapshots de usos anteriores preservam a
versão que foi consumida.

**Rationale**: Atende conflito otimista e a regra de usos futuros sem ampliar a
etapa para auditoria completa de versões. O snapshot já é a unidade de
reprodução necessária para drafts e dietas confirmadas.

**Alternatives considered**:

- Tabela de revisão imutável para cada edição: rejeitada como escopo adicional
  não exigido pela Decisão 08.
- Mutação sem versão: rejeitada porque permitiria sobrescrita silenciosa em
  edições concorrentes.

## Decision 5 — Exclusão dependente de uso

**Decision**: Permitir exclusão física somente quando não houver dependências;
caso contrário, arquivar. Itens arquivados ficam fora das novas seleções, mas
permanecem consultáveis para dependências e snapshots.

**Rationale**: Preserva a origem clínica e evita apagar referências necessárias
para renderizar receitas, refeições prontas ou dietas salvas.

## Decision 6 — Inserção no draft, confirmação posterior

**Decision**: Selecionar uma receita ou refeição pronta lê a biblioteca,
materializa novos IDs e snapshots no `DietDraft` e não escreve em `DietPlan`.
Somente o salvamento explícito da dieta grava o snapshot clínico final.

**Rationale**: Mantém o contrato validado na etapa 3: seleção/edição é local,
confirmação clínica é transacional e explícita.

## Decision 7 — Cutover sem migração

**Decision**: Remover consumidores dos stores `localStorage` de alimentos
customizados, receitas e refeições prontas. Não ler, converter, importar ou
fazer fallback desses dados.

**Rationale**: A decisão do usuário classifica os dados legados como teste e
proíbe migrador e dual-write. A aplicação deve iniciar a nova biblioteca vazia
quando não houver registros canônicos.

## Decision 8 — Validação proporcional

**Decision**: Usar testes de domínio, aplicação, integração de banco,
arquitetura, componentes e uma jornada Chromium. Medir busca abaixo de 100 ms
após inicialização na fixture representativa, sem declarar certificação
multi-browser ou backup.

**Rationale**: Reproduz a estratégia das etapas anteriores e cobre os riscos
essenciais da etapa 4 sem criar uma certificação de volume fora do pedido.

## Resolved unknowns

Não há decisões de escopo, segurança, privacidade, formato ou integração
pendentes para o plano. A ausência de migração, a abordagem relacional, o
comportamento de arquivamento e a integração via draft foram confirmados pelo
usuário ou fixados nas decisões 06–08 e 14.
