/**
 * POST /api/cards/create
 * Criar novo cartão
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission } from '../../server/lib/permissions'

const CreateCardSchema = z.object({
  name: z.string().min(1),
  cardNumber: z.string().min(1),
  cardCode: z.string().min(1),
  phoneNumber: z.string().min(1),
  initialBalance: z.number().min(0).optional().default(0),
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

    // 2. Verificar permissão
    if (!hasPermission(user.role, 'cards:create')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'cards:create',
      })
      return res.status(403).json({ error: 'Sem permissão para criar cartões' })
    }

    // 3. Validar dados
    const data = CreateCardSchema.parse(req.body)

    // 4. Verificar se número já existe
    const { data: existing } = await supabase
      .from('cards')
      .select('id')
      .eq('card_number', data.cardNumber)
      .maybeSingle()

    if (existing) {
      return res.status(400).json({ error: 'Número de cartão já existe' })
    }

    // 5. Criar cartão
    const { data: card, error } = await supabase
      .from('cards')
      .insert({
        card_number: data.cardNumber,
        card_code: data.cardCode,
        user_name: data.name,
        phone_number: data.phoneNumber,
        balance: data.initialBalance,
        is_associated: false,
        user_id: null,
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ CARD CREATED:', { cardId: card.id, cardNumber: data.cardNumber, userId: user.id })

    return res.json({
      success: true,
      card,
      message: `Cartão ${data.cardNumber} criado com sucesso!`,
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    return res.status(500).json({ error: error.message || 'Erro ao criar cartão' })
  }
}
