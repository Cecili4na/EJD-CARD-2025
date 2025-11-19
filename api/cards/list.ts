/**
 * GET /api/cards/list
 * Listar todos os cartões (requer permissão cards:view_all)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission } from '../../server/lib/permissions'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔵 [CARDS/LIST] ========================================')
  console.log('🔵 [CARDS/LIST] FUNÇÃO INVOCADA COM SUCESSO!')
  console.log('🔵 [CARDS/LIST] ========================================')
  console.log('🔵 [CARDS/LIST] Requisição recebida:', {
    method: req.method,
    url: req.url,
    path: req.url,
    headers: Object.keys(req.headers),
    query: req.query,
    timestamp: new Date().toISOString()
  })

  if (req.method !== 'GET') {
    console.log('❌ [CARDS/LIST] Método não permitido:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Autenticar
    console.log('🔐 [CARDS/LIST] Iniciando autenticação...')
    const auth = await authenticateRequest(req)
    if ('error' in auth) {
      console.log('❌ [CARDS/LIST] Autenticação falhou:', auth.error)
      return res.status(auth.status).json({ error: auth.error })
    }
    const user = auth.user
    console.log('✅ [CARDS/LIST] Autenticado:', { userId: user.id, role: user.role })

    // 2. Verificar permissão
    console.log('🔒 [CARDS/LIST] Verificando permissão cards:view_all...')
    if (!hasPermission(user.role, 'cards:view_all')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'cards:view_all',
      })
      return res.status(403).json({ error: 'Sem permissão para visualizar cartões' })
    }

    // 3. Buscar cartões
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log('✅ [CARDS/LIST] Retornando', data?.length || 0, 'cartões')
    return res.json(data || [])
  } catch (error: any) {
    console.error('❌ [CARDS/LIST] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
