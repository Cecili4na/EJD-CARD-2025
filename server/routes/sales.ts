/**
 * Rotas de Vendas
 * POST /api/sales/create - Criar venda
 * GET /api/sales/list - Listar vendas
 */

import { Router } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { hasPermissionForCategory, hasPermission, type Permission } from '../lib/permissions'

export const salesRouter = Router()

// Schema de validação
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

/**
 * POST /api/sales/create
 * Criar uma nova venda
 */
salesRouter.post('/create', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user
    console.log('🔐 SECURITY: Create sale', { userId: user.id, role: user.role })

    // 1. Validar dados
    const data = CreateSaleSchema.parse(req.body)

    // 2. Verificar permissão
    if (!hasPermissionForCategory(user.role, data.category, 'sell')) {
      console.warn('❌ SECURITY: Permission denied', { 
        userId: user.id, 
        role: user.role, 
        category: data.category 
      })
      return res.status(403).json({ 
        error: `Sem permissão para vender em: ${data.category}` 
      })
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
      if (!product.active) {
        throw new Error(`Produto ${product.name} está inativo`)
      }
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
      : { 
          seller_id: user.id, 
          card_id: card.id, 
          category: data.category, 
          total, 
          status: 'completed', 
          sale_id: crypto.randomUUID() 
        }

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
      .update({ 
        balance: card.balance - total, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', card.id)

    // 10. Criar transação (AUDIT LOG)
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
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }
    
    res.status(500).json({ error: error.message || 'Erro ao processar venda' })
  }
})

/**
 * GET /api/sales/list
 * Listar vendas (com filtro opcional por categoria)
 */
salesRouter.get('/list', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user
    const category = req.query.category as string

    // 2. Verificar permissão básica (admin e genios_card podem ver tudo)
    if (user.role !== 'admin' && user.role !== 'genios_card') {
      // Verificar se tem pelo menos uma permissão de visualização de vendas
      const hasAnySalesPermission = 
        hasPermission(user.role, 'sales:view_history_lojinha') ||
        hasPermission(user.role, 'sales:view_history_lanchonete') ||
        hasPermission(user.role, 'sales:view_history_sapatinho') ||
        hasPermission(user.role, 'sales:view_own')

      if (!hasAnySalesPermission) {
        console.warn('❌ SECURITY: Permission denied', {
          userId: user.id,
          role: user.role,
          action: 'sales:view',
        })
        return res.status(403).json({ error: 'Sem permissão para visualizar vendas' })
      }

      // 3. Se categoria específica, verificar permissão da categoria
      if (category) {
        const requiredPermission: Permission = `sales:view_history_${category}` as Permission
        if (!hasPermission(user.role, requiredPermission)) {
          console.warn('❌ SECURITY: Permission denied', {
            userId: user.id,
            role: user.role,
            action: requiredPermission,
          })
          return res.status(403).json({ error: `Sem permissão para visualizar vendas de: ${category}` })
        }
      }
    }

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
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

