# Gordinho Locações

MVP administrativo de locação com Next.js App Router, TypeScript e PostgreSQL próprio. A pasta original cadastrada no Codex estava vazia na inspeção de 01/10/2026; nenhum arquivo existente foi removido. O catálogo começa vazio, pois o cliente ainda precisa confirmar o maquinário.

## O que foi criado

- Catálogo com edição de nome, categoria, descrição, diária base, mínimo de diárias e caução; edição de código patrimonial e série das unidades; unidades físicas com código patrimonial único, série e situação (operacional/manutenção/retirada).
- Agenda de 14 dias por unidade e consulta de disponibilidade por data/hora exata.
- Reserva de uma unidade por operação; cálculo automático de diárias por fração de 24h, subtotal, frete, desconto, caução e valor total; forma e status de pagamento; dados cadastrais com CPF/CNPJ validado, telefone/WhatsApp, endereço e observações.
- Emissão e impressão de comprovante/recibo pronto para PDF em `/reservas/[id]/recibo`, com termo de responsabilidade e assinaturas.
- Painel com cliente, período, status, filtros, valores em destaque e histórico de alterações no banco.
- Acesso administrativo HTTP Basic: todas as telas e ações exigem credenciais; a configuração ausente falha fechada. Use HTTPS no proxy do Coolify. Para múltiplos funcionários, evoluir para contas individuais e sessões antes de liberar acesso amplo.
- Outbox transacional e contrato de adaptador WhatsApp. Eventos ficam `disabled`; nenhum serviço externo é chamado e nenhuma mensagem é marcada como enviada.
- Marca isolada em `src/config/brand.ts` e variáveis de ambiente. Clone com banco próprio e novas configurações; não é uma aplicação multiempresa no mesmo banco.

## Disponibilidade real

`no_unit_overlap` usa uma exclusion constraint GiST no PostgreSQL com `btree_gist`: mesma unidade não pode ter intervalos sobrepostos `[início,fim)`. A regra atua mesmo com duas requisições simultâneas e em escritas diretas no banco. Pendentes, confirmadas, ativas e concluídas bloqueiam seu período; canceladas liberam. Retirada/devolução não altera as datas planejadas. Locação atrasada ainda exige ajuste operacional; implementar extensão de período/reprogramação antes de usar em situações de atraso.

Criação roda em transação, bloqueia a unidade, valida sua situação, grava cliente/reserva/histórico/outbox juntos e desfaz tudo em conflito. Uma chave UUID de idempotência impede duplicação no reenvio da mesma solicitação. Novas solicitações ainda passam pela regra de conflito. Períodos consecutivos são aceitos. Bloquear manutenção pela interface exige não haver reserva futura ou locação ativa.

Fluxo: pendente → confirmada → em locação → concluída. Pendente/confirmada → cancelada. Reservas encerradas não reabrem. Clientes são reutilizados por documento; novos dados atualizam o cadastro compartilhado, sem snapshot histórico por reserva neste MVP.

## Executar

Requisitos: Node.js 22, pnpm 11 e PostgreSQL 17 (com permissão para `CREATE EXTENSION btree_gist`).

```sh
cp .env.example .env
# Edite DATABASE_URL e credenciais administrativas.
pnpm install --frozen-lockfile
node --env-file=.env --import tsx scripts/migrate.ts
pnpm dev
```

Abra http://localhost:3000. O navegador solicita usuário/senha. Senha administrativa exige ao menos 16 caracteres. `next dev` carrega `.env`; o script de migração exige exportar DATABASE_URL ou usar `--env-file` como acima. A migração é versionada e usa lock para evitar aplicação simultânea. Não há seed fictício automático.

## Variáveis

| Variável | Uso |
|---|---|
| DATABASE_URL | Conexão PostgreSQL; encode caracteres especiais na senha da URL |
| ADMIN_USER / ADMIN_PASSWORD | Credenciais HTTP Basic; senha longa, única, ≥16 caracteres |
| BRAND_NAME / BRAND_TAGLINE / BRAND_PRIMARY | Nome, frase e cor hexadecimal da marca |
| BUSINESS_TIMEZONE | Fuso IANA para exibição, padrão America/Cuiaba |
| WHATSAPP_PROVIDER | `disabled`; nenhum provedor real implementado |
| TEST_DATABASE_URL | Banco descartável para teste real de concorrência |
| POSTGRES_PASSWORD | Somente Compose: senha do serviço PostgreSQL |

Datas são armazenadas como `timestamptz`; formulários exigem offset explícito (padrão UTC−04). Ao clonar para outro fuso, ajuste a seleção de offsets nas páginas nova reserva/calendário. Não depende do fuso do servidor. `APP_URL` foi reservado no exemplo para futura integração/callback; não é consumido pelo MVP.

## Testes e verificação

```sh
pnpm test
pnpm lint
pnpm typecheck
pnpm build
# Banco DESCARTÁVEL com PostgreSQL; nunca a URL de produção:
TEST_DATABASE_URL=postgresql://... pnpm test:integration
```

O teste de integração cria um schema aleatório, testa concorrência, intervalos adjacentes, idempotência, cancelamento, manutenção e transições, e remove apenas esse schema. Sem TEST_DATABASE_URL ele é explicitamente ignorado. Consulte `VALIDACAO.md` para o resultado desta entrega.

## VPS / Coolify

Dockerfile gera saída standalone e roda como usuário sem privilégios. Compose mantém PostgreSQL em volume persistente sem porta pública, aplica migrações antes de subir o app e publica o app somente em localhost. Defina POSTGRES_PASSWORD e DATABASE_URL usando host `postgres` e a mesma senha. Depois execute `docker compose up -d --build`.

No Coolify, use o repositório/Dockerfile ou Compose; conecte a rede do proxy, configure domínio/HTTPS, variáveis e healthcheck `/api/health` (503 se banco/migração indisponível). Marca é carregada no servidor, sem segredos no cliente. Migrações não são executadas durante build. Para deploy por Dockerfile sem Compose, execute a migração em job de release com a imagem de dependencies e arquivos db/scripts, antes de liberar tráfego.

Prepare backup diário de `pg_dump` enviado para armazenamento externo, retenção de 30 dias e cópias semanais; teste restauração em banco separado. Backup e armazenamento externo não foram provisionados. Não exponha a porta do banco. Faça backup antes de novas migrações.

## Próximos passos
 
1. Confirmar lista de máquinas/unidades reais para carga inicial do inventário.
2. Adicionar edição e reprogramação de datas de reservas existentes e bloqueios de manutenção por período.
3. Modernização e polimento da interface visual (UI/UX refinada, tipografia Inter, dashboards visuais).
4. Evoluir autenticação para tela de login com usuários individuais, senhas com hash e permissões (sessão/cookies em vez de HTTP Basic).
5. Após contratação e autorização de provedor, implementar o worker do outbox para envio real via WhatsApp.

Referências de implementação: [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) e [PostgreSQL ranges/exclusion constraints](https://www.postgresql.org/docs/17/rangetypes.html).

## Vitrine e fotos
A vitrine pública fica em /loja. O cliente consulta datas em horário de Brasília, vê diária/caução e solicita reserva pendente; a unidade física é escolhida automaticamente. Os preços são calculados no servidor, incluindo o mínimo de diárias. A equipe confirma pelo painel. Reservas pendentes bloqueiam disponibilidade até confirmação ou cancelamento manual.
No catálogo administrativo, use Adicionar equipamento, Editar equipamento e Adicionar / trocar foto. É aceita uma foto JPG/PNG/WebP de até 5 MB por equipamento, convertida em WebP de até 1200 pixels. Sem foto, aparece uma ilustração. As fotos ficam fora do banco, na pasta UPLOADS_DIR (padrão local .local/uploads); o banco guarda o nome. Substituições preservam o arquivo anterior para evitar apagar fotos em uso.
Novas migrações: 003_public_store.sql e 004_equipment_photos.sql. Pedidos públicos guardam os dados enviados separadamente para preservar cadastros existentes. O painel continua protegido por autenticação. O formulário usa assinatura com validade de duas horas, campo antispam, limite de tentativas e limite de solicitações por documento. PUBLIC_FORM_SECRET é opcional localmente (usa ADMIN_PASSWORD como alternativa); configure uma chave própria em produção.
Para Coolify: volume persistente gravável em /app/uploads, backups dos arquivos e do PostgreSQL fora da VPS, HTTPS, proxy confiável que sobrescreva x-forwarded-for e encaminhe corretamente o host. A limitação por IP depende desse proxy. Não habilite divulgação ampla antes desses ajustes. Nenhum WhatsApp real ou serviço pago foi integrado. O futuro worker deverá usar os dados e consentimento do customer_snapshot nos pedidos públicos.
Próximos passos: cadastrar fotos e preços reais; testar reserva, confirmação, retirada, devolução e recibo; revisar política de privacidade, expiração de pendências e proteção contra abuso; preparar VPS/Coolify com backups e, depois, configurar WhatsApp.

## Catálogo detalhado e calendário mensal
A vitrine apresenta filtros de categoria, fotos maiores e páginas com Ideal para e O que acompanha, editáveis no painel. Migração 005_product_details.sql mantém os cadastros existentes e acrescenta esses campos vazios. Preencha com informações reais.
Em Disponibilidade, escolha um equipamento e o mês. A escolha atualiza o calendário automaticamente. Cada dia informa quantas unidades operacionais não têm nenhuma reserva naquele dia. Dias com reservas podem ter horários livres: Ver horários consulta o intervalo exato mantendo o equipamento selecionado. Retirada às 9h e devolução às 18h são sugestões editáveis, não regras da loja.

## Identidade da marca na vitrine
A página pública foi adaptada ao catálogo Gordinho Personalizados fornecido pelo proprietário: verde floresta #0f3822, amarelo ouro #fab818, superfícies #13442a, mascote, Outfit e Plus Jakarta Sans. As fontes são locais, com licenças em src/assets/fonts. Mascote em public/brand. Cores e mascote da vitrine ficam em src/config/store-brand.ts e variáveis STOREFRONT_*; o painel administrativo mantém seu tema. A apresentação utiliza conteúdo de locações e não reproduz ofertas comerciais de personalização.

## Retirada no mesmo dia
Na vitrine, o período inicial sugere hoje, com devolução às 19h e retirada às 8h ou no próximo intervalo de 15 minutos, se 8h já passou. Ao consultar uma retirada passada no dia atual, a página sugere o próximo horário e mostra aviso antes do envio. Datas anteriores permanecem inválidas; o fim precisa ser posterior à retirada. 8h–19h é apenas uma sugestão provisória, não uma regra de funcionamento confirmada.

## Atendimento e recibos pelo WhatsApp
Depois do pedido público salvo, uma página de sucesso protegida por assinatura válida por duas horas mostra a referência e o botão Avisar a loja pelo WhatsApp. Ela continua disponível mesmo após ocupar a última unidade. Não apresenta CPF, endereço ou telefone do cliente.
No painel, Falar com o cliente pelo WhatsApp usa mensagem pronta; Ligar para o cliente usa o telefone. O atalho de WhatsApp respeita o consentimento informado no pedido. WHATSAPP_STORE_PHONE define o número da loja (padrão do anúncio fornecido: 5547992599063). As mensagens incluem referência, equipamento e período em Brasília. Os links seguem o recurso oficial clique para conversa: https://faq.whatsapp.com/5913398998672934/?locale=pt_BR .
Recibos: impressão mantida; Baixar recibo PDF gera o arquivo pela rota administrativa autenticada /api/reservas/[id]/recibo. Enviar recibo pelo WhatsApp abre uma mensagem pronta: o funcionário baixa e anexa o PDF manualmente. O PDF informa pagamento pendente quando aplicável, sem apresentar quitação inexistente. Nenhuma mensagem automática foi enviada; o worker com provedor real continua como próxima integração.
