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
    
    // Buscar informações dos remetentes quando necessário
    const ordersWithSenders = await Promise.all((data || []).map(async (order: any) => {
      let senderName = order.sender_name
      let isAnonymous = false
      
      // Se não tem sender_name, buscar do card pelo sender_user_id
      if (!senderName && order.sender_user_id) {
        const { data: card } = await supabase
          .from('cards')
          .select('user_name')
          .eq('user_id', order.sender_user_id)
          .maybeSingle()
        
        if (card?.user_name) {
          senderName = card.user_name
        }
      }
      
      // Verificar se é anônimo (sender_name null)
      if (!order.sender_name) {
        isAnonymous = true
      }
      
      return {
        id: order.id,
        saleId: order.sale_id,
        senderUserId: order.sender_user_id,
        senderName: senderName || null,
        senderTeam: order.sender_team || null,
        recipientName: order.recipient_name,
        recipientAddress: order.recipient_address,
        message: order.message,
        isAnonymous,
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
      }
    }))
    
    return ordersWithSenders
  },

  create: async (params: {
    senderUserId: string
    senderTeam: string
    recipientName: string
    recipientAddress: string
    message?: string
    isAnonymous?: boolean
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
        sender_name: params.isAnonymous ? null : card.user_name,
        sender_team: params.senderTeam,
        recipient_name: params.recipientName,
        recipient_address: params.recipientAddress,
        message: params.message || null,
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

