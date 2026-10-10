# Contrato do save e da sessão local

Referência de formato: [data-model.md](../data-model.md). Externo protegido v2; payload clínico existente v1/schema11. Este contrato não muda o schema clínico.

## Dupla verificação

1. Backend autentica conta e sessão, encontra save pertencente à conta e valida bindingProof emitida para owner/save/Conta clínica/keyId.
2. Somente então libera material da DEK; browser importa CryptoKey em memória e autentica AES-GCM/AAD do arquivo.
3. Browser valida/migra o payload e compara Conta clínica com grant, antes de tocar workspace.

Prova pública não é segredo, nem fator independente. Copiá-la não autoriza outra conta. Backend verifica vínculo, não integridade do conteúdo clínico que não recebe. Backend nunca aceita “decifrou=true” como autoridade.

## Create / import / open

- Destino novo selecionado com ação do usuário. Registro tem idempotencyKey estável por tentativa lógica; persistir somente seus identificadores não secretos junto da associação local permite retomar após interrupção sem trocar DEK.
- Inicialização só termina após escrita inicial completa e leitura/validação da cópia cifrada. Registro sem arquivo local acessível aparece recuperável/desincronizado, sem falso sucesso e sem cópia de progresso no servidor.
- Abertura, relink para abrir e restore do menu precisam autorização online nova. Handle lembrado não permite auto-restore clínico na inicialização.
- Export do menu gera somente arquivo cifrado usando grant vigente e mesma identidade/chave; não registrar como save de outro dono nem gerar plaintext. Se exportar para outro destino, arquivo é cópia do mesmo save; localização principal só muda por ação explícita.
- Import protected não muda dono; legacy válido passa por adoção explícita antes de restaurar. Cancelamento/arquivo inválido não altera runtime/base vigente.
- Migração de legado usa migradores existentes em memória; destino NÃO pode ser o mesmo FileSystemFileHandle do original. Comparar identidade, não basename. SHA-256 do original igual antes/depois.

## Checkpoints e arquivos

Snapshot do workspace segue mecanismo atual de revisão. Cifrar localmente, IV novo, write e close bem-sucedidos; só então confirmar revisão no arquivo. Falha de write aborta stream, não close em finally; falha de close mantém revisão não confirmada e workspace/draft para retry. Não truncar/sobrescrever cópia anterior por erro. Retry confirma somente revisão realmente escrita, sem perder edição surgida durante a escrita.

Arquivo legível local e vínculo válido são condições diferentes. Cabeçalho de outro save/algoritmo/versão, nonce/tag/ciphertext/AAD alterados ou Conta clínica incompatível falham antes de restauração. Nenhum retorno parcial revela payload clínico em mensagem de erro.

## Localização

Handles por origem e tuple owner/save. Sincronizado significa permission=granted + arquivo lido + cabeçalho identificado como save esperado; não afirma conteúdo em nuvem nem checkpoint atual. Checking/loading enquanto inspeção não termina. Desincronizado tem motivo: sem referência, permissão necessária, arquivo ausente, substituído/incompatível ou navegador sem suporte. Concessão depende de gesto do usuário.

Não enviar diretório ou caminho absoluto ao servidor. Nome de arquivo igual não aceita relink automático. Handle de outra conta não é reutilizado. Limpar storage/mudar domínio/perfil/dispositivo requer nova seleção.

## Offline, bloqueio e conservação

Grant de no máximo 8h desde a autorização online; clock monotônico e verificação ao retomar aba/operar, não só timer. Não ampliar prazo por retorno de rede/refresh. Save já aberto cifra/escreve offline; novo login/criação/abertura/restore/reload precisam rede.

Logout/prazo: gate bloqueia dados/operações novas imediatamente; flush conserva edição atual e drafts antes de desmontar; escritas já aceitas podem terminar conservação. Depois remove key/runtime acessível. Se flush falha, manter estado privado pendente para retry do mesmo tuple sem mostrar a outra conta; nunca apagar base para simular saída. Aplicações capturadas/getters devem consultar grant vigente, não apenas componente shell.

Logout remoto falho deixa flag local sem tokens/chaves para revogar antes de novo acesso online. Sessão já aberta em outro dispositivo offline reconhece revogação quando possível ou no deadline. Política de aplicativo não impede dono do dispositivo de alterar JS/guardar conteúdo já visto. PGlite/drafts atuais continuam armazenamento local sem cifra em repouso.
