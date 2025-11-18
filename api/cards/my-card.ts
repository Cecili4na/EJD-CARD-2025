/**
 * GET /api/cards/my-card
 * Obter cartão do usuário logado
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

    // 2. Buscar cartão do usuário
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    return res.json(data)
  } catch (error: any) {
    console.error('❌ Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
