/**
 * API Simples com Express + Zod
 * Backend seguro SEM complicação
 */

// Carregar variáveis de ambiente
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = 3001

// Debug: Verificar se as variáveis foram carregadas
console.log('🔍 Verificando variáveis de ambiente:')
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Configurado' : '❌ Não encontrado')
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não encontrado')
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não encontrado')

// Supabase com service role (acesso total ao banco)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
)

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// ============================================
// MIDDLEWARE: Autenticação
// ============================================
async function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Adicionar user ao request
  ;(req as any).user = {
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role || 'guest',
  }

  next()
}

// ============================================
// ROTA: Criar Venda (SEGURA)
// ============================================
const CreateSaleSchema = z.object({
  cardNumber: z.string().min(1),
  category: z.enum(['lojinha', 'lanchonete', 'sapatinho']),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
})

app.post('/api/sales/create', authenticate, async (req, res) => {
  try {
    const user = (req as any).user
    console.log('🔐 SECURITY: Create sale', { userId: user.id, role: user.role })

    // 1. Validar dados
    const data = CreateSaleSchema.parse(req.body)

    // 2. Verificar permissão
    const hasPermission = 
      user.role === 'admin' || 
      user.role === 'genios_card' ||
      (data.category === 'lojinha' && ['coord_lojinha', 'vendedor_lojinha'].includes(user.role)) ||
      (data.category === 'lanchonete' && ['coord_lanchonete', 'vendedor_lanchonete'].includes(user.role))

    if (!hasPermission) {
      console.warn('❌ SECURITY: Permission denied', { userId: user.id, role: user.role, category: data.category })
      return res.status(403).json({ error: `Sem permissão para vender em: ${data.category}` })
    }

    // 3. Buscar cartão
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id, balance, user_name')
      .eq('card_number', data.cardNumber)
      .single()

    if (cardError || !card) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    // 4. Buscar produtos DO BANCO (não confiar no frontend!)
    const productIds = data.items.map(item => item.productId)
    const productTable = data.category === 'sapatinho' ? 'sapatinho_products' : 'products'
    
    let productsQuery = supabase
      .from(productTable)
      .select('id, name, price, active')
      .in('id', productIds)

    if (data.category !== 'sapatinho') {
      productsQuery = productsQuery.eq('category', data.category)
    }

    const { data: products, error: productsError } = await productsQuery

    if (productsError || !products || products.length !== data.items.length) {
      return res.status(400).json({ error: 'Produtos inválidos ou inativos' })
    }

    // 5. Calcular total com preços DO BANCO
    const productsMap = new Map(products.map(p => [p.id, p]))
    let total = 0
    const saleItems = data.items.map(item => {
      const product = productsMap.get(item.productId)!
      total += product.price * item.quantity
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      }
    })

    // 6. Verificar saldo
    if (card.balance < total) {
      return res.status(400).json({ 
        error: `Saldo insuficiente. Necessário: R$ ${total.toFixed(2)}, Disponível: R$ ${card.balance.toFixed(2)}` 
      })
    }

    // 7. CRIAR VENDA (transação)
    const salesTable = data.category === 'sapatinho' ? 'sapatinho_sales' : 'sales'
    const saleData = data.category === 'sapatinho'
      ? { seller_id: user.id, card_id: card.id, total, status: 'completed' }
      : { seller_id: user.id, card_id: card.id, category: data.category, total, status: 'completed', sale_id: crypto.randomUUID() }

    const { data: sale, error: saleError } = await supabase
      .from(salesTable)
      .insert(saleData)
      .select()
      .single()

    if (saleError) throw saleError

    // 8. Criar itens
    const itemsTable = data.category === 'sapatinho' ? 'sapatinho_sale_items' : 'sale_items'
    await supabase.from(itemsTable).insert(
      saleItems.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
      }))
    )

    // 9. Debitar saldo
    await supabase
      .from('cards')
      .update({ balance: card.balance - total, updated_at: new Date().toISOString() })
      .eq('id', card.id)

    // 10. Criar transação
    await supabase.from('transactions').insert({
      card_id: card.id,
      amount: -total,
      type: 'debit',
      description: `Compra na ${data.category}`,
      created_by: user.id,
    })

    // 11. Se lojinha, criar pedido
    if (data.category === 'lojinha') {
      await supabase.from('orders').insert({
        sale_id: sale.id,
        card_id: card.id,
        customer_name: card.user_name,
        total,
        status: 'completed',
      })
    }

    console.log('✅ SALE CREATED:', { saleId: sale.id, total, userId: user.id })

    res.json({
      success: true,
      saleId: sale.id,
      total,
      newBalance: card.balance - total,
      message: `Venda realizada com sucesso! Total: R$ ${total.toFixed(2)}`,
    })

  } catch (error: any) {
    console.error('❌ Error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors })
    }
    
    res.status(500).json({ error: error.message || 'Erro ao processar venda' })
  }
})

// ============================================
// ROTA: Listar Vendas
// ============================================
app.get('/api/sales/list', authenticate, async (req, res) => {
  try {
    const user = (req as any).user
    const category = req.query.category as string

    const table = category === 'sapatinho' ? 'sapatinho_sales' : 'sales'
    const itemsTable = category === 'sapatinho' ? 'sapatinho_sale_items' : 'sale_items'

    let query = supabase
      .from(table)
      .select(`*, ${itemsTable} (*)`)
      .order('created_at', { ascending: false })

    if (category && category !== 'sapatinho') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    res.json(data || [])

  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando!' })
})

app.listen(PORT, () => {
  console.log('🚀 API Simples rodando!')
  console.log(`📡 Endpoint: http://localhost:${PORT}`)
  console.log(`💚 Health: http://localhost:${PORT}/health`)
})

