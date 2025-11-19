/**
 * GET /api/products/list?category=X
 * Listar produtos por categoria
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

    // 2. Verificar permissão básica
    if (!hasPermission(user.role, 'products:view')) {
      return res.status(403).json({ error: 'Sem permissão para visualizar produtos' })
    }

    // 3. Obter categoria
    const category = req.query.category as string

    // 4. Determinar tabela
    const table = category === 'sapatinho' ? 'sapatinho_products' : 'products'

    let query = supabase
      .from(table)
      .select('*')
      .eq('active', true)
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
