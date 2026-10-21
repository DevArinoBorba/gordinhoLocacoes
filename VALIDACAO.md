# Validação da entrega — 01/10/2026 (Atualização: Precificação & Recibos)

- **Build de produção Next.js 16.3.7**: aprovado com Turbopack, gerando todas as rotas (incluindo nova rota `/reservas/[id]/recibo`).
- **`tsc --noEmit`**: aprovado sem erros de tipos.
- **ESLint**: aprovado em `src/`, 0 erros e 0 avisos.
- **Testes unitários**: 9 aprovados, 0 falhas:
  1. Intervalos consecutivos, sobreposição e contenção;
  2. Validação estrita de CPF/CNPJ com dígitos verificadores;
  3. Validação de período com fuso e fim posterior ao início;
  4. Bloqueio de dados incompletos de cliente;
  5. Autenticação HTTP Basic;
  6. Adaptador de WhatsApp desativado em conformidade;
  7. Cálculo de diárias respeitando frações de 24 horas;
  8. Composição financeira completa (diárias, frete, desconto, caução e piso zero);
  9. Validação de esquemas de equipamentos e reservas com precificação.
- **Migrações**:
  - `001_initial.sql`: estrutura base com constraints GiST e outbox.
  - `002_pricing.sql`: colunas de precificação no catálogo (`daily_rate`, `min_days`, `deposit_amount`) e na tabela de reservas (`daily_rate`, `days`, `subtotal_amount`, `freight_amount`, `discount_amount`, `deposit_amount`, `total_amount`, `payment_method`, `payment_status`).
- **Comprovante / Recibo de Locação**: implementado em `/reservas/[id]/recibo`, com estilização dedicada, termo de responsabilidade, assinaturas e botão de impressão otimizado via `@media print`.

## Edição de equipamentos e unidades
- Build e TypeScript aprovados; ESLint em src aprovado; nove testes unitários aprovados.
- Teste das ações autenticadas via HTTP: edição salva no PostgreSQL, diária negativa rejeitada e código duplicado rejeitado.
- Dados temporariamente alterados no teste foram restaurados. Reservas não foram criadas ou removidas.
- Aplicativo reiniciado com o novo build. Verificação visual no navegador integrado continua limitada pela recusa de abertura já registrada.


## Vitrine, Brasília e fotos — 01/10/2026
11 testes unitários e 2 testes PostgreSQL passaram, incluindo concorrência pública com duas unidades e três pedidos, preços e mínimo de diárias confiáveis, idempotência e preservação de cadastro. ESLint em src/tests e build de produção passaram. Upload testado pelo formulário autenticado: imagem convertida em WebP e servida publicamente; arquivo inválido rejeitado; reservas existentes preservadas. Seletores de fuso removidos e páginas usam Brasília. Navegador confirmou catálogo com 12 equipamentos, consulta de período disponível e formulário de dados do cliente. A foto temporária do teste foi removida e o cadastro original restaurado. Nova versão local está ativa.

Calendário mensal por equipamento e vitrine detalhada: ESLint e build passaram; 11 testes unitários e 2 de integração passaram. Verificação HTTP confirmou outubro com 31 dias, fevereiro de 2028 com 29 dias, troca de equipamentos, links de horário mantendo o equipamento selecionado e campos de uso/acessórios. Edição autenticada foi verificada novamente com restauração dos dados e preservação das reservas. Página pública conferida visualmente; sem erros no console.

Identidade pública e retirada hoje: ESLint e build passaram, além de 12 testes unitários e 2 testes de integração. Navegador confirmou o exemplo de retirada hoje às 8h até 8/10 às 19h: início ajustado para o próximo horário, aviso mostrado, disponibilidade e formulário do cliente exibidos. Console sem erros. Mascote público retorna 200; painel sem autenticação retorna 401. Identidade visual aplicada apenas à vitrine, com fontes locais e mascote autorizado do site fornecido.

Atendimento WhatsApp e recibos: 15 testes unitários e 2 PostgreSQL passaram; ESLint e build passaram. Formulário público foi enviado por HTTP com dados temporários em equipamento de teste: pedido salvo antes do redirecionamento, tela de sucesso com botão e referência, caso da última unidade disponível coberto, consentimento verdadeiro/falso respeitado no painel. PDF autenticado gerado com cabeçalho válido. Dados temporários removidos ao final, sem mensagens externas. A versão está ativa localmente.
