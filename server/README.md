# Server - Express API Modular

Estrutura modular do backend Express para o sistema EJD Card 2025.

## 📁 Estrutura

```
server/
├── index.ts              # Servidor Express principal
├── middleware/
│   └── auth.ts           # Middleware de autenticação JWT
├── routes/
│   └── sales.ts          # Rotas de vendas
└── lib/
    ├── supabase.ts       # Cliente Supabase (service role)
    └── permissions.ts    # Sistema de permissões
```

## 🚀 Como executar

```bash
npm run dev:api
```

A API estará disponível em `http://localhost:3001`

## 🔐 Segurança

- **Autenticação**: JWT via middleware `authenticate`
- **Permissões**: Sistema baseado em roles
- **Validação**: Zod schemas para todos os inputs
- **Auditoria**: Transações registradas na tabela `transactions`

## 📝 Rotas Disponíveis

### Vendas (`/api/sales`)
- `POST /api/sales/create` - Criar venda
- `GET /api/sales/list?category=X` - Listar vendas (opcional: filtrar por categoria)

### Cartões (`/api/cards`)
- `GET /api/cards/list` - Listar todos os cartões (requer `cards:view_all`)
- `GET /api/cards/my-card` - Obter cartão do usuário logado
- `GET /api/cards/by-number?cardNumber=X` - Buscar cartão por número
- `POST /api/cards/create` - Criar novo cartão (requer `cards:create`)
- `POST /api/cards/associate` - Associar cartão ao usuário
- `POST /api/cards/update-balance` - Atualizar saldo (requer `cards:add_balance` ou `cards:debit_balance`)

### Produtos (`/api/products`)
- `GET /api/products/list?category=X` - Listar produtos por categoria
- `POST /api/products/create` - Criar novo produto (requer `products:create_{category}`)
- `PUT /api/products/update` - Atualizar produto (requer `products:update_{category}`)
- `DELETE /api/products/delete` - Deletar produto (soft delete, requer `products:delete_{category}`)

### Pedidos (`/api/orders`)
- `GET /api/orders/open` - Listar pedidos em aberto (requer `orders:view`)
- `POST /api/orders/mark-delivered` - Marcar pedido como entregue (requer `orders:mark_delivered`)

### Health Check
- `GET /health` - Status da API

## 🔄 Próximos Passos

- [ ] Adicionar rotas de transações (`/api/transactions/*`)
- [ ] Implementar paginação nos endpoints de listagem
- [ ] Adicionar filtros e busca avançada

