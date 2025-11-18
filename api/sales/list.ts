/**
 * GET /api/sales/list
 * Listar vendas (com filtro opcional por categoria)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'

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
