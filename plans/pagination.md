# Plano de Paginação
## Sistema EJD Card 2025

---

## 📋 Índice
1. [Análise de Recursos](#1-análise-de-recursos)
2. [Estratégia de Paginação](#2-estratégia-de-paginação)
3. [Backend - API Paginada](#3-backend---api-paginada)
4. [Frontend - Componente Reutilizável](#4-frontend---componente-reutilizável)
5. [Hooks Atualizados](#5-hooks-atualizados)
6. [Plano de Implementação](#6-plano-de-implementação)

---

## 1. Análise de Recursos

### Recursos que PRECISAM de paginação:

| Recurso | Rota Atual | Volume Estimado | Prioridade |
|---------|-----------|-----------------|------------|
| **Vendas** | `GET /api/sales/list` | Alto (1000+) | 🔴 Alta |
| **Transações** | `GET /api/transactions/list` | Alto (2000+) | 🔴 Alta |
| **Produtos** | `GET /api/products/list` | Baixo (~100) | 🟡 Média |
| **Pedidos** | `GET /api/orders/open` | Médio (~200) | 🟡 Média |
| **Cartões** | `GET /api/cards/list` | Baixo (~50) | 🟢 Baixa |

### Recursos que NÃO precisam:
- `GET /api/cards/my-card` - 1 único resultado
- `POST` endpoints - não retornam listas

---

## 2. Estratégia de Paginação

### 2.1 Tipo de Paginação

**Escolhido:** Offset/Limit (paginação por número de página)

**Motivo:**
- ✅ Simples de implementar
- ✅ Fácil de entender
- ✅ Funciona bem com Supabase
- ✅ Sem libs externas necessárias

**Alternativas descartadas:**
- ❌ Cursor-based: Mais complexo, desnecessário para nosso caso
- ❌ Infinite scroll: Não se aplica ao nosso UX

### 2.2 Parâmetros Padrão

```typescript
interface PaginationParams {
  page: number      // Página atual (começa em 1)
  limit: number     // Itens por página (padrão: 50, máx: 100)
}

interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

---

## 3. Backend - API Paginada

### 3.1 Helper de Paginação (Reutilizável)

**Criar:** `server/lib/pagination.ts`

```typescript
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

export function getPaginationParams(
  query: any
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT)
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  }
}
```

### 3.2 Exemplo: Vendas Paginadas

**Atualizar:** `server/routes/sales.ts`

```typescript
import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { 
  getPaginationParams, 
  createPaginatedResponse 
} from '../lib/pagination'

export const salesRouter = Router()

// GET /api/sales/list?page=1&limit=50&category=lojinha
salesRouter.get('/list', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user
    const { page, limit, offset } = getPaginationParams(req.query)
    const category = req.query.category as string

    // 1. Validar permissão
    // ... (código de permissão)

    // 2. Determinar tabelas
    const salesTable = category === 'sapatinho' ? 'sapatinho_sales' : 'sales'
    const itemsTable = category === 'sapatinho' ? 'sapatinho_sale_items' : 'sale_items'

    // 3. Contar total (para paginação)
    let countQuery = supabase
      .from(salesTable)
      .select('*', { count: 'exact', head: true })

    if (category && category !== 'sapatinho') {
      countQuery = countQuery.eq('category', category)
    }

    const { count: total } = await countQuery

    // 4. Buscar dados paginados
    let dataQuery = supabase
      .from(salesTable)
      .select(`*, ${itemsTable} (*)`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'sapatinho') {
      dataQuery = dataQuery.eq('category', category)
    }

    const { data, error } = await dataQuery

    if (error) throw error

    // 5. Retornar resposta paginada
    res.json(createPaginatedResponse(data || [], page, limit, total || 0))

  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
```

### 3.3 Exemplo: Transações Paginadas

**Criar/Atualizar:** `server/routes/transactions.ts`

```typescript
import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { getPaginationParams, createPaginatedResponse } from '../lib/pagination'

export const transactionsRouter = Router()

// GET /api/transactions/list?cardId=xxx&page=1&limit=50
transactionsRouter.get('/list', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user
    const { page, limit, offset } = getPaginationParams(req.query)
    const cardId = req.query.cardId as string

    if (!cardId) {
      return res.status(400).json({ error: 'cardId é obrigatório' })
    }

    // Validar permissão (usuário só pode ver transações do próprio cartão)
    const { data: card } = await supabase
      .from('cards')
      .select('id, user_id')
      .eq('id', cardId)
      .single()

    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    // Admin pode ver tudo, usuários apenas próprias transações
    if (user.role !== 'admin' && user.role !== 'genios_card') {
      if (card.user_id !== user.id) {
        return res.status(403).json({ error: 'Sem permissão' })
      }
    }

    // Contar total
    const { count: total } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('card_id', cardId)

    // Buscar paginado
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json(createPaginatedResponse(data || [], page, limit, total || 0))

  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
```

---

## 4. Frontend - Componente Reutilizável

### 4.1 Componente de Paginação

**Criar:** `src/components/shared/Pagination.tsx`

```typescript
import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext: boolean
  hasPrev: boolean
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  hasNext,
  hasPrev 
}: PaginationProps) {
  // Gerar array de páginas para mostrar (máximo 7)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Mostrar: [1] ... [atual-1] [atual] [atual+1] ... [total]
    const pages: (number | string)[] = []

    if (currentPage <= 3) {
      // Início: [1] [2] [3] [4] ... [total]
      pages.push(1, 2, 3, 4, '...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Fim: [1] ... [total-3] [total-2] [total-1] [total]
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      // Meio: [1] ... [atual-1] [atual] [atual+1] ... [total]
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Botão Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-emerald-400 transition-colors"
      >
        ← Anterior
      </button>

      {/* Números de página */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            )
          }

          const isActive = page === currentPage

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-colors
                ${isActive 
                  ? 'bg-emerald-500 text-white border-2 border-emerald-500' 
                  : 'bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-emerald-400'
                }
              `}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Botão Próximo */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-emerald-400 transition-colors"
      >
        Próximo →
      </button>

      {/* Info */}
      <span className="ml-4 text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  )
}
```

### 4.2 Exportar no index

**Atualizar:** `src/components/shared/index.ts`

```typescript
export { Pagination } from './Pagination'
// ... outros exports
```

---

## 5. Hooks Atualizados

### 5.1 Cliente API com Paginação

**Atualizar:** `src/lib/api-client.ts`

```typescript
// Adicionar tipos
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// Adicionar helper
export function buildPaginatedUrl(
  baseUrl: string, 
  params: { page?: number; limit?: number; [key: string]: any }
): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  return `${baseUrl}?${searchParams.toString()}`
}

// Atualizar salesApi
export const salesApi = {
  list: (params: { category?: string; page?: number; limit?: number }) =>
    apiCall<PaginatedResponse<any>>(
      buildPaginatedUrl('/api/sales/list', params)
    ),
  // ...
}

export const transactionsApi = {
  list: (params: { cardId: string; page?: number; limit?: number }) =>
    apiCall<PaginatedResponse<any>>(
      buildPaginatedUrl('/api/transactions/list', params)
    ),
}
```

### 5.2 Hook com Paginação

**Atualizar:** `src/hooks/useSalesSimple.ts`

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '../lib/api-client'
import { useState } from 'react'

export function useSalesSimple(category?: string) {
  const [page, setPage] = useState(1)
  const [limit] = useState(50) // Pode ser configurável

  // Query para listar vendas paginadas
  const salesQuery = useQuery({
    queryKey: ['sales', category, page, limit],
    queryFn: () => salesApi.list({ category, page, limit }),
    enabled: !!category,
    keepPreviousData: true, // Manter dados anteriores enquanto carrega
  })

  return {
    sales: salesQuery.data?.data || [],
    pagination: salesQuery.data?.pagination,
    isLoading: salesQuery.isLoading,
    error: salesQuery.error,
    
    // Controles de paginação
    currentPage: page,
    setPage,
    nextPage: () => salesQuery.data?.pagination.hasNext && setPage(p => p + 1),
    prevPage: () => salesQuery.data?.pagination.hasPrev && setPage(p => p - 1),
    goToPage: setPage,
  }
}
```

### 5.3 Hook de Transações com Paginação

**Criar:** `src/hooks/useTransactionsSimple.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { transactionsApi } from '../lib/api-client'
import { useState } from 'react'

export function useTransactionsSimple(cardId?: string) {
  const [page, setPage] = useState(1)
  const [limit] = useState(50)

  const transactionsQuery = useQuery({
    queryKey: ['transactions', cardId, page, limit],
    queryFn: () => transactionsApi.list({ cardId: cardId!, page, limit }),
    enabled: !!cardId,
    keepPreviousData: true,
  })

  return {
    transactions: transactionsQuery.data?.data || [],
    pagination: transactionsQuery.data?.pagination,
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    
    currentPage: page,
    setPage,
    goToPage: setPage,
  }
}
```

---

## 6. Plano de Implementação

### Fase 1: Backend (1-2 dias)

**Prioridade Alta:**
- [ ] Criar `server/lib/pagination.ts` com helpers
- [ ] Atualizar `server/routes/sales.ts` com paginação
- [ ] Atualizar `server/routes/transactions.ts` com paginação
- [ ] Testar endpoints no Postman/Thunder Client

**Prioridade Média:**
- [ ] Adicionar paginação em `server/routes/orders.ts`
- [ ] Adicionar paginação em `server/routes/products.ts` (se necessário)

### Fase 2: Frontend (1 dia)

**Componentes:**
- [ ] Criar `src/components/shared/Pagination.tsx`
- [ ] Exportar no `index.ts`

**API Client:**
- [ ] Atualizar `src/lib/api-client.ts` com tipos e helpers
- [ ] Adicionar métodos paginados

### Fase 3: Hooks (1 dia)

- [ ] Atualizar `src/hooks/useSalesSimple.ts`
- [ ] Criar `src/hooks/useTransactionsSimple.ts`
- [ ] Atualizar outros hooks conforme necessário

### Fase 4: Páginas (1 dia)

**Atualizar páginas para usar paginação:**
- [ ] `src/pages/sales/SalesHistoryPage.tsx`
- [ ] `src/pages/MyCardPage.tsx` (histórico de transações)
- [ ] `src/pages/lojinha/LojinhaOrdersPage.tsx`
- [ ] Outras páginas com listagens

**Exemplo de uso:**

```typescript
function SalesHistoryPage() {
  const { 
    sales, 
    pagination, 
    isLoading, 
    currentPage, 
    goToPage 
  } = useSalesSimple('lojinha')

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <h1>Histórico de Vendas</h1>
      
      {/* Lista */}
      {sales.map(sale => (
        <div key={sale.id}>{/* card da venda */}</div>
      ))}

      {/* Paginação */}
      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={goToPage}
        />
      )}
    </div>
  )
}
```

### Fase 5: Testes (1 dia)

- [ ] Testar com poucos registros (<50)
- [ ] Testar com muitos registros (>500)
- [ ] Testar navegação entre páginas
- [ ] Testar com filtros + paginação
- [ ] Verificar performance

---

## 7. Considerações Técnicas

### 7.1 Performance

**Query Count (Duas queries por request):**
```typescript
// 1. Contar total
const { count } = await supabase
  .from('sales')
  .select('*', { count: 'exact', head: true })

// 2. Buscar dados paginados
const { data } = await supabase
  .from('sales')
  .select('*')
  .range(offset, offset + limit - 1)
```

**Otimização futura (se necessário):**
- Cache do total por alguns minutos
- Usar cursor-based pagination para grandes volumes

### 7.2 UX

**keepPreviousData no React Query:**
```typescript
useQuery({
  // ...
  keepPreviousData: true, // Mantém dados antigos enquanto carrega
})
```

Isso evita "flash" de loading ao trocar de página.

### 7.3 Mobile

O componente `Pagination` é responsivo:
- Desktop: Mostra 7 botões
- Mobile: Pode ser ajustado para mostrar menos

```typescript
// Versão mobile simplificada (opcional)
const isMobile = window.innerWidth < 768
const maxButtons = isMobile ? 3 : 7
```

---

## 8. Resumo

### O que será implementado:

✅ **Backend:**
- Helper reutilizável de paginação
- Endpoints retornam `{ data, pagination }`
- Padrão: 50 itens/página, máx 100

✅ **Frontend:**
- Componente `<Pagination />` reutilizável
- Hooks com controle de página
- API client com suporte a paginação

✅ **Sem libs externas:**
- Paginação feita "na mão"
- Componente simples e customizável
- Total controle sobre comportamento

### Esforço Total:
- **Desenvolvimento:** 4-5 dias
- **Complexidade:** Baixa
- **Risco:** Muito baixo

### Recursos afetados:
1. Vendas (alta prioridade)
2. Transações (alta prioridade)
3. Pedidos (média prioridade)
4. Produtos (baixa prioridade - poucos registros)

---

**Documento criado em:** 2025-11-15  
**Versão:** 1.0  
**Autor:** AI Assistant (Claude)  
**Status:** Pronto para revisão

