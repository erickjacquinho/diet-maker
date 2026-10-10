# Contrato de páginas e estados

Todas em português, tema claro e desktop >=1024px. Usar DS canônico/Atomic Design. Categorias fields/actions/selection/feedback/data-display/surfaces/structure/navigation antes de perfis; Input, SelectField, Button, Surface, Badge e DataTable existentes. Não editar primitives com regras de domínio ou criar tabela paralela.

| Rota | Conteúdo e destino |
| --- | --- |
| / | Texto Landing page, links Entrar e Criar conta; público sem hidratar workspace/sidebar clínico |
| /login | Login (e-mail), Senha, Entrar; Recuperar senha discreto abaixo; Criar conta; sucesso /saves |
| /criar-conta | Nome, Sobrenome do profissional, E-mail, Confirmação de e-mail, Senha, Confirmação de senha, Média de pacientes por mês, Tempo de atuação como nutricionista; faixa 1–6 meses/6–12 meses/Anos com input numérico condicional |
| /criar-conta?confirmar=1 | Confirmação mínima do link de e-mail, ação Confirmar e-mail e retorno ao login; token só no cookie HttpOnly temporário |
| /criar-conta?completar=1 | Somente identidade/e-mail/sessão verificados com perfil ausente; reutilizar Nome/Sobrenome/perguntas profissionais, Concluir cadastro; sem acesso a saves antes de inserir perfil válido |
| /recuperar-senha | E-mail, Enviar instruções e Voltar ao login; resultado genérico condicional |
| /redefinir-senha | Nova senha, Confirmação de senha, Redefinir; inválido/expirado pede novo link; sucesso /login |
| /saves | Conta verificada, título Seus saves, Criar novo save e Importar existente; DataTable com nome, arquivo lembrado, disponibilidade, Abrir/Localizar novamente e paginação |
| /home atual | Encaminhar para /login ou /saves; não oferecer antiga abertura sem autorização |
| Rotas clínicas existentes | Só com sessão local de save autorizada; manter URLs e UI clínica, locked impede dados em deep links |

Não chamar localização de backup cloud. Display da experiência conserva texto da faixa escolhida; não inferir duração de seis meses nem somar categorias. Registro de conta sem verificação só orienta e-mail; não concede dashboard.

## Estados acessíveis

- Default: labels reais, autocomplete adequado (email/current-password/new-password/given-name/family-name), campos necessários e ajuda de limites/unidade.
- Loading/submitting: impedir dupla operação, aria-busy/status, manter dimensões/foco e campos não secretos em erro.
- Validation: resumo de erro e mensagens associadas por aria-describedby/aria-invalid; foco primeiro erro, não repetir senha em mensagem. Reusar componentes existentes; extensão genérica acessível mínima se API atual não permitir associação.
- Failed request: mensagem persistente com retry e requestId se útil; nunca stack/credencial. Login genérico; recovery/signup genéricos para e-mail válido.
- Dashboard empty/error/checking/available/unavailable: DataTable caption/headers, status textual sem depender de cor; permissão pendente distinta de arquivo removido. Página mostra totalRows e permite chegar a todos os registros.
- Clinical locked: ocultar apresentação de dados, conservar trabalho e indicar validar acesso online. Pending flush fica privado, sem detalhes clínicos no login/dashboard de outra conta.

Tab/Shift+Tab/Enter/Esc conforme primitivas; foco visível canônico, targets/contraste e reduced motion. Conferir 1024/1280/1600px e zoom200%; nenhuma largura mobile ou dark nesta fase. Sem cards aninhados, cores hardcoded, utilitários arbitrários, analytics em callback ou chave apresentada na UI.
