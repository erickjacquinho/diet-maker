# SettingsDialog

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-settings-dialog` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/SettingsDialog.tsx` |
| Public exports | `SettingsTab`, `SettingsProfileState`, `SettingsDialogProps` (types), `SettingsDialog` (component) |

## Purpose

Reunir em um único modal as configurações do perfil profissional (válido para toda a conta), a importação única de um `.nutridiet` antigo e a informação sobre gestão de assinatura.

## Category inheritance

Herda [overlays](../../categories/overlays.md). Trait autorizado: `async`.

## Specific anatomy

Dialog com título "Configurações", descrição de escopo e `Tabs` com três abas (a de importação só aparece quando `onImportNutridiet` é informado). A altura usa `--cmp-dialog-max-height` e permanece igual ao alternar abas; cabeçalho e navegação ficam fixos, com rolagem no conteúdo da aba:

- **Perfil profissional**: seções Conta e acesso (e-mail de acesso somente leitura e redefinição de senha pelo fluxo existente), Identificação (nome, sobrenome, título, CRN), Atuação (experiência, média de pacientes, modalidade, especialidades, apresentação), Contato e consultório (e-mail de contato, telefone, Instagram, site, consultório, cidade, UF) Lembretes da agenda (ativar ou silenciar avisos sem remover agendamentos) e Documentos (envio/remoção de logotipo PNG e exibição nos PDFs com prévia da assinatura). Rodapé com "Descartar alterações" e "Salvar perfil".
- **Importar dados**: seletor de arquivo `.nutridiet` (até 4 MB), confirmação explícita quando o arquivo não é protegido (formato antigo) e botão "Importar arquivo"; o resultado mostra as contagens ou o erro. A importação vale só para conta vazia e acontece uma vez.
- **Assinatura**: conteúdo informativo indicando disponibilidade futura da gestão de plano, ciclo de cobrança, renovação, pagamento, faturas e cancelamento; sem formulário, estado financeiro, dados de cobrança ou ações de salvar.

## Allowed variants

`defaultTab` escolhe a aba inicial (`profile`, `import` ou `subscription`). Não há variantes visuais próprias.

## Particular states

- perfil carregando, com erro recuperável ("Tentar novamente") ou pronto;
- erros de validação por campo com `aria-invalid`, mensagem associada e foco no primeiro campo inválido;
- salvamento em andamento com `aria-busy` e botão em `loading`; retorno de sucesso em `status` e de falha em `alert`;
- `suspended` pausa o modal, retomando a mesma aba sem empilhar overlays; `busy` e a importação em andamento impedem o fechamento;
- redefinição de senha anuncia envio ou erro e permite repetir; a ação não altera a senha no modal;
- logotipo aceita PNG de até 128 KB e 1024 × 1024 px; erro de leitura preserva o logotipo anterior;
- preferência de lembretes e logotipo são persistidos no perfil cifrado da conta por "Salvar perfil";
- fechar com alterações não salvas abre `ConfirmationAlertDialog` destrutivo antes de descartar.

## Composition

Compõe `ui-dialog`, `ui-tabs`, `ui-input`, `ui-textarea`, `SelectField`, `Checkbox`, `Button` e `ConfirmationAlertDialog`. Validação e normalização vêm de `@/lib/domain/professional-profile`; leitura, gravação e sincronização pertencem ao consumidor via callbacks assíncronos.

## Content rules

Rótulos em português, campos opcionais vazios são gravados como ausentes, Instagram é normalizado para `@usuario`, site recebe `https://` quando omitido e o e-mail de acesso nunca é editável aqui.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`src/app/navigation/SidebarNavigationAdapter.tsx`, acionado pelo item "Configurações" do menu de conta da sidebar.

## Acceptance criteria

- foco, título, Escape e retorno ao gatilho obedecem ao contrato de overlays;
- nenhuma gravação ocorre com campos inválidos;
- alterações não salvas exigem confirmação antes de fechar;
- tokens, tipografia e primitivos permanecem inalterados.

## Implementation status

Implementado em `organism`; substitui o modal vazio de Configurações e está reconciliado no registry.
