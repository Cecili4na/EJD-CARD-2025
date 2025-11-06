import { supabase } from '../lib/supabase'
import { Transaction } from '../types'

export const transactionsApi = {
  getByCardId: async (cardId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((tx: any) => ({
      id: tx.id,
      userId: tx.card_id,
      amount: parseFloat(tx.amount) || 0,
      type: tx.type,
      description: tx.description,
      createdBy: tx.created_by,
      createdAt: tx.created_at
    }))
  },

  getAll: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((tx: any) => ({
      id: tx.id,
      userId: tx.card_id,
      amount: parseFloat(tx.amount) || 0,
      type: tx.type,
      description: tx.description,
      createdBy: tx.created_by,
      createdAt: tx.created_at
    }))
  }
}


