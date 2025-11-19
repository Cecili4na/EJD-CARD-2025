/**
 * GET /api/cards/by-number?cardNumber=X
 * Buscar cartão por número
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔵 [CARDS/BY-NUMBER] Requisição recebida:', {
    method: req.method,
    url: req.url,
    headers: Object.keys(req.headers),
    query: req.query
  })

  if (req.method !== 'GET') {
    console.log('❌ [CARDS/BY-NUMBER] Método não permitido:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Autenticar
    console.log('🔐 [CARDS/BY-NUMBER] Iniciando autenticação...')
    const auth = await authenticateRequest(req)
    if ('error' in auth) {
      console.log('❌ [CARDS/BY-NUMBER] Autenticação falhou:', auth.error)
      return res.status(auth.status).json({ error: auth.error })
    }
    const user = auth.user
    console.log('✅ [CARDS/BY-NUMBER] Autenticado:', { userId: user.id, role: user.role })

    // 2. Validar parâmetro
    const cardNumber = req.query.cardNumber as string

    if (!cardNumber) {
      console.log('❌ [CARDS/BY-NUMBER] cardNumber não fornecido')
      return res.status(400).json({ error: 'cardNumber é obrigatório' })
    }

    console.log('🔍 [CARDS/BY-NUMBER] Buscando cartão:', cardNumber)

    // 3. Buscar cartão
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('card_number', cardNumber)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      console.log('❌ [CARDS/BY-NUMBER] Cartão não encontrado:', cardNumber)
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    console.log('✅ [CARDS/BY-NUMBER] Cartão encontrado:', data.id)

    // 4. Verificar permissão: admin pode ver tudo, usuários apenas próprios cartões
    if (user.role !== 'admin' && user.role !== 'genios_card') {
      if (data.user_id !== user.id) {
        console.log('❌ [CARDS/BY-NUMBER] Sem permissão:', { userId: user.id, cardUserId: data.user_id })
        return res.status(403).json({ error: 'Sem permissão para visualizar este cartão' })
      }
    }

    console.log('✅ [CARDS/BY-NUMBER] Retornando cartão')
    return res.json(data)
  } catch (error: any) {
    console.error('❌ [CARDS/BY-NUMBER] Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
