/**
 * POST /api/cards/update-balance
 * Atualizar saldo do cartão (crédito ou débito)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission } from '../../server/lib/permissions'

const UpdateBalanceSchema = z.object({
  cardId: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['credit', 'debit']),
  description: z.string().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔵 [CARDS/UPDATE-BALANCE] ========================================')
  console.log('🔵 [CARDS/UPDATE-BALANCE] FUNÇÃO INVOCADA COM SUCESSO!')
  console.log('🔵 [CARDS/UPDATE-BALANCE] ========================================')
  console.log('🔵 [CARDS/UPDATE-BALANCE] Requisição recebida:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  })

  if (req.method !== 'POST') {
    console.log('❌ [CARDS/UPDATE-BALANCE] Método não permitido:', req.method)
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
    const data = UpdateBalanceSchema.parse(req.body)

    // 3. Verificar permissão
    const requiredPermission = data.type === 'credit' ? 'cards:add_balance' : 'cards:debit_balance'
    if (!hasPermission(user.role, requiredPermission)) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: requiredPermission,
      })
      return res.status(403).json({
        error: `Sem permissão para ${data.type === 'credit' ? 'adicionar' : 'debitar'} saldo`,
      })
    }

    // 4. Buscar cartão
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('balance, user_id')
      .eq('id', data.cardId)
      .single()

    if (cardError || !card) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    // 5. Verificar permissão de acesso ao cartão (se débito, usuário só pode debitar próprio cartão)
    if (data.type === 'debit' && user.role !== 'admin' && user.role !== 'genios_card') {
      if (card.user_id !== user.id) {
        return res.status(403).json({ error: 'Sem permissão para debitar este cartão' })
      }
    }

    // 6. Calcular novo saldo
    const newBalance = data.type === 'credit' ? card.balance + data.amount : card.balance - data.amount

    if (newBalance < 0) {
      return res.status(400).json({
        error: `Saldo insuficiente. Disponível: R$ ${card.balance.toFixed(2)}, Necessário: R$ ${data.amount.toFixed(2)}`,
      })
    }

    // 7. Atualizar saldo
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.cardId)

    if (updateError) throw updateError

    // 8. Criar transação (AUDIT LOG)
    await supabase.from('transactions').insert({
      card_id: data.cardId,
      amount: data.type === 'credit' ? data.amount : -data.amount,
      type: data.type,
      description: data.description || `${data.type === 'credit' ? 'Crédito' : 'Débito'} no cartão`,
      created_by: user.id,
    })

    console.log('✅ BALANCE UPDATED:', {
      cardId: data.cardId,
      type: data.type,
      amount: data.amount,
      newBalance,
      userId: user.id,
    })

    return res.json({
      success: true,
      newBalance,
      message: `${data.type === 'credit' ? 'Crédito' : 'Débito'} de R$ ${data.amount.toFixed(2)} realizado com sucesso!`,
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    return res.status(500).json({ error: error.message || 'Erro ao atualizar saldo' })
  }
}
