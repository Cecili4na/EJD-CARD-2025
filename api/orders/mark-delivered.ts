/**
 * POST /api/orders/mark-delivered
 * Marcar pedido como entregue
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission } from '../../server/lib/permissions'

const MarkDeliveredSchema = z.object({
  orderId: z.string().uuid(),
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

    // 2. Verificar permissão
    if (!hasPermission(user.role, 'orders:mark_delivered')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'orders:mark_delivered',
      })
      return res.status(403).json({ error: 'Sem permissão para marcar pedidos como entregues' })
    }

    // 3. Validar dados
    const data = MarkDeliveredSchema.parse(req.body)

    // 4. Buscar pedido
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

    // 5. Atualizar status
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

    return res.json({
      success: true,
      order: updated,
      message: 'Pedido marcado como entregue!',
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    return res.status(500).json({ error: error.message || 'Erro ao marcar pedido como entregue' })
  }
}
