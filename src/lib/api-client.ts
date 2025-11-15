/**
 * Cliente da API - SIMPLES
 * Apenas fetch com validação
 */

import { supabase } from './supabase'

const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001'
  : '' // Em produção, mesmo domínio

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

// ============================================
// API de Vendas
// ============================================
export interface CreateSaleInput {
  cardNumber: string
  category: 'lojinha' | 'lanchonete' | 'sapatinho'
  items: {
    productId: string
    quantity: number
  }[]
}

export interface CreateSaleResult {
  success: boolean
  saleId: string
  total: number
  newBalance: number
  message: string
}

export const salesApi = {
  create: (data: CreateSaleInput) =>
    apiCall<CreateSaleResult>('/api/sales/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (category?: string) =>
    apiCall<any[]>(`/api/sales/list${category ? `?category=${category}` : ''}`),
}

