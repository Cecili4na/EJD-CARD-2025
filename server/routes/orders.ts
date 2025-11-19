/**
 * Rotas de Pedidos
 * GET /api/orders/open - Listar pedidos em aberto
 * POST /api/orders/mark-delivered - Marcar pedido como entregue
 */

import { Router } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { hasPermission } from '../lib/permissions'

export const ordersRouter = Router()

// Schemas de validação
const MarkDeliveredSchema = z.object({
  orderId: z.string().uuid(),
})

/**
 * GET /api/orders/open
 * Listar pedidos em aberto (status = 'completed')
 */
ordersRouter.get('/open', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Verificar permissão
    if (!hasPermission(user.role, 'orders:view')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'orders:view',
      })
      return res.status(403).json({ error: 'Sem permissão para visualizar pedidos' })
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data || [])

  } catch (error: any) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/orders/mark-delivered
 * Marcar pedido como entregue
 */
ordersRouter.post('/mark-delivered', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Verificar permissão
    if (!hasPermission(user.role, 'orders:mark_delivered')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'orders:mark_delivered',
      })
      return res.status(403).json({ error: 'Sem permissão para marcar pedidos como entregues' })
    }

    // Validar dados
    const data = MarkDeliveredSchema.parse(req.body)

    // Buscar pedido
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', data.orderId)
      .maybeSingle()

    if (findError) throw findError
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Pedido não está com status "completed"' })
    }

    // Atualizar status
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.orderId)
      .select()
      .single()

    if (updateError) throw updateError

    console.log('✅ ORDER MARKED AS DELIVERED:', { orderId: data.orderId, userId: user.id })

    res.json({
      success: true,
      order: updated,
      message: 'Pedido marcado como entregue!',
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    res.status(500).json({ error: error.message || 'Erro ao marcar pedido como entregue' })
  }
})

