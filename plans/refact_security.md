# Plano de Refatoração de Segurança
## Sistema EJD Card 2025

---

## 📋 Índice
1. [Análise do Problema Atual](#1-análise-do-problema-atual)
2. [Arquitetura Proposta](#2-arquitetura-proposta)
3. [Camada de Segurança (Edge Functions)](#3-camada-de-segurança-edge-functions)
4. [Mapeamento de Operações](#4-mapeamento-de-operações)
5. [Estrutura de Arquivos](#5-estrutura-de-arquivos)
6. [Implementação Detalhada](#6-implementação-detalhada)
7. [Plano de Migração](#7-plano-de-migração)
8. [Testes de Segurança](#8-testes-de-segurança)

---

## 1. Análise do Problema Atual

### 🚨 Vulnerabilidades Críticas

#### 1.1 Frontend com Acesso Direto ao Banco
**Problema:** O frontend usa `supabase.from()` diretamente, permitindo qualquer operação SQL.

**Riscos:**
- ✅ Usuários podem executar queries arbitrárias via DevTools
- ✅ Qualquer pessoa pode ver/modificar dados de outros usuários
- ✅ Não há validação de permissões no backend
- ✅ Saldo pode ser manipulado diretamente
- ✅ Vendas podem ser criadas sem débito real

**Exemplo de Exploração:**
```javascript
// Qualquer usuário pode executar no console do browser:
await supabase.from('cards').update({ balance: 999999 }).eq('id', 'qualquer-id')
await supabase.from('transactions').delete().gt('amount', 0)
```

#### 1.2 RLS Ineficaz (USING true)
**Problema:** Políticas RLS configuradas como `USING (true)` não fazem nada.

**Código Atual:**
```sql
CREATE POLICY "Users can update their own cards" ON cards
    FOR UPDATE USING (true);  -- ❌ Permite TUDO!
```

#### 1.3 Sem Auditoria
**Problema:** Não há registro de quem fez o quê.

**Riscos:**
- Impossível rastrear fraudes
- Sem histórico de modificações
- Sem responsabilização

---

## 2. Arquitetura Proposta

### 2.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  - Apenas chamadas HTTP para Edge Functions                 │
│  - SEM acesso direto ao Supabase                            │
│  - Token JWT no header                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS POST/GET com JWT
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Deno)                  │
│  ┌──────────────────────────────────────────────────┐       │
│  │ 1. Validar JWT (auth.getUser())                  │       │
│  │ 2. Extrair role do usuário                       │       │
│  │ 3. Verificar permissões (lib/permissions.ts)     │       │
│  │ 4. Validar dados (zod schemas)                   │       │
│  │ 5. Executar operação no banco                    │       │
│  │ 6. Registrar auditoria                           │       │
│  │ 7. Retornar resultado                            │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Direct DB Access (privilegiado)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE                           │
│  - RLS DESABILITADO (sem políticas)                         │
│  - Acesso apenas via Service Role (Edge Functions)          │
│  - Triggers para timestamps e validações                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Princípios de Segurança

1. **Zero Trust:** Frontend não é confiável
2. **Least Privilege:** Cada operação valida permissões específicas
3. **Defense in Depth:** Múltiplas camadas de validação
4. **Audit Everything:** Tudo é registrado
5. **Fail Secure:** Erro = Negação (não permissão)

---

## 3. Camada de Segurança (Edge Functions)

### 3.1 Estrutura de Edge Function

Cada função seguirá este template:

```typescript
// supabase/functions/[nome]/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

// 1. Schema de validação
const RequestSchema = z.object({
  // campos esperados
})

// 2. Permissões necessárias
const REQUIRED_PERMISSIONS = ['canViewCards']

// 3. Handler principal
serve(async (req) => {
  try {
    // 3.1 Validar método
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // 3.2 Autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Missing auth', { status: 401 })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Service role key!
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 3.3 Validar permissões
    const userRole = user.user_metadata?.role || 'guest'
    const hasPermission = checkPermissions(userRole, REQUIRED_PERMISSIONS)
    
    if (!hasPermission) {
      await logSecurityEvent({
        userId: user.id,
        action: 'PERMISSION_DENIED',
        resource: 'cards',
        details: { role: userRole, attempted: REQUIRED_PERMISSIONS }
      })
      return new Response('Forbidden', { status: 403 })
    }

    // 3.4 Validar dados
    const body = await req.json()
    const validatedData = RequestSchema.parse(body)

    // 3.5 Lógica de negócio
    const result = await performOperation(supabaseClient, user, validatedData)

    // 3.6 Auditoria
    await logAudit({
      userId: user.id,
      action: 'OPERATION_SUCCESS',
      resource: 'cards',
      details: validatedData
    })

    // 3.7 Retornar
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
```

### 3.2 Biblioteca de Permissões (Compartilhada)

```typescript
// supabase/functions/_shared/permissions.ts
export type UserRole = 
  | 'admin' 
  | 'genios_card'
  | 'coord_lojinha'
  | 'coord_lanchonete'
  | 'comunicacao'
  | 'vendedor_lojinha'
  | 'entregador_lojinha'
  | 'vendedor_lanchonete'
  | 'encontrista'
  | 'guest'

export type Permission =
  // Cartões
  | 'cards:view_all'
  | 'cards:view_own'
  | 'cards:create'
  | 'cards:update'
  | 'cards:delete'
  | 'cards:add_balance'
  | 'cards:debit_balance'
  | 'cards:view_balance_all'
  | 'cards:view_balance_own'
  // Produtos
  | 'products:view'
  | 'products:create_lojinha'
  | 'products:create_lanchonete'
  | 'products:create_sapatinho'
  | 'products:update_lojinha'
  | 'products:update_lanchonete'
  | 'products:update_sapatinho'
  | 'products:delete_lojinha'
  | 'products:delete_lanchonete'
  | 'products:delete_sapatinho'
  // Vendas
  | 'sales:create_lojinha'
  | 'sales:create_lanchonete'
  | 'sales:create_sapatinho'
  | 'sales:view_history_lojinha'
  | 'sales:view_history_lanchonete'
  | 'sales:view_history_sapatinho'
  | 'sales:view_own'
  // Pedidos
  | 'orders:view'
  | 'orders:mark_delivered'
  // Admin
  | 'admin:manage_users'
  | 'admin:view_reports'
  | 'admin:audit_logs'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Tudo
    'cards:view_all', 'cards:create', 'cards:update', 'cards:delete',
    'cards:add_balance', 'cards:debit_balance', 'cards:view_balance_all',
    'products:view', 'products:create_lojinha', 'products:create_lanchonete', 'products:create_sapatinho',
    'products:update_lojinha', 'products:update_lanchonete', 'products:update_sapatinho',
    'products:delete_lojinha', 'products:delete_lanchonete', 'products:delete_sapatinho',
    'sales:create_lojinha', 'sales:create_lanchonete', 'sales:create_sapatinho',
    'sales:view_history_lojinha', 'sales:view_history_lanchonete', 'sales:view_history_sapatinho',
    'orders:view', 'orders:mark_delivered',
    'admin:manage_users', 'admin:view_reports', 'admin:audit_logs'
  ],
  
  genios_card: [
    // Igual admin
    'cards:view_all', 'cards:create', 'cards:update', 'cards:delete',
    'cards:add_balance', 'cards:debit_balance', 'cards:view_balance_all',
    'products:view', 'products:create_lojinha', 'products:create_lanchonete', 'products:create_sapatinho',
    'products:update_lojinha', 'products:update_lanchonete', 'products:update_sapatinho',
    'products:delete_lojinha', 'products:delete_lanchonete', 'products:delete_sapatinho',
    'sales:create_lojinha', 'sales:create_lanchonete', 'sales:create_sapatinho',
    'sales:view_history_lojinha', 'sales:view_history_lanchonete', 'sales:view_history_sapatinho',
    'orders:view', 'orders:mark_delivered',
    'admin:manage_users', 'admin:view_reports', 'admin:audit_logs'
  ],
  
  coord_lojinha: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view', 'products:create_lojinha', 'products:update_lojinha', 'products:delete_lojinha',
    'sales:create_lojinha', 'sales:view_history_lojinha',
  ],
  
  coord_lanchonete: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view', 'products:create_lanchonete', 'products:update_lanchonete', 'products:delete_lanchonete',
    'sales:create_lanchonete', 'sales:view_history_lanchonete',
  ],
  
  comunicacao: [
    'cards:view_all', 'cards:add_balance', 'cards:view_balance_own',
  ],
  
  vendedor_lojinha: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view',
    'sales:create_lojinha',
  ],
  
  entregador_lojinha: [
    'cards:view_balance_own',
    'orders:view', 'orders:mark_delivered',
  ],
  
  vendedor_lanchonete: [
    'cards:view_all', 'cards:view_balance_own',
    'products:view',
    'sales:create_lanchonete',
  ],
  
  encontrista: [
    'cards:view_own', 'cards:view_balance_own',
    'sales:view_own',
  ],
  
  guest: []
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export function requirePermissions(role: UserRole, permissions: Permission[]): void {
  if (!hasAllPermissions(role, permissions)) {
    throw new Error(`Missing required permissions: ${permissions.join(', ')}`)
  }
}
```

### 3.3 Biblioteca de Auditoria

```typescript
// supabase/functions/_shared/audit.ts
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface AuditLog {
  userId: string
  action: string
  resource: string
  resourceId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

export async function logAudit(
  client: SupabaseClient,
  log: AuditLog
): Promise<void> {
  await client.from('audit_logs').insert({
    user_id: log.userId,
    action: log.action,
    resource: log.resource,
    resource_id: log.resourceId,
    details: log.details,
    ip_address: log.ipAddress,
    user_agent: log.userAgent,
    success: log.success,
    error_message: log.errorMessage,
    created_at: new Date().toISOString()
  })
}
```

---

## 4. Mapeamento de Operações

### 4.1 Cartões (Cards)

| Operação Atual | Edge Function | Permissões | Validações |
|---------------|---------------|------------|------------|
| `cardsApi.getAll()` | `GET /cards-list` | `cards:view_all` | - |
| `cardsApi.getByUserId()` | `GET /cards-my-card` | `cards:view_own` | Verificar userId = auth.user.id |
| `cardsApi.create()` | `POST /cards-create` | `cards:create` | Validar cardNumber único, código seguro |
| `cardsApi.associate()` | `POST /cards-associate` | Autenticado | Verificar cardCode, não associado |
| `cardsApi.updateBalance()` | `POST /cards-update-balance` | `cards:add_balance` ou `cards:debit_balance` | Validar saldo suficiente (débito) |

### 4.2 Produtos (Products)

| Operação Atual | Edge Function | Permissões | Validações |
|---------------|---------------|------------|------------|
| `productsApi.getAll('lojinha')` | `GET /products-list?category=lojinha` | `products:view` | - |
| `productsApi.create()` | `POST /products-create` | `products:create_{category}` | Validar preço > 0, nome único |
| `productsApi.update()` | `POST /products-update` | `products:update_{category}` | Validar ownership da categoria |
| `productsApi.delete()` | `POST /products-delete` | `products:delete_{category}` | Soft delete |

### 4.3 Vendas (Sales)

| Operação Atual | Edge Function | Permissões | Validações |
|---------------|---------------|------------|------------|
| `salesApi.getAll('lojinha')` | `GET /sales-history?category=lojinha` | `sales:view_history_{category}` | - |
| `salesApi.create()` | `POST /sales-create` | `sales:create_{category}` | ✅ Saldo suficiente<br>✅ Produtos existem<br>✅ Preços corretos<br>✅ Transação atômica |

**VALIDAÇÕES CRÍTICAS PARA VENDAS:**
1. Buscar produtos do banco (não confiar no preço enviado)
2. Calcular total no backend
3. Verificar saldo atual do cartão
4. Criar venda + items + débito em transação SQL
5. Se falhar qualquer etapa: ROLLBACK completo

### 4.4 Pedidos (Orders)

| Operação Atual | Edge Function | Permissões | Validações |
|---------------|---------------|------------|------------|
| `ordersApi.getOpen()` | `GET /orders-open` | `orders:view` | - |
| `ordersApi.markDelivered()` | `POST /orders-mark-delivered` | `orders:mark_delivered` | Verificar status = 'completed' |

### 4.5 Transações (Transactions)

| Operação Atual | Edge Function | Permissões | Validações |
|---------------|---------------|------------|------------|
| `transactionsApi.getByCard()` | `GET /transactions-list?cardId=X` | `cards:view_balance_own` ou `cards:view_balance_all` | Se own: validar userId |

---

## 5. Estrutura de Arquivos

```
supabase/
├── functions/
│   ├── _shared/
│   │   ├── permissions.ts       # Sistema de permissões
│   │   ├── audit.ts             # Sistema de auditoria
│   │   ├── validation.ts        # Schemas zod compartilhados
│   │   └── database.ts          # Helpers de DB
│   │
│   ├── cards-list/
│   │   └── index.ts             # GET - Listar cartões
│   ├── cards-my-card/
│   │   └── index.ts             # GET - Meu cartão
│   ├── cards-create/
│   │   └── index.ts             # POST - Criar cartão
│   ├── cards-associate/
│   │   └── index.ts             # POST - Associar cartão
│   ├── cards-update-balance/
│   │   └── index.ts             # POST - Adicionar/debitar saldo
│   │
│   ├── products-list/
│   │   └── index.ts             # GET - Listar produtos
│   ├── products-create/
│   │   └── index.ts             # POST - Criar produto
│   ├── products-update/
│   │   └── index.ts             # POST - Atualizar produto
│   ├── products-delete/
│   │   └── index.ts             # POST - Deletar produto
│   │
│   ├── sales-create/
│   │   └── index.ts             # POST - Criar venda (CRÍTICO)
│   ├── sales-history/
│   │   └── index.ts             # GET - Histórico vendas
│   │
│   ├── orders-open/
│   │   └── index.ts             # GET - Pedidos abertos
│   ├── orders-mark-delivered/
│   │   └── index.ts             # POST - Marcar entregue
│   │
│   └── transactions-list/
│       └── index.ts             # GET - Histórico transações
│
├── migrations/
│   └── 20251115_add_audit_logs.sql  # Tabela de auditoria
│
└── config.toml                  # Configuração das functions
```

---

## 6. Implementação Detalhada

### 6.1 Exemplo Completo: Criar Venda (OPERAÇÃO CRÍTICA)

```typescript
// supabase/functions/sales-create/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
import { requirePermissions, Permission } from '../_shared/permissions.ts'
import { logAudit } from '../_shared/audit.ts'

// Schema de validação
const SaleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive()
})

const CreateSaleSchema = z.object({
  cardNumber: z.string().min(1),
  category: z.enum(['lojinha', 'lanchonete', 'sapatinho']),
  items: z.array(SaleItemSchema).min(1)
})

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // 1. Autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Validar dados
    const body = await req.json()
    const data = CreateSaleSchema.parse(body)

    // 3. Verificar permissão
    const userRole = user.user_metadata?.role || 'guest'
    const requiredPermission: Permission = `sales:create_${data.category}` as Permission
    requirePermissions(userRole, [requiredPermission])

    // 4. TRANSAÇÃO ATÔMICA
    const { data: saleResult, error: saleError } = await supabase.rpc(
      'create_sale_secure',
      {
        p_seller_id: user.id,
        p_card_number: data.cardNumber,
        p_category: data.category,
        p_items: data.items
      }
    )

    if (saleError) {
      await logAudit(supabase, {
        userId: user.id,
        action: 'CREATE_SALE',
        resource: 'sales',
        details: { category: data.category, items: data.items },
        success: false,
        errorMessage: saleError.message
      })
      throw saleError
    }

    // 5. Auditoria de sucesso
    await logAudit(supabase, {
      userId: user.id,
      action: 'CREATE_SALE',
      resource: 'sales',
      resourceId: saleResult.sale_id,
      details: { category: data.category, total: saleResult.total },
      success: true
    })

    return new Response(JSON.stringify(saleResult), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error creating sale:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: error.message.includes('permission') ? 403 : 500
    })
  }
})
```

### 6.2 Função SQL Segura para Venda

```sql
-- supabase/migrations/20251115_create_sale_secure.sql

CREATE OR REPLACE FUNCTION create_sale_secure(
  p_seller_id UUID,
  p_card_number TEXT,
  p_category TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com permissões do owner (admin)
AS $$
DECLARE
  v_card_id UUID;
  v_card_balance NUMERIC;
  v_sale_id UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_table_config RECORD;
BEGIN
  -- 1. Buscar cartão
  SELECT id, balance INTO v_card_id, v_card_balance
  FROM cards
  WHERE card_number = p_card_number
  FOR UPDATE; -- Lock para evitar race condition

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cartão não encontrado: %', p_card_number;
  END IF;

  -- 2. Buscar produtos e calcular total (NUNCA confiar no frontend!)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Determinar tabela de produtos
    IF p_category = 'sapatinho' THEN
      SELECT * INTO v_product
      FROM sapatinho_products
      WHERE id = (v_item->>'productId')::UUID
        AND active = true;
    ELSE
      SELECT * INTO v_product
      FROM products
      WHERE id = (v_item->>'productId')::UUID
        AND category = p_category
        AND active = true;
    END IF;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto inválido ou inativo: %', v_item->>'productId';
    END IF;

    -- Calcular subtotal
    v_total := v_total + (v_product.price * (v_item->>'quantity')::INTEGER);
  END LOOP;

  -- 3. Verificar saldo
  IF v_card_balance < v_total THEN
    RAISE EXCEPTION 'Saldo insuficiente. Necessário: %, Disponível: %', v_total, v_card_balance;
  END IF;

  -- 4. Criar venda
  IF p_category = 'sapatinho' THEN
    INSERT INTO sapatinho_sales (seller_id, card_id, total, status)
    VALUES (p_seller_id, v_card_id, v_total, 'completed')
    RETURNING id INTO v_sale_id;
  ELSE
    INSERT INTO sales (seller_id, card_id, category, total, status, sale_id)
    VALUES (p_seller_id, v_card_id, p_category, v_total, 'completed', gen_random_uuid()::TEXT)
    RETURNING id INTO v_sale_id;
  END IF;

  -- 5. Criar itens da venda
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Buscar produto novamente para pegar nome
    IF p_category = 'sapatinho' THEN
      SELECT * INTO v_product FROM sapatinho_products WHERE id = (v_item->>'productId')::UUID;
      
      INSERT INTO sapatinho_sale_items (sale_id, product_id, product_name, quantity, price)
      VALUES (
        v_sale_id,
        (v_item->>'productId')::UUID,
        v_product.name,
        (v_item->>'quantity')::INTEGER,
        v_product.price
      );
    ELSE
      SELECT * INTO v_product FROM products WHERE id = (v_item->>'productId')::UUID;
      
      INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price)
      VALUES (
        v_sale_id,
        (v_item->>'productId')::UUID,
        v_product.name,
        (v_item->>'quantity')::INTEGER,
        v_product.price
      );
    END IF;
  END LOOP;

  -- 6. Debitar saldo
  UPDATE cards
  SET balance = balance - v_total,
      updated_at = NOW()
  WHERE id = v_card_id;

  -- 7. Criar transação
  INSERT INTO transactions (card_id, amount, type, description, created_by)
  VALUES (v_card_id, -v_total, 'debit', 'Compra na ' || p_category, p_seller_id);

  -- 8. Se lojinha, criar pedido
  IF p_category = 'lojinha' THEN
    INSERT INTO orders (sale_id, card_id, customer_name, total, status)
    SELECT v_sale_id, v_card_id, user_name, v_total, 'completed'
    FROM cards WHERE id = v_card_id;
  END IF;

  -- 9. Retornar resultado
  RETURN jsonb_build_object(
    'sale_id', v_sale_id,
    'total', v_total,
    'new_balance', v_card_balance - v_total
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, o PostgreSQL faz rollback automático
    RAISE;
END;
$$;
```

### 6.3 Tabela de Auditoria

```sql
-- supabase/migrations/20251115_add_audit_logs.sql

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);

-- Não habilitar RLS - apenas edge functions podem escrever
-- Admins podem ler via edge function específica
```

---

## 7. Plano de Migração

### Fase 1: Preparação (1-2 dias)
- [ ] Criar estrutura de pastas em `supabase/functions/`
- [ ] Implementar bibliotecas compartilhadas (_shared/)
- [ ] Criar tabela `audit_logs`
- [ ] Criar função SQL `create_sale_secure`
- [ ] Testar localmente com `supabase functions serve`

### Fase 2: Implementação das Functions (3-5 dias)
**Prioridade Alta (Críticas):**
- [ ] `sales-create` - Criar venda (MAIS CRÍTICO)
- [ ] `cards-update-balance` - Adicionar saldo
- [ ] `cards-create` - Criar cartão

**Prioridade Média:**
- [ ] `cards-list`, `cards-my-card`
- [ ] `products-create`, `products-update`, `products-delete`
- [ ] `sales-history`

**Prioridade Baixa:**
- [ ] `orders-open`, `orders-mark-delivered`
- [ ] `transactions-list`

### Fase 3: Atualização do Frontend (2-3 dias)
- [ ] Criar novo `src/api/edge-functions.ts` com cliente HTTP
- [ ] Substituir chamadas diretas ao Supabase por chamadas às functions
- [ ] Atualizar hooks (useCards, useProducts, useSales) para usar nova API
- [ ] Garantir que token JWT seja enviado em todos os requests

**Exemplo de novo cliente:**
```typescript
// src/api/edge-functions.ts
import { supabase } from '../lib/supabase'

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

async function callEdgeFunction<T>(
  functionName: string,
  data?: any,
  method: 'GET' | 'POST' = 'POST'
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No session')
  }

  const url = method === 'GET' && data
    ? `${EDGE_FUNCTION_URL}/${functionName}?${new URLSearchParams(data)}`
    : `${EDGE_FUNCTION_URL}/${functionName}`

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: method === 'POST' ? JSON.stringify(data) : undefined
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || response.statusText)
  }

  return response.json()
}

// Exemplo de uso
export const edgeFunctions = {
  sales: {
    create: (data: CreateSaleData) => 
      callEdgeFunction<{ sale_id: string, total: number }>('sales-create', data)
  },
  cards: {
    list: () => 
      callEdgeFunction<Card[]>('cards-list', undefined, 'GET'),
    myCard: () => 
      callEdgeFunction<Card>('cards-my-card', undefined, 'GET')
  }
  // ...
}
```

### Fase 4: Desabilitar RLS e Limpar Políticas (1 dia)
```sql
-- Remover todas as políticas
DROP POLICY IF EXISTS "Users can view their own cards" ON cards;
DROP POLICY IF EXISTS "Users can insert their own cards" ON cards;
-- ... (todas as outras)

-- DESABILITAR RLS (acesso apenas via service role)
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE pix_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE sapatinho_veloz_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE sapatinho_veloz_order_items DISABLE ROW LEVEL SECURITY;
```

### Fase 5: Testes de Segurança (1-2 dias)
- [ ] Tentar acessar banco diretamente do console (deve falhar)
- [ ] Tentar executar operações sem permissão (deve retornar 403)
- [ ] Tentar manipular preços (deve usar preços do banco)
- [ ] Tentar fazer venda com saldo insuficiente (deve falhar)
- [ ] Verificar logs de auditoria

### Fase 6: Deploy (1 dia)
- [ ] Deploy das edge functions: `supabase functions deploy`
- [ ] Aplicar migrations: `supabase db push`
- [ ] Deploy do frontend atualizado
- [ ] Monitorar logs e erros

---

## 8. Testes de Segurança

### 8.1 Checklist de Testes

**Autenticação:**
- [ ] Requisição sem token → 401
- [ ] Token inválido → 401
- [ ] Token expirado → 401

**Autorização:**
- [ ] Encontrista tentando criar cartão → 403
- [ ] Vendedor lanchonete tentando vender lojinha → 403
- [ ] Usuário tentando ver saldo de outro → 403

**Validação de Dados:**
- [ ] Preço negativo → 400
- [ ] Quantidade zero → 400
- [ ] Produto inexistente → 400
- [ ] CardNumber inválido → 400

**Lógica de Negócio:**
- [ ] Venda com saldo insuficiente → 400
- [ ] Debitar mais que o saldo → 400
- [ ] Criar cartão com número duplicado → 400

**Auditoria:**
- [ ] Toda operação gera log de auditoria
- [ ] Falhas são registradas com detalhes
- [ ] Logs incluem user_id, action, timestamp

### 8.2 Script de Teste de Penetração

```bash
#!/bin/bash
# test-security.sh

# 1. Tentar acessar DB diretamente (deve falhar com anon key)
echo "Teste 1: Acesso direto ao DB com anon key"
curl -X POST "$SUPABASE_URL/rest/v1/cards" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"balance": 99999}'
# Esperado: 401 ou 403

# 2. Tentar criar venda sem autenticação
echo "Teste 2: Criar venda sem auth"
curl -X POST "$SUPABASE_URL/functions/v1/sales-create" \
  -H "Content-Type: application/json" \
  -d '{"cardNumber": "123", "items": []}'
# Esperado: 401

# 3. Tentar manipular preço (deve ser ignorado)
echo "Teste 3: Manipular preço"
curl -X POST "$SUPABASE_URL/functions/v1/sales-create" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "123",
    "category": "lojinha",
    "items": [{"productId": "xxx", "quantity": 1, "price": 0.01}]
  }'
# Esperado: Preço do banco usado (não 0.01)

# ... mais testes
```

---

## 9. Considerações Adicionais

### 9.1 Performance
- Edge Functions rodam globalmente (baixa latência)
- Queries otimizadas com índices
- Cache pode ser adicionado depois (Redis/Upstash)

### 9.2 Custos
- Edge Functions: Free tier = 500K invocações/mês
- Estimativa: ~50K vendas/evento = dentro do free tier
- Se exceder: ~$2 por 1M invocações

### 9.3 Monitoramento
- Logs das functions acessíveis via dashboard Supabase
- Criar alertas para:
  - Tentativas de acesso não autorizado (429 em 1min)
  - Erros de validação frequentes
  - Vendas com valores muito altos

### 9.4 Backup e Recovery
- Manter as APIs antigas comentadas temporariamente
- Feature flag para rollback rápido se necessário
- Backup do banco antes de cada fase

---

## 10. Resumo Executivo

### Problema
Frontend tem acesso direto ao banco de dados, permitindo manipulação de saldos, vendas fraudulentas e acesso a dados de outros usuários.

### Solução
Camada de Edge Functions (Deno) que:
1. Valida autenticação (JWT)
2. Verifica permissões por role
3. Valida dados de entrada
4. Executa operações no banco com service role
5. Registra tudo em audit logs

### Benefícios
- ✅ Segurança robusta (zero trust)
- ✅ Auditoria completa
- ✅ Performance global
- ✅ Escalabilidade
- ✅ Custo baixo (free tier)

### Esforço
- **Desenvolvimento:** 7-12 dias
- **Complexidade:** Média-Alta
- **Risco:** Baixo (com plano de rollback)

### Recomendação
**IMPLEMENTAR URGENTEMENTE** - Sistema atual é vulnerável a fraudes.

Priorizar:
1. `sales-create` (mais crítico)
2. `cards-update-balance`
3. Demais operações

---

## 11. Próximos Passos

1. **Revisar este plano** e aprovar
2. **Criar branch** `feature/edge-functions-security`
3. **Começar pela Fase 1** (preparação)
4. **Implementar função mais crítica** (`sales-create`) primeiro
5. **Testar exaustivamente** antes de avançar
6. **Migrar gradualmente** outras operações
7. **Deploy em produção** com monitoramento intenso

---

**Documento criado em:** 2025-11-15  
**Versão:** 1.0  
**Autor:** AI Assistant (Claude)  
**Status:** Aguardando revisão

