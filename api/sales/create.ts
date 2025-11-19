/**
 * POST /api/sales/create
 * Criar uma nova venda
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermissionForCategory } from '../../server/lib/permissions'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Autenticar
    const auth = await authenticateRequest(req)
    if ('error' in auth) {
      return res.status(auth.status).json({ error: auth.error })
    }
    const user = auth.user

    console.log('🔐 SECURITY: Create sale', { userId: user.id, role: user.role })

    // 2. Validar dados
    const data = CreateSaleSchema.parse(req.body)

    // 3. Verificar permissão
    if (!hasPermissionForCategory(user.role, data.category, 'sell')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        category: data.category,
      })
      return res.status(403).json({
        error: `Sem permissão para vender em: ${data.category}`,
      })
    }

    // 4. Buscar cartão
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id, balance, user_name')
      .eq('card_number', data.cardNumber)
      .single()

    if (cardError || !card) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    // 5. Buscar produtos DO BANCO (não confiar no frontend!)
    const productIds = data.items.map((item) => item.productId)
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

    // 6. Calcular total com preços DO BANCO
    const productsMap = new Map(products.map((p) => [p.id, p]))
    let total = 0
    const saleItems = data.items.map((item) => {
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

    // 7. Verificar saldo
    if (card.balance < total) {
      return res.status(400).json({
        error: `Saldo insuficiente. Necessário: R$ ${total.toFixed(2)}, Disponível: R$ ${card.balance.toFixed(2)}`,
      })
    }

    // 8. CRIAR VENDA (transação)
    const salesTable = data.category === 'sapatinho' ? 'sapatinho_sales' : 'sales'
    const saleData =
      data.category === 'sapatinho'
        ? { seller_id: user.id, card_id: card.id, total, status: 'completed' }
        : {
            seller_id: user.id,
            card_id: card.id,
            category: data.category,
            total,
            status: 'completed',
            sale_id: crypto.randomUUID(),
          }

    const { data: sale, error: saleError } = await supabase
      .from(salesTable)
      .insert(saleData)
      .select()
      .single()

    if (saleError) throw saleError

    // 9. Criar itens
    const itemsTable = data.category === 'sapatinho' ? 'sapatinho_sale_items' : 'sale_items'
    await supabase.from(itemsTable).insert(
      saleItems.map((item) => ({
        sale_id: sale.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
      }))
    )

    // 10. Debitar saldo
    await supabase
      .from('cards')
      .update({
        balance: card.balance - total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', card.id)

    // 11. Criar transação (AUDIT LOG)
    await supabase.from('transactions').insert({
      card_id: card.id,
      amount: -total,
      type: 'debit',
      description: `Compra na ${data.category}`,
      created_by: user.id,
    })

    // 12. Se lojinha, criar pedido
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

    return res.json({
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

    return res.status(500).json({ error: error.message || 'Erro ao processar venda' })
  }
}
