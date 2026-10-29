# Contrato de páginas e estados

> Destinos/gestão atualizados em 2026-10-25 conforme a navegação de 20/23-10: Início em `/dashboard` e gestão em Configurações → Saves. Logs da entrega original continuam históricos.

Todas em português, tema claro e desktop >=1024px. Usar DS canônico/Atomic Design. Categorias fields/actions/selection/feedback/data-display/surfaces/structure/navigation antes de perfis; Input, SelectField, Button, Surface, Badge e DataTable existentes. Não editar primitives com regras de domínio ou criar tabela paralela.

| Rota | Conteúdo e destino |
| --- | --- |
| / | Texto Landing page, links Entrar e Criar conta; público sem hidratar workspace/sidebar clínico |
| /login | Login (e-mail), Senha, Entrar; Recuperar senha discreto abaixo; Criar conta; sucesso /dashboard |
| /criar-conta | Nome, Sobrenome do profissional, E-mail, Confirmação de e-mail, Senha, Confirmação de senha, Média de pacientes por mês, Tempo de atuação como nutricionista; faixa 1–6 meses/6–12 meses/Anos com input numérico condicional |
| /criar-conta?confirmar=1 | Confirmação mínima do link de e-mail, ação Confirmar e-mail e retorno ao login; token só no cookie HttpOnly temporário |
| /criar-conta?completar=1 | Somente identidade/e-mail/sessão verificados com perfil ausente; reutilizar Nome/Sobrenome/perguntas profissionais, Concluir cadastro; sem acesso a saves antes de inserir perfil válido |
| /recuperar-senha | E-mail, Enviar instruções e Voltar ao login; resultado genérico condicional |
| /redefinir-senha | Nova senha, Confirmação de senha, Redefinir; inválido/expirado pede novo link; sucesso /login |
| /dashboard | Conta verificada; Início com rotina semanal e próximas ações; sem arquivo oferece Configurações → Saves. Assinatura é informativa. |
| Configurações → Saves | Criar/importar/abrir/localizar arquivo e backup; catálogo e estados de disponibilidade no modal existente. |
| /saves | Alias de /dashboard, preservando parâmetros; acesso à gestão pelo modal. |
| /home | Alias de /dashboard, preservando parâmetros; guardas encaminham não autenticado ao login e perfil incompleto à conclusão. |
| Rotas clínicas existentes | Só com sessão local de save autorizada; manter URLs e UI clínica, locked impede dados em deep links |

Não chamar localização de backup cloud. Display da experiência conserva texto da faixa escolhida; não inferir duração de seis meses nem somar categorias. Registro de conta sem verificação só orienta e-mail; não concede dashboard.

## Estados acessíveis

- Default: labels reais, autocomplete adequado (email/current-password/new-password/given-name/family-name), campos necessários e ajuda de limites/unidade.
- Loading/submitting: impedir dupla operação, aria-busy/status, manter dimensões/foco e campos não secretos em erro.
- Validation: resumo de erro e mensagens associadas por aria-describedby/aria-invalid; foco primeiro erro, não repetir senha em mensagem. Reusar componentes existentes; extensão genérica acessível mínima se API atual não permitir associação.
- Failed request: mensagem persistente com retry e requestId se útil; nunca stack/credencial. Login genérico; recovery/signup genéricos para e-mail válido.
- Gestão em Configurações → Saves: empty/error/checking/available/unavailable, DataTable caption/headers, status textual sem depender de cor; permissão pendente distinta de arquivo removido. Catálogo mostra totalRows e permite chegar a todos os registros. Início diferencia sem arquivo, carregamento, erro, semana vazia e ausência de próximas ações.
- Clinical locked: ocultar apresentação de dados, conservar trabalho e indicar validar acesso online. Pending flush fica privado, sem detalhes clínicos no login/dashboard de outra conta.

Tab/Shift+Tab/Enter/Esc conforme primitivas; foco visível canônico, targets/contraste e reduced motion. Conferir 1024/1280/1600px e zoom200%; nenhuma largura mobile ou dark nesta fase. Sem cards aninhados, cores hardcoded, utilitários arbitrários, analytics em callback ou chave apresentada na UI.
