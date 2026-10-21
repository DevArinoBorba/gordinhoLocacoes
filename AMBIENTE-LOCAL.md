# Ambiente iniciado em 01/10/2026

Aplicativo de produção em http://127.0.0.1:3000, restrito a localhost. Acesso exige ADMIN_USER/ADMIN_PASSWORD existentes no `.env`; credenciais não foram alteradas nem copiadas para a documentação.

Não foi localizado um PostgreSQL ativo nem uma instalação convencional nas pastas usuais. A DATABASE_URL apontava para localhost:5432/locacoes e retornava ECONNREFUSED. Foi criado um banco local NOVO, com dados persistidos em `.local/postgres-data`, usando PostgreSQL 17.10 e as credenciais existentes em DATABASE_URL. Não houve importação de um banco anterior do Gemini; se ele existir em outro lugar, precisa ser localizado e reconciliado separadamente.

Aplicadas as migrações 001 e 002, sem editar o código de precificação/recibos do Gemini. Cadastrados 12 equipamentos de referência dos prints, com 24 unidades fictícias, diárias/cauções provisórias e identificação DEMO/FICTICIO. Nenhum cliente ou reserva foi criado: o banco local começou vazio.

## Iniciar novamente

Abra `INICIAR.cmd` na raiz do projeto, ou execute `node scripts/start-local.mjs`. Ele inicia o PostgreSQL persistido, verifica migrações e serve o build standalone. Não refaz o build; após alterações de código, execute o build antes de usar a versão de produção. Não carrega novamente o catálogo automaticamente.

O executável PostgreSQL usado está em `C:/Users/arino/Documents/Codex/2026-10-01/referenced-chatgpt-conversation-this-is-an/work/pg-bin/bin`. Essa pasta precisa ser preservada ou o caminho em `scripts/start-local-db.mjs` deve ser ajustado para uma instalação PostgreSQL 17. A pasta `.local` está no `.gitignore` e não deve ser enviada ao repositório, ao OneDrive público ou usada como banco de produção.

O catálogo pode ser reaplicado com `node scripts/demo/cadastrar-demo.mjs --apply`; registros existentes são preservados. O script salva snapshot de inventário anterior ao commit. Não execute esse seed contra produção sem confirmar a finalidade dos dados de demonstração.

## Verificação desta inicialização

- `/api/health`, catálogo, calendário, reservas e consulta de disponibilidade: HTTP 200 com autenticação.
- Acesso sem credenciais: HTTP 401.
- Banco: 12 equipamentos, 24 unidades, 0 reservas.
- Navegador integrado recusou a abertura com ERR_BLOCKED_BY_CLIENT; a abertura visual ainda precisa ser feita no navegador do usuário. A verificação HTTP autenticada passou.
- Testes/build do Gemini não foram reexecutados nesta inicialização; foi usado o build existente.

O painel possui edição de equipamento (nome, categoria, descrição, diária, mínimo e caução) e unidade (código e série). Valores de reservas já criadas permanecem preservados.

O site do cliente está em http://127.0.0.1:3000/loja, com acesso sem senha. O painel administrativo continua na página inicial, com senha. Todos os horários seguem Brasília. Use Adicionar / trocar foto em cada equipamento. A pasta .local/uploads precisa ser preservada juntamente com o banco.
