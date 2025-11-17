# POC - Backend Seguro com tRPC + Vercel Functions

## 🎯 Objetivo
Demonstrar implementação de camada de segurança usando:
- **tRPC**: Type-safe API
- **Vercel Functions**: Serverless backend
- **Zod**: Validação de dados
- **TanStack Query**: Cliente React

## 📦 O que será criado:

1. **Backend tRPC** (`/api/trpc/[trpc].ts`)
   - Handler Vercel serverless
   - Validação de auth
   - Validação de permissões
   
2. **Router de Vendas** (`src/server/routers/sales.ts`)
   - Criar venda com validação completa
   - Verificar saldo
   - Transação atômica

3. **Cliente tRPC** (`src/lib/trpc.ts`)
   - Type-safe end-to-end
   - Integrado com TanStack Query

4. **Hook de exemplo** (`src/hooks/useSalesSecure.ts`)
   - Substitui a API insegura atual

## 🚀 Como testar:

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Testar endpoint
curl -X POST http://localhost:5173/api/trpc/sales.create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"cardNumber": "123", "category": "lojinha", "items": [...]}'
```

## ✅ Benefícios demonstrados:

- ✅ Type-safety completo (erros de tipo aparecem no frontend)
- ✅ Validação automática de dados (Zod)
- ✅ Verificação de permissões no backend
- ✅ Preços buscados do banco (não confia no frontend)
- ✅ Transação atômica SQL
- ✅ Auditoria de operações

## 📝 Próximos passos após POC:

1. Migrar outras operações (cards, products, orders)
2. Adicionar middleware de rate limiting
3. Implementar cache
4. Deploy na Vercel

