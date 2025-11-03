// Serviço para gerenciar produtos no localStorage

import { supabase } from '../lib/supabase'

export type Product = {
  id: string  // alterado de number para string
  name: string
  price: number
  quantity: number
  image?: string | null
  category?: string | null
  [key: string]: any
}

export const productService = {
  // Retorna array de produtos (nunca undefined)
  getProducts: async (category: 'lojinha' | 'lanchonete'): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true })

      if (error) {
        console.error('productService.getProducts error:', error)
        return []
      }

      // garante retorno consistente
      return data ?? []
    } catch (err) {
      console.error('productService.getProducts unexpected error:', err)
      return []
    }
  },

  // Deleta produto e retorna boolean indicando sucesso
  deleteProduct: async (_category: string, id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('productService.deleteProduct error:', error)
        return false
      }
      return true
    } catch (err) {
      console.error('productService.deleteProduct unexpected error:', err)
      return false
    }
  },

  // Opcional: buscar um produto por id (útil para edição)
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from<Product>('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('productService.getProductById error:', error)
        return null
      }
      return data ?? null
    } catch (err) {
      console.error('productService.getProductById unexpected error:', err)
      return null
    }
  }
}

