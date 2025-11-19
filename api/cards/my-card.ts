/**
 * GET /api/cards/my-card
 * Obter cartão do usuário logado
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔵 [CARDS/MY-CARD] Requisição recebida:', {
    method: req.method,
    url: req.url,
    headers: Object.keys(req.headers),
    query: req.query
  })

  if (req.method !== 'GET') {
    console.log('❌ [CARDS/MY-CARD] Método não permitido:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Autenticar
    console.log('🔐 [CARDS/MY-CARD] Iniciando autenticação...')
    const auth = await authenticateRequest(req)
    if ('error' in auth) {
      console.log('❌ [CARDS/MY-CARD] Autenticação falhou:', auth.error)
      return res.status(auth.status).json({ error: auth.error })
    }
    const user = auth.user
    console.log('✅ [CARDS/MY-CARD] Autenticado:', { userId: user.id, role: user.role })

    // 2. Buscar cartão do usuário
    console.log('🔍 [CARDS/MY-CARD] Buscando cartão do usuário...')
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      console.log('❌ [CARDS/MY-CARD] Cartão não encontrado para userId:', user.id)
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    console.log('✅ [CARDS/MY-CARD] Retornando cartão:', data.id)
    return res.json(data)
  } catch (error: any) {
    console.error('❌ [CARDS/MY-CARD] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
