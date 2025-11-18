/**
 * POST /api/cards/associate
 * Associar cartão ao usuário logado
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'

const AssociateCardSchema = z.object({
  cardNumber: z.string().min(1),
  cardCode: z.string().min(1),
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

    // 2. Validar dados
    const data = AssociateCardSchema.parse(req.body)

    // 3. Buscar cartão
    const { data: existing, error: findError } = await supabase
      .from('cards')
      .select('id, is_associated, card_code, user_id')
      .eq('card_number', data.cardNumber)
      .maybeSingle()

    if (findError) throw findError
    if (!existing) {
      return res.status(404).json({ error: 'Cartão inexistente' })
    }
    if (existing.card_code !== data.cardCode) {
      return res.status(400).json({ error: 'Código do cartão inválido' })
    }
    if (existing.is_associated) {
      return res.status(400).json({
        error: 'Cartão já associado, fale com a coordenação do encontro se quiser mudar a conta do cartão associado',
      })
    }

    // 4. Obter nome do usuário (precisa buscar do token)
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '') || ''
    const { data: authUser } = await supabase.auth.getUser(token)
    const userName = authUser.user?.user_metadata?.name || user.email

    // 5. Associar cartão
    const { data: updated, error: updError } = await supabase
      .from('cards')
      .update({
        user_id: user.id,
        user_name: userName,
        is_associated: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .eq('is_associated', false)
      .select('*')
      .single()

    if (updError) throw updError

    console.log('✅ CARD ASSOCIATED:', { cardId: updated.id, userId: user.id })

    return res.json({
      success: true,
      card: updated,
      message: 'Cartão associado com sucesso!',
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    return res.status(500).json({ error: error.message || 'Erro ao associar cartão' })
  }
}
