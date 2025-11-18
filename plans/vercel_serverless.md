# Conversão Express → Vercel Serverless Functions

## Objetivo
Converter todas as rotas Express em `server/routes/` para Vercel Serverless Functions em `api/` para permitir deploy único na Vercel, eliminando a necessidade de servidor Express separado.

## Estrutura Final

```
api/
├── lib/
│   └── auth.ts              # Helper de autenticação para Vercel
├── sales/
│   ├── create.ts           # POST /api/sales/create
│   └── list.ts             # GET /api/sales/list
├── cards/
│   ├── list.ts             # GET /api/cards/list
│   ├── my-card.ts          # GET /api/cards/my-card
│   ├── by-number.ts        # GET /api/cards/by-number
│   ├── create.ts           # POST /api/cards/create
│   ├── associate.ts        # POST /api/cards/associate
│   └── update-balance.ts   # POST /api/cards/update-balance
├── products/
│   ├── list.ts             # GET /api/products/list
│   ├── create.ts           # POST /api/products/create
│   ├── update.ts           # PUT /api/products/update
│   └── delete.ts           # DELETE /api/products/delete
├── orders/
│   ├── open.ts             # GET /api/orders/open
│   └── mark-delivered.ts   # POST /api/orders/mark-delivered
└── trpc/
    └── [trpc].ts           # (já existe, manter)
```

## Implementação

### 1. Criar Helper de Autenticação

**Arquivo:** `api/lib/auth.ts`

- Converter `server/middleware/auth.ts` para função compatível com Vercel
- Substituir `Request, Response, NextFunction` por `VercelRequest`
- Retornar `{ user }` ou `{ error, status }` ao invés de usar `next()`
- Manter mesma lógica de validação JWT e extração de role

**Exemplo:**

```typescript
import type { VercelRequest } from '@vercel/node'
import { supabase } from '../../server/lib/supabase'
import { UserRole } from '../../server/lib/permissions'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
}

export async function authenticateRequest(
  req: VercelRequest
): Promise<{ user: AuthenticatedUser } | { error: string; status: number }> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { error: 'Invalid token', status: 401 }
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      role: (user.user_metadata?.role || 'guest') as UserRole,
    },
  }
}
```

### 2. Converter Rotas de Vendas

**Arquivos:** `api/sales/create.ts` e `api/sales/list.ts`

- Converter `salesRouter.post('/create')` para `export default async function handler(req, res)`
- Substituir `req as AuthRequest` por chamada a `authenticateRequest(req)`
- Manter toda lógica de negócio de `server/routes/sales.ts`
- Adicionar verificação de método HTTP (`req.method !== 'POST'`)
- Converter `res.status().json()` para formato Vercel

**Exemplo de conversão:**

```typescript
// ANTES (Express)
salesRouter.post('/create', authenticate, async (req, res) => {
  const user = (req as AuthRequest).user
  // ... lógica
  res.json({ success: true })
})

// DEPOIS (Vercel)
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await authenticateRequest(req)
  if ('error' in auth) {
    return res.status(auth.status).json({ error: auth.error })
  }
  const user = auth.user

  // ... mesma lógica de negócio
  return res.json({ success: true })
}
```

### 3. Converter Rotas de Cartões

**Arquivos:** `api/cards/*.ts` (6 arquivos)

- `list.ts`: GET /api/cards/list - Listar todos
- `my-card.ts`: GET /api/cards/my-card - Cartão do usuário
- `by-number.ts`: GET /api/cards/by-number - Buscar por número
- `create.ts`: POST /api/cards/create - Criar cartão
- `associate.ts`: POST /api/cards/associate - Associar cartão
- `update-balance.ts`: POST /api/cards/update-balance - Atualizar saldo

Cada arquivo:
- Converter handler Express para função Vercel
- Usar `authenticateRequest()` ao invés de middleware
- Manter schemas Zod e validações
- Preservar lógica de permissões e negócio

### 4. Converter Rotas de Produtos

**Arquivos:** `api/products/*.ts` (4 arquivos)

- `list.ts`: GET /api/products/list
- `create.ts`: POST /api/products/create
- `update.ts`: PUT /api/products/update
- `delete.ts`: DELETE /api/products/delete

Converter seguindo mesmo padrão das outras rotas.

### 5. Converter Rotas de Pedidos

**Arquivos:** `api/orders/*.ts` (2 arquivos)

- `open.ts`: GET /api/orders/open
- `mark-delivered.ts`: POST /api/orders/mark-delivered

### 6. Atualizar Configurações

**Arquivo:** `vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  }
}
```

**Arquivo:** `package.json`

- Verificar se `@vercel/node` está nas dependências (geralmente não precisa, Vercel fornece)
- Manter script `dev:api` para desenvolvimento local (opcional)

### 7. Atualizar Frontend

**Arquivo:** `src/lib/api-client.ts`

- Verificar se `API_URL` está correto para produção
- Em produção, usar caminho relativo (`/api/...`) ao invés de `http://localhost:3001`

**Exemplo:**

```typescript
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001'  // Desenvolvimento: Express local
  : ''                        // Produção: caminho relativo (mesmo domínio)
```

## Padrão de Conversão

Para cada rota Express:

1. **Criar arquivo** em `api/{domain}/{action}.ts`
2. **Importar tipos** `VercelRequest, VercelResponse` de `@vercel/node`
3. **Importar** `authenticateRequest` de `../lib/auth`
4. **Verificar método HTTP** no início do handler
5. **Autenticar** usando `authenticateRequest(req)`
6. **Manter** toda lógica de negócio igual
7. **Retornar** resposta usando `res.json()` ou `res.status().json()`

## Manter

- Toda lógica de negócio das rotas
- Schemas Zod de validação
- Sistema de permissões (`server/lib/permissions.ts`)
- Logs de segurança
- Auditoria via transactions
- Tratamento de erros
- Validações de dados

## Remover/Deprecar

- `server/index.ts` (não será mais usado em produção, mas pode manter para dev local)
- `server/routes/*.ts` (manter temporariamente para referência durante conversão)
- Script `dev:api` pode ser mantido para desenvolvimento local opcional

## Testes

1. **Testar localmente:**
   ```bash
   npm i -g vercel
   vercel dev
   ```

2. **Verificar cada endpoint:**
   - Autenticação funcionando
   - Permissões sendo validadas
   - Validação de dados (Zod)
   - Logs de segurança
   - Respostas corretas

3. **Testar em produção:**
   - Deploy na Vercel
   - Verificar variáveis de ambiente
   - Testar todos os endpoints

## Deploy

- **Um único deploy** na Vercel
- Frontend e API no mesmo projeto
- Variáveis de ambiente configuradas na Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_SERVICE_ROLE_KEY`
- Sem necessidade de servidor separado
- Escala automaticamente

## Checklist de Conversão

### Fase 1: Setup
- [ ] Criar `api/lib/auth.ts` com `authenticateRequest()`
- [ ] Atualizar `vercel.json` com configuração de runtime
- [ ] Atualizar `src/lib/api-client.ts` para produção

### Fase 2: Vendas
- [ ] `api/sales/create.ts` - POST /api/sales/create
- [ ] `api/sales/list.ts` - GET /api/sales/list

### Fase 3: Cartões
- [ ] `api/cards/list.ts` - GET /api/cards/list
- [ ] `api/cards/my-card.ts` - GET /api/cards/my-card
- [ ] `api/cards/by-number.ts` - GET /api/cards/by-number
- [ ] `api/cards/create.ts` - POST /api/cards/create
- [ ] `api/cards/associate.ts` - POST /api/cards/associate
- [ ] `api/cards/update-balance.ts` - POST /api/cards/update-balance

### Fase 4: Produtos
- [ ] `api/products/list.ts` - GET /api/products/list
- [ ] `api/products/create.ts` - POST /api/products/create
- [ ] `api/products/update.ts` - PUT /api/products/update
- [ ] `api/products/delete.ts` - DELETE /api/products/delete

### Fase 5: Pedidos
- [ ] `api/orders/open.ts` - GET /api/orders/open
- [ ] `api/orders/mark-delivered.ts` - POST /api/orders/mark-delivered

### Fase 6: Testes e Deploy
- [ ] Testar todas as rotas localmente com `vercel dev`
- [ ] Verificar autenticação e permissões
- [ ] Deploy na Vercel
- [ ] Testar em produção

## Benefícios

- ✅ **Um único deploy** - Frontend e backend juntos
- ✅ **Sem custo adicional** - Serverless Functions incluídas no plano Vercel
- ✅ **Escala automática** - Vercel gerencia escalonamento
- ✅ **Cold start otimizado** - Vercel otimiza inicialização
- ✅ **Mesma lógica** - Apenas muda o formato, não a lógica de negócio

## Notas Importantes

1. **Desenvolvimento Local:**
   - Pode manter `server/index.ts` para desenvolvimento local
   - Ou usar `vercel dev` para simular ambiente de produção

2. **Variáveis de Ambiente:**
   - Configurar na Vercel Dashboard
   - Usar mesmas variáveis do `.env` local

3. **Compatibilidade:**
   - Código Express pode ser mantido para referência
   - Serverless Functions são compatíveis com mesmo código de negócio

---

**Documento criado em:** 2025-01-XX  
**Versão:** 1.0  
**Status:** Planejado - Aguardando implementação

