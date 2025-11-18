/**
 * Rotas de Cartões
 * GET /api/cards/list - Listar todos os cartões
 * GET /api/cards/my-card - Obter cartão do usuário logado
 * GET /api/cards/by-number?cardNumber=X - Buscar cartão por número
 * POST /api/cards/create - Criar novo cartão
 * POST /api/cards/associate - Associar cartão ao usuário
 * POST /api/cards/update-balance - Atualizar saldo (crédito/débito)
 */

import { Router } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { hasPermission } from '../lib/permissions'

export const cardsRouter = Router()

// Schemas de validação
const CreateCardSchema = z.object({
  name: z.string().min(1),
  cardNumber: z.string().min(1),
  cardCode: z.string().min(1),
  phoneNumber: z.string().min(1),
  initialBalance: z.number().min(0).optional().default(0),
})

const AssociateCardSchema = z.object({
  cardNumber: z.string().min(1),
  cardCode: z.string().min(1),
})

const UpdateBalanceSchema = z.object({
  cardId: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['credit', 'debit']),
  description: z.string().optional(),
})

/**
 * GET /api/cards/list
 * Listar todos os cartões (requer permissão cards:view_all)
 */
cardsRouter.get('/list', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Verificar permissão
    if (!hasPermission(user.role, 'cards:view_all')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'cards:view_all',
      })
      return res.status(403).json({ error: 'Sem permissão para visualizar cartões' })
    }

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data || [])

  } catch (error: any) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/cards/my-card
 * Obter cartão do usuário logado
 */
cardsRouter.get('/my-card', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    res.json(data)

  } catch (error: any) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/cards/by-number?cardNumber=X
 * Buscar cartão por número
 */
cardsRouter.get('/by-number', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user
    const cardNumber = req.query.cardNumber as string

    if (!cardNumber) {
      return res.status(400).json({ error: 'cardNumber é obrigatório' })
    }

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('card_number', cardNumber)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    // Verificar permissão: admin pode ver tudo, usuários apenas próprios cartões
    if (user.role !== 'admin' && user.role !== 'genios_card') {
      if (data.user_id !== user.id) {
        return res.status(403).json({ error: 'Sem permissão para visualizar este cartão' })
      }
    }

    res.json(data)

  } catch (error: any) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/cards/create
 * Criar novo cartão
 */
cardsRouter.post('/create', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Verificar permissão
    if (!hasPermission(user.role, 'cards:create')) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: 'cards:create',
      })
      return res.status(403).json({ error: 'Sem permissão para criar cartões' })
    }

    // Validar dados
    const data = CreateCardSchema.parse(req.body)

    // Verificar se número já existe
    const { data: existing } = await supabase
      .from('cards')
      .select('id')
      .eq('card_number', data.cardNumber)
      .maybeSingle()

    if (existing) {
      return res.status(400).json({ error: 'Número de cartão já existe' })
    }

    // Criar cartão
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

    res.json({
      success: true,
      card,
      message: `Cartão ${data.cardNumber} criado com sucesso!`,
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors })
    }

    res.status(500).json({ error: error.message || 'Erro ao criar cartão' })
  }
})

/**
 * POST /api/cards/associate
 * Associar cartão ao usuário logado
 */
cardsRouter.post('/associate', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Validar dados
    const data = AssociateCardSchema.parse(req.body)

    // Buscar cartão
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

    // Obter nome do usuário
    const { data: authUser } = await supabase.auth.getUser()
    const userName = authUser.user?.user_metadata?.name || user.email

    // Associar cartão
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

    res.json({
      success: true,
      card: updated,
      message: 'Cartão associado com sucesso!',
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors })
    }

    res.status(500).json({ error: error.message || 'Erro ao associar cartão' })
  }
})

/**
 * POST /api/cards/update-balance
 * Atualizar saldo do cartão (crédito ou débito)
 */
cardsRouter.post('/update-balance', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Validar dados
    const data = UpdateBalanceSchema.parse(req.body)

    // Verificar permissão
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

    // Buscar cartão
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('balance, user_id')
      .eq('id', data.cardId)
      .single()

    if (cardError || !card) {
      return res.status(404).json({ error: 'Cartão não encontrado' })
    }

    // Verificar permissão de acesso ao cartão (se débito, usuário só pode debitar próprio cartão)
    if (data.type === 'debit' && user.role !== 'admin' && user.role !== 'genios_card') {
      if (card.user_id !== user.id) {
        return res.status(403).json({ error: 'Sem permissão para debitar este cartão' })
      }
    }

    // Calcular novo saldo
    const newBalance = data.type === 'credit' ? card.balance + data.amount : card.balance - data.amount

    if (newBalance < 0) {
      return res.status(400).json({
        error: `Saldo insuficiente. Disponível: R$ ${card.balance.toFixed(2)}, Necessário: R$ ${data.amount.toFixed(2)}`,
      })
    }

    // Atualizar saldo
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.cardId)

    if (updateError) throw updateError

    // Criar transação (AUDIT LOG)
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

    res.json({
      success: true,
      newBalance,
      message: `${data.type === 'credit' ? 'Crédito' : 'Débito'} de R$ ${data.amount.toFixed(2)} realizado com sucesso!`,
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors })
    }

    res.status(500).json({ error: error.message || 'Erro ao atualizar saldo' })
  }
})

