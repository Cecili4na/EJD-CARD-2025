/**
 * GET /api/cards/by-number?cardNumber=X
 * Buscar cartão por número
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

    // 2. Validar parâmetro
    const cardNumber = req.query.cardNumber as string

    if (!cardNumber) {
      return res.status(400).json({ error: 'cardNumber é obrigatório' })
    }

    // 3. Buscar cartão
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('card_number', cardNumber)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    // 4. Verificar permissão: admin pode ver tudo, usuários apenas próprios cartões
    if (user.role !== 'admin' && user.role !== 'genios_card') {
      if (data.user_id !== user.id) {
        return res.status(403).json({ error: 'Sem permissão para visualizar este cartão' })
      }
    }

    return res.json(data)
  } catch (error: any) {
    console.error('❌ Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
