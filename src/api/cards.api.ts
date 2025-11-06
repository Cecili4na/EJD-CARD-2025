import { supabase } from '../lib/supabase'
import { Card } from '../types'

export const cardsApi = {
  // Queries
  getAll: async (): Promise<Card[]> => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((card: any) => ({
      id: card.id,
      userId: card.user_id || '',
      userName: card.user_name || '',
      cardNumber: card.card_number || '',
      phoneNumber: card.phone_number || '',
      balance: parseFloat(card.balance) || 0,
      createdAt: card.created_at || '',
      updatedAt: card.updated_at || ''
    }))
  },

  getByNumber: async (cardNumber: string): Promise<Card | null> => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('card_number', cardNumber)
      .maybeSingle()
    
    if (error) throw error
    
    if (!data) return null
    
    return {
      id: data.id,
      userId: data.user_id || '',
      userName: data.user_name || '',
      cardNumber: data.card_number || '',
      phoneNumber: data.phone_number || '',
      balance: parseFloat(data.balance) || 0,
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || ''
    }
  },

  getByUserId: async (userId: string): Promise<Card | null> => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    
    if (!data) return null
    
    return {
      id: data.id,
      userId: data.user_id || '',
      userName: data.user_name || '',
      cardNumber: data.card_number || '',
      phoneNumber: data.phone_number || '',
      balance: parseFloat(data.balance) || 0,
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || ''
    }
  },

  // Mutations
  create: async (params: {
    name: string
    cardNumber: string
    cardCode: string
    phoneNumber: string
    initialBalance?: number
  }): Promise<Card> => {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        card_number: params.cardNumber,
        card_code: params.cardCode,
        user_name: params.name,
        phone_number: params.phoneNumber,
        balance: params.initialBalance || 0,
        is_associated: false,
        user_id: null
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      userId: data.user_id || '',
      userName: data.user_name || '',
      cardNumber: data.card_number || '',
      phoneNumber: data.phone_number || '',
      balance: parseFloat(data.balance) || 0,
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || ''
    }
  },

  associate: async (params: {
    cardNumber: string
    cardCode: string
  }): Promise<Card> => {
    // Verificar existência e status
    const { data: existing, error: findError } = await supabase
      .from('cards')
      .select('id, is_associated, card_code')
      .eq('card_number', params.cardNumber)
      .maybeSingle()
    
    if (findError) throw findError
    if (!existing) throw new Error('Cartão inexistente')
    if (existing.card_code !== params.cardCode) throw new Error('Código do cartão inválido')
    if (existing.is_associated) throw new Error('Cartão já associado, fale com a coordenação do encontro se quiser mudar a conta do cartão associado')

    // Obter usuário
    const { data: session } = await supabase.auth.getSession()
    const userId = session.session?.user?.id
    if (!userId) throw new Error('Sessão inválida')

    const { data: authUser } = await supabase.auth.getUser()
    const userName = authUser.user?.user_metadata?.name || null

    // Associar
    const { data: updated, error: updError } = await supabase
      .from('cards')
      .update({
        user_id: userId,
        user_name: userName,
        is_associated: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .eq('is_associated', false)
      .select('*')
      .single()
    
    if (updError) throw updError

    return {
      id: updated.id,
      userId: updated.user_id || '',
      userName: updated.user_name || '',
      cardNumber: updated.card_number || '',
      phoneNumber: updated.phone_number || '',
      balance: parseFloat(updated.balance) || 0,
      createdAt: updated.created_at || '',
      updatedAt: updated.updated_at || ''
    }
  },

  updateBalance: async (params: {
    cardId: string
    amount: number
    type: 'credit' | 'debit'
    description?: string
  }): Promise<void> => {
    // Buscar cartão atual
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('balance')
      .eq('id', params.cardId)
      .single()
    
    if (cardError) throw cardError
    
    // Calcular novo saldo
    const newBalance = params.type === 'credit' 
      ? (card.balance + params.amount)
      : (card.balance - params.amount)
    
    if (newBalance < 0) throw new Error('Saldo insuficiente')

    // Atualizar saldo
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.cardId)

    if (updateError) throw updateError

    // Criar transação
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        card_id: params.cardId,
        amount: params.type === 'credit' ? params.amount : -params.amount,
        type: params.type,
        description: params.description || `${params.type === 'credit' ? 'Crédito' : 'Débito'} no cartão`,
        created_by: 'admin'
      })

    if (transactionError) throw transactionError
  }
}


