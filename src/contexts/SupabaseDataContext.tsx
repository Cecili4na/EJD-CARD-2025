import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Interfaces (mantendo compatibilidade com DataContext original)
export interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  createdBy?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  category: 'lojinha' | 'lanchonete'
  description?: string
  stock?: number
  active: boolean
  createdAt: string
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Sale {
  id: string
  userId: string
  sellerId: string
  category: 'lojinha' | 'lanchonete'
  items: SaleItem[]
  total: number
  status: 'completed' | 'delivered'
  createdAt: string
}

export interface Order {
  id: string
  saleId: string
  userId: string
  customerName: string
  items: SaleItem[]
  total: number
  status: 'pending' | 'completed' | 'delivered'
  createdAt: string
  deliveredAt?: string
}

export interface Card {
  id: string
  userId: string
  userName: string
  cardNumber: string
  phoneNumber: string
  balance: number
  createdAt: string
  updatedAt: string
}

export interface AppData {
  balances: Map<string, { balance: number; transactions: Transaction[] }>
  products: {
    lojinha: Product[]
    lanchonete: Product[]
  }
  sales: Sale[]
  orders: Order[]
  cards: Card[]
}

interface SupabaseDataContextType {
  data: AppData
  isLoading: boolean
  error: string | null
  
  // Funções de saldo
  addBalance: (userId: string, amount: number, description: string, createdBy?: string) => Promise<void>
  getBalance: (userId: string) => number
  getTransactions: (userId: string) => Transaction[]
  
  // Funções de produtos
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProducts: (category: 'lojinha' | 'lanchonete') => Product[]
  
  // Funções de vendas
  makeSale: (userId: string, sellerId: string, items: Omit<SaleItem, 'id'>[], category: 'lojinha' | 'lanchonete') => Promise<string>
  getSales: (category?: 'lojinha' | 'lanchonete') => Sale[]
  
  // Funções de pedidos
  getOpenOrders: () => Order[]
  markAsDelivered: (orderId: string) => Promise<void>
  
  // Funções de cartão
  getCardByUserId: (userId: string) => Card | null
  createCard: (params: { name: string; cardNumber: string; cardCode: string; phoneNumber: string; initialBalance?: number }) => Promise<Card>
  associateCard: (params: { cardNumber: string; cardCode: string }) => Promise<Card>
  getCardByNumber: (cardNumber: string) => Promise<Card | null>
  updateCardBalance: (cardId: string, amount: number, type: 'credit' | 'debit', description?: string) => Promise<void>
  
  // Utilitários
  resetData: () => Promise<void>
  loadSeedData: () => Promise<void>
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined)

export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext)
  if (context === undefined) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider')
  }
  return context
}

interface SupabaseDataProviderProps {
  children: ReactNode
}

export const SupabaseDataProvider: React.FC<SupabaseDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    balances: new Map(),
    products: { lojinha: [], lanchonete: [] },
    sales: [],
    orders: [],
    cards: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase não configurado')
      setIsLoading(false)
      return
    }

    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Carregar cartões
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (cardsError) throw cardsError

      // Carregar produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      // Carregar transações
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      // Carregar vendas
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*)
        `)
        .order('created_at', { ascending: false })

      if (salesError) throw salesError

      // Carregar pedidos
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Processar dados
      const balances = new Map<string, { balance: number; transactions: Transaction[] }>()
      
      // Agrupar transações por usuário
      transactions?.forEach(tx => {
        if (!balances.has(tx.card_id)) {
          balances.set(tx.card_id, { balance: 0, transactions: [] })
        }
        const userData = balances.get(tx.card_id)!
        userData.transactions.push({
          id: tx.id,
          userId: tx.card_id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          createdBy: tx.created_by,
          createdAt: tx.created_at
        })
      })

      // Calcular saldos
      cards?.forEach(card => {
        if (!balances.has(card.id)) {
          balances.set(card.id, { balance: 0, transactions: [] })
        }
        balances.get(card.id)!.balance = card.balance
      })

      // Processar produtos
      const productsByCategory = {
        lojinha: products?.filter(p => p.category === 'lojinha') || [],
        lanchonete: products?.filter(p => p.category === 'lanchonete') || []
      }

      // Processar vendas
      const processedSales: Sale[] = sales?.map(sale => ({
        id: sale.id,
        userId: sale.card_id,
        sellerId: sale.seller_id,
        category: sale.category,
        items: sale.sale_items.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price
        })),
        total: sale.total,
        status: sale.status,
        createdAt: sale.created_at
      })) || []

      // Processar pedidos
      const processedOrders: Order[] = orders?.map(order => ({
        id: order.id,
        saleId: order.sale_id,
        userId: order.card_id,
        customerName: order.customer_name,
        items: [], // TODO: Buscar items separadamente se necessário
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        deliveredAt: order.delivered_at
      })) || []

      // Mapear cartões do formato Supabase (snake_case) para formato Card (camelCase)
      const mappedCards: Card[] = (cards || []).map((card: any) => ({
        id: card.id,
        userId: card.user_id || '',
        userName: card.user_name || '',
        cardNumber: card.card_number || '',
        phoneNumber: card.phone_number || '',
        balance: parseFloat(card.balance) || 0,
        createdAt: card.created_at || '',
        updatedAt: card.updated_at || ''
      }))

      setData({
        balances,
        products: productsByCategory,
        sales: processedSales,
        orders: processedOrders,
        cards: mappedCards
      })

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  // Funções de saldo
  const addBalance = async (userId: string, amount: number, description: string, createdBy?: string) => {
    try {
      // Buscar cartão do usuário
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (cardError) throw cardError

      // Criar transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          card_id: card.id,
          amount,
          type: amount > 0 ? 'credit' : 'debit',
          description,
          created_by: createdBy
        })

      if (transactionError) throw transactionError

      // Atualizar saldo do cartão
      const { error: balanceError } = await supabase
        .from('cards')
        .update({
          balance: amount, // TODO: Implementar incremento correto
          updated_at: new Date().toISOString()
        })
        .eq('id', card.id)

      if (balanceError) throw balanceError

      // Recarregar dados
      await loadData()
    } catch (err) {
      console.error('Erro ao adicionar saldo:', err)
      throw err
    }
  }

  const getBalance = (userId: string): number => {
    const card = data.cards.find(c => c.userId === userId)
    return card?.balance || 0
  }

  const getTransactions = (userId: string): Transaction[] => {
    const card = data.cards.find(c => c.userId === userId)
    if (!card) return []
    return data.balances.get(card.id)?.transactions || []
  }

  // Funções de produtos
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          stock: product.stock,
          active: product.active
        })

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao adicionar produto:', err)
      throw err
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      throw err
    }
  }

  const getProducts = (category: 'lojinha' | 'lanchonete'): Product[] => {
    return data.products[category].filter(p => p.active)
  }

  // Funções de vendas
  const makeSale = async (userId: string, sellerId: string, items: Omit<SaleItem, 'id'>[], category: 'lojinha' | 'lanchonete'): Promise<string> => {
    try {
      // Buscar cartão do usuário
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('id, balance')
        .eq('user_id', userId)
        .single()

      if (cardError) throw cardError

      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Verificar saldo
      if (card.balance < total) {
        throw new Error('Saldo insuficiente')
      }

      // Criar venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          card_id: card.id,
          seller_id: sellerId,
          category,
          total,
          status: 'completed'
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Criar itens da venda
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Debitar saldo
      await addBalance(userId, -total, `Compra na ${category}`, sellerId)

      // Criar pedido se for lojinha
      if (category === 'lojinha') {
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            sale_id: sale.id,
            card_id: card.id,
            customer_name: `Cliente ${userId}`,
            total,
            status: 'completed'
          })

        if (orderError) throw orderError
      }

      await loadData()
      return sale.id
    } catch (err) {
      console.error('Erro ao realizar venda:', err)
      throw err
    }
  }

  const getSales = (category?: 'lojinha' | 'lanchonete'): Sale[] => {
    if (category) {
      return data.sales.filter(sale => sale.category === category)
    }
    return data.sales
  }

  // Funções de pedidos
  const getOpenOrders = (): Order[] => {
    return data.orders.filter(order => order.status === 'completed')
  }

  const markAsDelivered = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao marcar como entregue:', err)
      throw err
    }
  }

  // Funções de cartão
  const getCardByUserId = (userId: string): Card | null => {
    return data.cards.find(c => c.userId === userId) || null
  }

  const createCard = async (params: { name: string; cardNumber: string; cardCode: string; phoneNumber: string; initialBalance?: number }): Promise<Card> => {
    try {
      const { data: card, error } = await supabase
        .from('cards')
        .insert({
          card_number: params.cardNumber,
          card_code: params.cardCode,
          user_name: params.name,
          phone_number: params.phoneNumber,
          balance: params.initialBalance || 0,
          is_associated: false, // Por padrão não associado
          user_id: null // Não associado a nenhum usuário ainda
        })
        .select()
        .single()

      if (error) throw error

      await loadData()
      return card as any
    } catch (err) {
      console.error('Erro ao criar cartão:', err)
      throw err
    }
  }

  // Associação de cartão existente ao usuário atual
  const associateCard = async (params: { cardNumber: string; cardCode: string }): Promise<Card> => {
    try {
      // Verificar existência e status (valida por card_number + card_code)
      const { data: existing, error: findError } = await supabase
        .from('cards')
        .select('id, is_associated, card_code')
        .eq('card_number', params.cardNumber)
        .maybeSingle()
      if (findError) throw findError
      if (!existing) throw new Error('Cartão inexistente')
      if (existing.card_code !== params.cardCode) throw new Error('Código do cartão inválido')
      if (existing.is_associated) throw new Error('Cartão já associado, fale com a coordenação do encontro se quiser mudar a conta do cartão associado')

      // Obter usuário
      const { data: session } = await supabase.auth.getSession()
      const userId = session.session?.user?.id
      if (!userId) throw new Error('Sessão inválida')

      const { data: authUser } = await supabase.auth.getUser()
      const userName = authUser.user?.user_metadata?.name || null

      // Associar
      const { data: updated, error: updError } = await supabase
        .from('cards')
        .update({
          user_id: userId,
          user_name: userName,
          is_associated: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .eq('is_associated', false)
        .select('*')
        .single()
      if (updError) throw updError

      // Mapear do formato Supabase para Card
      const mappedCard: Card = {
        id: updated.id,
        userId: updated.user_id || '',
        userName: updated.user_name || '',
        cardNumber: updated.card_number || '',
        phoneNumber: updated.phone_number || '',
        balance: parseFloat(updated.balance) || 0,
        createdAt: updated.created_at || '',
        updatedAt: updated.updated_at || ''
      }

      await loadData()
      return mappedCard
    } catch (err) {
      console.error('Erro ao associar cartão:', err)
      throw err
    }
  }

  // Buscar cartão por número
  const getCardByNumber = async (cardNumber: string): Promise<Card | null> => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('card_number', cardNumber)
        .maybeSingle()
      
      if (error) throw error
      return data as any || null
    } catch (err) {
      console.error('Erro ao buscar cartão:', err)
      throw err
    }
  }

  // Atualizar saldo do cartão
  const updateCardBalance = async (cardId: string, amount: number, type: 'credit' | 'debit', description?: string): Promise<void> => {
    try {
      // Buscar cartão atual
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('balance')
        .eq('id', cardId)
        .single()
      
      if (cardError) throw cardError
      
      // Calcular novo saldo
      const newBalance = type === 'credit' 
        ? (card.balance + amount)
        : (card.balance - amount)
      
      if (newBalance < 0) {
        throw new Error('Saldo insuficiente')
      }

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from('cards')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId)

      if (updateError) throw updateError

      // Criar transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          card_id: cardId,
          amount: type === 'credit' ? amount : -amount,
          type,
          description: description || `${type === 'credit' ? 'Crédito' : 'Débito'} no cartão`,
          created_by: 'admin'
        })

      if (transactionError) throw transactionError

      await loadData()
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err)
      throw err
    }
  }

  // Utilitários
  const resetData = async () => {
    // Não implementar reset em produção
    console.warn('Reset de dados não implementado para Supabase')
  }

  const loadSeedData = async () => {
    try {
      // Verificar se já existem produtos
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .limit(1)

      if (existingProducts && existingProducts.length > 0) {
        return // Já tem dados
      }

      // Inserir produtos de exemplo
      const seedProducts = [
        // Produtos Lojinha
        { name: 'Camiseta Encontrão', price: 25.00, category: 'lojinha', description: 'Camiseta oficial', active: true },
        { name: 'Caneca Personalizada', price: 15.00, category: 'lojinha', description: 'Caneca com logo', active: true },
        { name: 'Chaveiro', price: 5.00, category: 'lojinha', description: 'Chaveiro do evento', active: true },
        
        // Produtos Lanchonete
        { name: 'Hambúrguer', price: 12.00, category: 'lanchonete', description: 'Hambúrguer artesanal', active: true },
        { name: 'Refrigerante', price: 4.00, category: 'lanchonete', description: 'Lata 350ml', active: true },
        { name: 'Batata Frita', price: 8.00, category: 'lanchonete', description: 'Porção média', active: true }
      ]

      const { error } = await supabase
        .from('products')
        .insert(seedProducts)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao carregar dados seed:', err)
      throw err
    }
  }

  const value: SupabaseDataContextType = {
    data,
    isLoading,
    error,
    addBalance,
    getBalance,
    getTransactions,
    addProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    makeSale,
    getSales,
    getOpenOrders,
    markAsDelivered,
    getCardByUserId,
    createCard,
    associateCard,
    getCardByNumber,
    updateCardBalance,
    resetData,
    loadSeedData
  }

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  )
}
