# Guia de Configuração do Supabase

Este guia explica como configurar o Supabase para o sistema de cartões do Encontrão 2025.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: `encontrao-card-2025`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: escolha a região mais próxima (ex: South America - São Paulo)
6. Clique em "Create new project"
7. Aguarde a criação do projeto (pode levar alguns minutos)

## 2. Obter Credenciais

1. No dashboard do projeto, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **anon public** key (chave pública)

## 3. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione suas credenciais:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui

# PIX API Configuration (para integração futura)
VITE_PIX_API_URL=
VITE_PIX_API_KEY=
VITE_PIX_MODE=mock

# Development
NODE_ENV=development
```

## 4. Executar Scripts SQL

1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-setup.sql`
4. Clique em "Run" para executar o script
5. Aguarde a execução (pode levar alguns segundos)
6. Repita o processo com o arquivo `supabase-seed.sql` para adicionar dados iniciais

## 5. Verificar Configuração

1. Inicie o projeto:
```bash
npm run dev
```

2. Acesse a aplicação no navegador
3. Faça login com um usuário
4. Vá para a aba "Meu Cartão"
5. Verifique se:
   - O cartão é criado automaticamente
   - O saldo é exibido corretamente
   - Os produtos aparecem nas lojas

## 6. Estrutura do Banco de Dados

O sistema cria as seguintes tabelas:

### `cards`
- Armazena informações dos cartões dos usuários
- Inclui número do telefone para recuperação

### `transactions`
- Histórico de todas as transações (crédito/débito)
- Vinculado aos cartões

### `products`
- Catálogo de produtos da lojinha e lanchonete
- Suporte a estoque e categorização

### `sales` e `sale_items`
- Registro de vendas realizadas
- Itens vendidos com quantidades e preços

### `orders`
- Pedidos da lojinha para entrega
- Status de entrega

### `pix_payments`
- Pagamentos PIX (preparado para API real)
- Status e dados de webhook

## 7. Integração com API PIX Real (Futuro)

Quando quiser integrar com uma API PIX real:

1. Configure as variáveis de ambiente:
```env
VITE_PIX_API_URL=https://sua-api-pix.com
VITE_PIX_API_KEY=sua-chave-api
VITE_PIX_MODE=production
```

2. Implemente os métodos em `src/services/pixService.ts`:
   - `ApiPixProvider.generatePayment()`
   - `ApiPixProvider.checkPaymentStatus()`
   - `ApiPixProvider.cancelPayment()`

3. Configure o webhook em `src/api/webhooks/pix.ts`

4. Atualize as políticas RLS conforme necessário

## 8. Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Confirme se a chave anon está correta
- Verifique se o projeto Supabase está ativo

### Erro: "relation does not exist"
- Execute o script `supabase-setup.sql` novamente
- Verifique se todas as tabelas foram criadas no SQL Editor

### Dados não aparecem
- Execute o script `supabase-seed.sql`
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado

## 9. Backup e Segurança

### Backup
- O Supabase faz backup automático
- Para backup manual, use a ferramenta de exportação

### Segurança
- As políticas RLS estão configuradas para desenvolvimento
- Para produção, refine as políticas conforme necessário
- Configure autenticação adequada para webhooks PIX

## 10. Monitoramento

- Use o dashboard do Supabase para monitorar:
  - Performance das queries
  - Uso de storage
  - Logs de erro
  - Métricas de API

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Consulte a documentação do Supabase
3. Verifique se todas as dependências estão instaladas
