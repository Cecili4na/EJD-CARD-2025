/**
 * GET /api/orders/open
 * Listar pedidos em aberto (status = 'completed')
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission } from '../../server/lib/permissions'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
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
    if (!hasPermission(user.role, 'orders:view')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'orders:view',
      })
      return res.status(403).json({ error: 'Sem permissão para visualizar pedidos' })
    }

    // 3. Buscar pedidos em aberto
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.json(data || [])
  } catch (error: any) {
    console.error('❌ Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
