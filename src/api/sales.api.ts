import { supabase } from '../lib/supabase'
import { Sale, SaleItem } from '../types'

export const salesApi = {
  getAll: async (category?: 'lojinha' | 'lanchonete'): Promise<Sale[]> => {
    let query = supabase
      .from('sales')
      .select(`
        *,
        sale_items (*)
      `)
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return (data || []).map((sale: any) => ({
      id: sale.id,
      userId: sale.card_id,
      sellerId: sale.seller_id,
      category: sale.category,
      items: (sale.sale_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0
      })),
      total: parseFloat(sale.total) || 0,
      status: sale.status,
      createdAt: sale.created_at
    }))
  },

  create: async (params: {
    userId: string
    sellerId: string
    items: Omit<SaleItem, 'id'>[]
    category: 'lojinha' | 'lanchonete'
  }): Promise<string> => {
    // Buscar cartão do usuário
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id, balance')
      .eq('user_id', params.userId)
      .single()

    if (cardError) throw cardError

    const total = params.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Verificar saldo
    if (card.balance < total) {
      throw new Error('Saldo insuficiente')
    }

    // Criar venda
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        card_id: card.id,
        seller_id: params.sellerId,
        category: params.category,
        total,
        status: 'completed'
      })
      .select()
      .single()

    if (saleError) throw saleError

    // Criar itens da venda
    const saleItems = params.items.map(item => ({
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

    // Debitar saldo usando a API de cards
    const { cardsApi } = await import('./cards.api')
    await cardsApi.updateBalance({
      cardId: card.id,
      amount: total,
      type: 'debit',
      description: `Compra na ${params.category}`
    })

    // Criar pedido se for lojinha
    if (params.category === 'lojinha') {
      await supabase
        .from('orders')
        .insert({
          sale_id: sale.id,
          card_id: card.id,
          customer_name: `Cliente ${params.userId}`,
          total,
          status: 'completed'
        })
    }

    return sale.id
  }
}


