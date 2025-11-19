/**
 * GET /api/sales/list
 * Listar vendas (com filtro opcional por categoria)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission, type Permission } from '../../server/lib/permissions'

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

    return res.json(data || [])
  } catch (error: any) {
    console.error('❌ Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
