import { supabase } from '../lib/supabase'
import { Product } from '../types'

export const productsApi = {
  getAll: async (category?: 'lojinha' | 'lanchonete'): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      category: product.category,
      description: product.description,
      stock: product.stock,
      active: product.active,
      createdAt: product.created_at
    }))
  },

  create: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        active: product.active
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price) || 0,
      category: data.category,
      description: data.description,
      stock: data.stock,
      active: data.active,
      createdAt: data.created_at
    }
  },

  update: async (id: string, updates: Partial<Product>): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) throw error
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}


