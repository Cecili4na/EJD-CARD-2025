import { supabase } from '../lib/supabase'
import { SapatinhoVelozOrder, SaleItem } from '../types'
import { salesApi } from './sales.api'

export const sapatinhoVelozApi = {
  getAll: async (): Promise<SapatinhoVelozOrder[]> => {
    const { data, error } = await supabase
      .from('sapatinho_veloz_orders')
      .select(`
        *,
        sapatinho_veloz_order_items (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((order: any) => ({
      id: order.id,
      saleId: order.sale_id,
      senderUserId: order.sender_user_id,
      senderName: order.sender_name,
      senderTeam: order.sender_team,
      recipientName: order.recipient_name,
      recipientAddress: order.recipient_address,
      message: order.message,
      items: (order.sapatinho_veloz_order_items || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        createdAt: item.created_at
      })),
      total: parseFloat(order.total) || 0,
      status: order.status,
      createdAt: order.created_at,
      deliveredAt: order.delivered_at
    }))
  },

  getOpenOrders: async (): Promise<SapatinhoVelozOrder[]> => {
    const { data, error } = await supabase
      .from('sapatinho_veloz_orders')
      .select(`
        *,
        sapatinho_veloz_order_items (*)
      `)
      .in('status', ['pending', 'completed'])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((order: any) => ({
      id: order.id,
      saleId: order.sale_id,
      senderUserId: order.sender_user_id,
      senderName: order.sender_name,
      senderTeam: order.sender_team,
      recipientName: order.recipient_name,
      recipientAddress: order.recipient_address,
      message: order.message,
      items: (order.sapatinho_veloz_order_items || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        createdAt: item.created_at
      })),
      total: parseFloat(order.total) || 0,
      status: order.status,
      createdAt: order.created_at,
      deliveredAt: order.delivered_at
    }))
  },

  create: async (params: {
    senderUserId: string
    senderTeam: string
    recipientName: string
    recipientAddress: string
    message?: string
    items: Omit<SaleItem, 'id'>[]
  }): Promise<string> => {
    // Verificar saldo antes de criar a venda
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id, balance, user_name')
      .eq('user_id', params.senderUserId)
      .single()

    if (cardError) throw cardError

    const total = params.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    if (card.balance < total) {
      throw new Error('Saldo insuficiente no cartão')
    }

    // Criar venda usando salesApi
    const saleId = await salesApi.create({
      userId: params.senderUserId,
      sellerId: params.senderUserId,
      items: params.items,
      category: 'sapatinho'
    })

    // Criar pedido Sapatinho Veloz
    const { data: order, error: orderError } = await supabase
      .from('sapatinho_veloz_orders')
      .insert({
        sale_id: saleId,
        sender_user_id: params.senderUserId,
        sender_name: card.user_name,
        sender_team: params.senderTeam,
        recipient_name: params.recipientName,
        recipient_address: params.recipientAddress,
        message: params.message,
        total,
        status: 'completed'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Criar itens do pedido
    const orderItems = params.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('sapatinho_veloz_order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order.id
  },

  markAsDelivered: async (orderId: string): Promise<void> => {
    const { error } = await supabase
      .from('sapatinho_veloz_orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) throw error
  }
}

