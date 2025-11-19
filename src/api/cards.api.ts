/**
 * API de Cartões - USANDO SERVERLESS FUNCTIONS
 * Migrado de Supabase direto para APIs serverless
 */

import { Card } from '../types'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001'
  : '' // Em produção, mesmo domínio (Vercel)

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || 'Erro na requisição')
  }

  return response.json()
}

// Helper para converter resposta da API para tipo Card
function mapToCard(data: any): Card {
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
}

export const cardsApi = {
  // Queries
  getAll: async (): Promise<Card[]> => {
    const data = await apiCall<any[]>('/api/cards/list')
    return data.map(mapToCard)
  },

  getByNumber: async (cardNumber: string): Promise<Card | null> => {
    try {
      const data = await apiCall<any>(`/api/cards/by-number?cardNumber=${encodeURIComponent(cardNumber)}`)
      return mapToCard(data)
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        return null
      }
      throw error
    }
  },

  getByUserId: async (_userId: string): Promise<Card | null> => {
    try {
      const data = await apiCall<any>('/api/cards/my-card')
      return mapToCard(data)
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        return null
      }
      throw error
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
    const response = await apiCall<{ success: boolean; card: any; message: string }>('/api/cards/create', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return mapToCard(response.card)
  },

  associate: async (params: {
    cardNumber: string
    cardCode: string
  }): Promise<Card> => {
    const response = await apiCall<{ success: boolean; card: any; message: string }>('/api/cards/associate', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return mapToCard(response.card)
  },

  updateBalance: async (params: {
    cardId: string
    amount: number
    type: 'credit' | 'debit'
    description?: string
  }): Promise<void> => {
    await apiCall<{ success: boolean; newBalance: number; message: string }>('/api/cards/update-balance', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }
}
