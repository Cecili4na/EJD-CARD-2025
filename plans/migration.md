# Plano de Migração - Tanstack Query + Tanstack Router

## 📋 Sumário Executivo

### Objetivo
Migrar o sistema de gerenciamento de estado de Context API para **Tanstack Query (React Query)** e implementar **Tanstack Router** para navegação tipada, eliminando problemas de navegação, piscadas na UI e melhorando a organização do código.

### Problemas Atuais Identificados
1. **Performance**: Múltiplas chamadas API sequenciais em `loadData()` do SupabaseDataContext (cards, products, transactions, sales, orders)
2. **Piscadas**: Falta de cache adequado causa re-fetching desnecessário
3. **Estado Global Complexo**: Context API com estado pesado e re-renders desnecessários
4. **Navegação**: React Router não tipado, falta de type-safety nas rotas
5. **Loading States**: Estados de loading genéricos sem granularidade
6. **Error Handling**: Tratamento de erro limitado e sem retry automático

---

## 🎯 Benefícios Esperados

### Tanstack Query
- ✅ Cache automático e inteligente
- ✅ Background refetching
- ✅ Retry automático em caso de falha
- ✅ Optimistic updates
- ✅ Invalidação de queries granular
- ✅ Loading e error states por query
- ✅ Redução de re-renders desnecessários

### Tanstack Router
- ✅ Type-safety completo nas rotas
- ✅ Route params e search params tipados
- ✅ Loader pattern para pre-fetch de dados
- ✅ Navegação sem piscadas
- ✅ Layout routes otimizados
- ✅ Lazy loading de rotas

---

## 📦 Fase 1: Setup e Instalação

### 1.1 Instalar Dependências

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install @tanstack/router @tanstack/router-devtools
npm install @tanstack/router-vite-plugin
```

### 1.2 Configurar Vite Plugin

**Arquivo**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite()
  ],
})
```

### 1.3 Criar Estrutura de Diretórios

```
src/
├── api/                    # Funções de API separadas por domínio
│   ├── cards.api.ts
│   ├── products.api.ts
│   ├── transactions.api.ts
│   ├── sales.api.ts
│   └── auth.api.ts
├── hooks/                  # Custom hooks com Tanstack Query
│   ├── useCards.ts
│   ├── useProducts.ts
│   ├── useTransactions.ts
│   └── useAuth.ts
├── routes/                 # Rotas Tanstack Router
│   ├── __root.tsx
│   ├── index.tsx
│   ├── mycard.tsx
│   ├── cards/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── balance.tsx
│   │   ├── add.tsx
│   │   └── debit.tsx
│   ├── lojinha.tsx
│   ├── lanchonete.tsx
│   └── admin.tsx
└── lib/
    └── query-client.ts     # Configuração do QueryClient
```

---

## 🔄 Fase 2: Migração de Data Fetching (Context → Tanstack Query)

### 2.1 Criar QueryClient Configurado

**Arquivo**: `src/lib/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### 2.2 Criar API Functions (separar lógica do contexto)

#### **Arquivo**: `src/api/cards.api.ts`

```typescript
import { supabase } from '../lib/supabase'
import { Card } from '../types' // Criar arquivo de tipos separado

export const cardsApi = {
  // Queries
  getAll: async (): Promise<Card[]> => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((card: any) => ({
      id: card.id,
      userId: card.user_id || '',
      userName: card.user_name || '',
      cardNumber: card.card_number || '',
      phoneNumber: card.phone_number || '',
      balance: parseFloat(card.balance) || 0,
      createdAt: card.created_at || '',
      updatedAt: card.updated_at || ''
    }))
  },

  getByNumber: async (cardNumber: string): Promise<Card | null> => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('card_number', cardNumber)
      .maybeSingle()
    
    if (error) throw error
    return data as Card | null
  },

  getByUserId: async (userId: string): Promise<Card | null> => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data as Card | null
  },

  // Mutations
  create: async (params: {
    name: string
    cardNumber: string
    cardCode: string
    phoneNumber: string
    initialBalance?: number
  }): Promise<Card> => {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        card_number: params.cardNumber,
        card_code: params.cardCode,
        user_name: params.name,
        phone_number: params.phoneNumber,
        balance: params.initialBalance || 0,
        is_associated: false,
        user_id: null
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Card
  },

  updateBalance: async (params: {
    cardId: string
    amount: number
    type: 'credit' | 'debit'
    description?: string
  }): Promise<void> => {
    // Buscar cartão atual
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('balance')
      .eq('id', params.cardId)
      .single()
    
    if (cardError) throw cardError
    
    // Calcular novo saldo
    const newBalance = params.type === 'credit' 
      ? (card.balance + params.amount)
      : (card.balance - params.amount)
    
    if (newBalance < 0) throw new Error('Saldo insuficiente')

    // Atualizar saldo
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.cardId)

    if (updateError) throw updateError

    // Criar transação
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        card_id: params.cardId,
        amount: params.type === 'credit' ? params.amount : -params.amount,
        type: params.type,
        description: params.description || `${params.type === 'credit' ? 'Crédito' : 'Débito'} no cartão`,
        created_by: 'admin'
      })

    if (transactionError) throw transactionError
  }
}
```

#### **Arquivo**: `src/api/products.api.ts`

```typescript
import { supabase } from '../lib/supabase'
import { Product } from '../types'

export const productsApi = {
  getAll: async (category?: 'lojinha' | 'lanchonete'): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  create: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        active: product.active
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  update: async (id: string, updates: Partial<Product>): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) throw error
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}
```

### 2.3 Criar Custom Hooks com Tanstack Query

#### **Arquivo**: `src/hooks/useCards.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '../api/cards.api'
import { useToastContext } from '../contexts/ToastContext'

// Query Keys
export const cardKeys = {
  all: ['cards'] as const,
  lists: () => [...cardKeys.all, 'list'] as const,
  list: (filters: string) => [...cardKeys.lists(), { filters }] as const,
  details: () => [...cardKeys.all, 'detail'] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
  byNumber: (number: string) => [...cardKeys.all, 'number', number] as const,
  byUserId: (userId: string) => [...cardKeys.all, 'userId', userId] as const,
}

// Queries
export function useCards() {
  return useQuery({
    queryKey: cardKeys.lists(),
    queryFn: cardsApi.getAll,
  })
}

export function useCard(cardNumber: string, enabled = true) {
  return useQuery({
    queryKey: cardKeys.byNumber(cardNumber),
    queryFn: () => cardsApi.getByNumber(cardNumber),
    enabled: enabled && !!cardNumber,
  })
}

export function useCardByUserId(userId: string, enabled = true) {
  return useQuery({
    queryKey: cardKeys.byUserId(userId),
    queryFn: () => cardsApi.getByUserId(userId),
    enabled: enabled && !!userId,
  })
}

// Mutations
export function useCreateCard() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToastContext()

  return useMutation({
    mutationFn: cardsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
      showSuccess(
        'Cartão Criado!',
        `Cartão de número ${data.cardNumber} foi criado com sucesso.`
      )
    },
    onError: (error: any) => {
      showError('Erro', error?.message || 'Erro ao criar cartão')
    },
  })
}

export function useUpdateCardBalance() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToastContext()

  return useMutation({
    mutationFn: cardsApi.updateBalance,
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: cardKeys.all })
      
      const previousCards = queryClient.getQueryData(cardKeys.lists())
      
      // Atualizar cache otimisticamente
      queryClient.setQueryData(cardKeys.byNumber(variables.cardId), (old: any) => {
        if (!old) return old
        const newBalance = variables.type === 'credit'
          ? old.balance + variables.amount
          : old.balance - variables.amount
        return { ...old, balance: newBalance }
      })
      
      return { previousCards }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all })
      showSuccess('Sucesso', 'Saldo atualizado com sucesso')
    },
    onError: (error: any, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previousCards) {
        queryClient.setQueryData(cardKeys.lists(), context.previousCards)
      }
      showError('Erro', error?.message || 'Erro ao atualizar saldo')
    },
  })
}
```

#### **Arquivo**: `src/hooks/useProducts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api/products.api'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (category?: 'lojinha' | 'lanchonete') => 
    [...productKeys.lists(), { category }] as const,
}

export function useProducts(category?: 'lojinha' | 'lanchonete') {
  return useQuery({
    queryKey: productKeys.list(category),
    queryFn: () => productsApi.getAll(category),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      productsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
```

### 2.4 Atualizar App.tsx com QueryClientProvider

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/query-client'
// ... outros imports

function App() {
  const DataProviderComponent = isSupabaseConfigured() ? SupabaseDataProvider : DataProvider

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProviderComponent>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DataProviderComponent>
      </AuthProvider>
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
```

---

## 🛣️ Fase 3: Migração do Router (React Router → Tanstack Router)

### 3.1 Criar Route Tree

#### **Arquivo**: `src/routes/__root.tsx`

```typescript
import { createRootRoute, Outlet } from '@tanstack/router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})
```

#### **Arquivo**: `src/routes/index.tsx`

```typescript
import { createFileRoute, redirect } from '@tanstack/router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/mycard' })
  },
})
```

#### **Arquivo**: `src/routes/mycard.tsx`

```typescript
import { createFileRoute } from '@tanstack/router'
import MyCardPage from '../pages/MyCardPage'
import { useCardByUserId } from '../hooks/useCards'
import { useAuth } from '../contexts/AuthContext'

export const Route = createFileRoute('/mycard')({
  component: MyCardPageRoute,
  loader: async ({ context }) => {
    // Pre-fetch card data
    if (context.user?.id) {
      await context.queryClient.ensureQueryData({
        queryKey: ['cards', 'userId', context.user.id],
        queryFn: () => cardsApi.getByUserId(context.user!.id),
      })
    }
  },
})

function MyCardPageRoute() {
  return <MyCardPage />
}
```

#### **Arquivo**: `src/routes/cards/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/router'
import CardsPage from '../../pages/cards/CardsPage'
import { cardKeys } from '../../hooks/useCards'
import { cardsApi } from '../../api/cards.api'

export const Route = createFileRoute('/cards/')({
  component: CardsPage,
  loader: async ({ context }) => {
    // Pre-fetch all cards
    await context.queryClient.ensureQueryData({
      queryKey: cardKeys.lists(),
      queryFn: cardsApi.getAll,
    })
  },
})
```

#### **Arquivo**: `src/routes/cards/create.tsx`

```typescript
import { createFileRoute } from '@tanstack/router'
import CreateCard from '../../pages/cards/CreateCard'

export const Route = createFileRoute('/cards/create')({
  component: () => <CreateCard onBack={() => window.history.back()} />,
})
```

### 3.2 Criar Router Instance

#### **Arquivo**: `src/router.tsx`

```typescript
import { createRouter } from '@tanstack/router'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client'

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    user: undefined!,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/router' {
  interface Register {
    router: typeof router
  }
}
```

### 3.3 Atualizar main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { router } from './router'
import './index.css'
import './global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

---

## 🎨 Fase 4: Loading States e UX

### 4.1 Criar Loading Components

#### **Arquivo**: `src/components/shared/LoadingSpinner.tsx`

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-yellow-400 ${sizes[size]}`} />
    </div>
  )
}
```

#### **Arquivo**: `src/components/shared/PageSkeleton.tsx`

```typescript
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-3">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
```

### 4.2 Atualizar Componentes de Página

#### Exemplo: `src/pages/cards/CreateCard.tsx`

```typescript
import { useCreateCard } from '../../hooks/useCards'
import { useNavigate } from '@tanstack/router'

const CreateCard: React.FC<CreateCardProps> = ({ onBack }) => {
  const navigate = useNavigate()
  const createCardMutation = useCreateCard()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createCardMutation.mutateAsync({
        name,
        cardNumber,
        cardCode,
        phoneNumber,
        initialBalance: parseFloat(initialBalance) || 0
      })
      
      // Navegar após sucesso
      navigate({ to: '/cards' })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  return (
    // ... JSX
    <Button
      type="submit"
      disabled={createCardMutation.isPending}
    >
      {createCardMutation.isPending ? 'Criando...' : 'CRIAR CARTÃO'}
    </Button>
  )
}
```

---

## 🧪 Fase 5: Testes de Integridade

### 5.1 Checklist de Funcionalidades

#### Autenticação
- [ ] Login via Supabase funciona
- [ ] Estado de autenticação persiste no refresh
- [ ] Logout limpa o estado corretamente
- [ ] Redirecionamento para login quando não autenticado

#### Cartões
- [ ] Listar todos os cartões
- [ ] Criar novo cartão
- [ ] Consultar saldo por número
- [ ] Adicionar valor ao cartão
- [ ] Debitar valor do cartão
- [ ] Associar cartão ao usuário
- [ ] Ver cartão do usuário logado

#### Produtos
- [ ] Listar produtos por categoria (lojinha/lanchonete)
- [ ] Criar novo produto
- [ ] Editar produto existente
- [ ] Deletar produto (soft delete)
- [ ] Filtrar produtos ativos

#### Vendas
- [ ] Realizar venda na lojinha
- [ ] Realizar venda na lanchonete
- [ ] Ver histórico de vendas
- [ ] Ver pedidos em aberto
- [ ] Marcar pedido como entregue

#### Navegação
- [ ] Todas as rotas estão acessíveis
- [ ] Parâmetros de rota funcionam
- [ ] Navegação programática funciona
- [ ] Voltar/Avançar do navegador funciona
- [ ] Não há piscadas ao navegar

#### Performance
- [ ] Dados são cacheados adequadamente
- [ ] Não há re-fetching desnecessário
- [ ] Loading states aparecem corretamente
- [ ] Optimistic updates funcionam
- [ ] Retry em caso de erro funciona

### 5.2 Testes de Regressão

```typescript
// src/tests/integration/cards.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/query-client'
import { useCards, useCreateCard } from '../hooks/useCards'

describe('Cards Integration', () => {
  it('should fetch cards successfully', async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useCards(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })

  it('should create card successfully', async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateCard(), { wrapper })

    await result.current.mutateAsync({
      name: 'Test User',
      cardNumber: '999',
      cardCode: 'TEST123',
      phoneNumber: '11999999999',
      initialBalance: 100
    })

    expect(result.current.isSuccess).toBe(true)
  })
})
```

### 5.3 Testes Manuais

#### Script de Teste Manual
```markdown
1. **Autenticação**
   - [ ] Fazer login
   - [ ] Verificar se dados do usuário aparecem
   - [ ] Fazer logout
   - [ ] Verificar se volta para tela de login

2. **Criação de Cartão**
   - [ ] Navegar para /cards/create
   - [ ] Preencher formulário
   - [ ] Submeter
   - [ ] Verificar mensagem de sucesso
   - [ ] Verificar redirecionamento para /cards
   - [ ] Confirmar que cartão aparece na listagem

3. **Consulta de Saldo**
   - [ ] Navegar para /cards/balance
   - [ ] Digitar número do cartão
   - [ ] Verificar se saldo aparece
   - [ ] Verificar se dados do cartão estão corretos

4. **Adicionar Valor**
   - [ ] Navegar para /cards/add
   - [ ] Digitar número do cartão
   - [ ] Verificar se cartão é encontrado automaticamente
   - [ ] Digitar valor
   - [ ] Ver preview do novo saldo
   - [ ] Confirmar operação
   - [ ] Verificar mensagem de sucesso
   - [ ] Verificar que saldo foi atualizado

5. **Performance**
   - [ ] Navegar entre páginas rapidamente
   - [ ] Verificar que não há piscadas
   - [ ] Verificar que dados são mantidos em cache
   - [ ] Atualizar página e verificar que dados persistem
```

---

## 📊 Fase 6: Monitoramento e Otimização

### 6.1 DevTools

Durante desenvolvimento, usar:
- **React Query DevTools**: Monitorar queries, cache, e refetching
- **Tanstack Router DevTools**: Visualizar rota tree, params, e loaders

### 6.2 Métricas de Sucesso

| Métrica | Antes | Meta Após Migração |
|---------|-------|-------------------|
| Tempo de carregamento inicial | ~2s | <1s |
| Tempo de navegação entre páginas | ~500ms | <100ms |
| Número de requests por navegação | 5-10 | 0-2 (cache) |
| Piscadas visuais | Frequentes | Nenhuma |
| Bundle size | - | +50kb max |

### 6.3 Configurações de Cache Recomendadas

```typescript
// src/lib/query-client.ts - Configurações finais
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados raramente mudam
      staleTime: 1000 * 60 * 5, // 5 min
      cacheTime: 1000 * 60 * 30, // 30 min
      
      // Retry strategy
      retry: (failureCount, error: any) => {
        // Não retry em erros 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      
      // Otimizações
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})
```

---

## 📝 Cronograma Sugerido

### Semana 1: Setup e Fundações
- Dia 1-2: Instalar dependências e configurar Tanstack Query
- Dia 3-4: Criar API functions e primeiros hooks (cards, products)
- Dia 5: Testes iniciais e ajustes

### Semana 2: Migração de Queries
- Dia 1-2: Migrar todas queries (transactions, sales, orders)
- Dia 3-4: Migrar mutations e adicionar optimistic updates
- Dia 5: Remover SupabaseDataContext antigo

### Semana 3: Tanstack Router
- Dia 1-2: Configurar Tanstack Router e criar route tree
- Dia 3-4: Migrar todas as rotas existentes
- Dia 5: Adicionar loaders e pre-fetching

### Semana 4: Polimento e Testes
- Dia 1-2: Melhorar loading states e UX
- Dia 3-4: Testes de integração completos
- Dia 5: Monitoramento, otimizações finais e documentação

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Breaking changes em componentes existentes | Alto | Migrar incrementalmente, manter ambos sistemas temporariamente |
| Aumento no bundle size | Médio | Code splitting, lazy loading |
| Bugs em optimistic updates | Médio | Testes extensivos, rollback automático |
| Perda de dados em cache | Baixo | Configuração adequada de staleTime e cacheTime |
| Incompatibilidade com AuthContext | Médio | Manter AuthContext, só migrar data fetching |

---

## 🎓 Recursos e Referências

- [Tanstack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Tanstack Router Docs](https://tanstack.com/router/latest/docs/framework/react/overview)
- [Migração React Router → Tanstack Router](https://tanstack.com/router/latest/docs/framework/react/guide/migrating)
- [Query Key Factory Pattern](https://tkdodo.eu/blog/effective-react-query-keys)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

## ✅ Conclusão

Esta migração vai resolver os problemas atuais de:
- ✅ Piscadas na navegação (cache + Tanstack Router)
- ✅ Performance (queries paralelas, cache inteligente)
- ✅ Type-safety (router tipado)
- ✅ Loading states (granularidade por query)
- ✅ Organização de código (separação de concerns)

**Próximo Passo**: Revisar e aprovar o plano, depois iniciar Fase 1.

