import { supabase } from '../lib/supabase'
import { Product, ProductCategory } from '../types'

const TABLE_BY_CATEGORY: Record<ProductCategory, { table: string; hasCategoryColumn: boolean }> = {
  lojinha: { table: 'products', hasCategoryColumn: true },
  lanchonete: { table: 'products', hasCategoryColumn: true },
  sapatinho: { table: 'sapatinho_products', hasCategoryColumn: false },
}

export const productsApi = {
  getAll: async (category?: ProductCategory): Promise<Product[]> => {
    if (!category) {
      const [lojinha, lanchonete, sapatinho] = await Promise.all([
        productsApi.getAll('lojinha'),
        productsApi.getAll('lanchonete'),
        productsApi.getAll('sapatinho'),
      ])
      return [...lojinha, ...lanchonete, ...sapatinho]
    }

    const config = TABLE_BY_CATEGORY[category]
    let query = supabase
      .from(config.table)
      .select('*')
      .order('created_at', { ascending: false })

    if (config.hasCategoryColumn) {
      query = query.eq('category', category).eq('active', true)
    } else {
      query = query.eq('active', true)
    }

    const { data, error } = await query
    if (error) throw error
    
    return (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      category: config.hasCategoryColumn ? product.category : 'sapatinho',
      description: product.description,
      stock: product.stock,
      active: product.active,
      createdAt: product.created_at,
      image_url: product.image_url || product.image || null
    }))
  },

  create: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const config = TABLE_BY_CATEGORY[product.category]
    const insertPayload = {
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      active: product.active,
      ...(config.hasCategoryColumn ? { category: product.category } : {}),
    }

    const { data, error } = await supabase
      .from(config.table)
      .insert({
        ...insertPayload,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price) || 0,
      category: config.hasCategoryColumn ? data.category : 'sapatinho',
      description: data.description,
      stock: data.stock,
      active: data.active,
      createdAt: data.created_at
    }
  },

  update: async (id: string, updates: Partial<Product>): Promise<void> => {
    if (!updates.category) {
      throw new Error('Category is required to update a product')
    }

    const config = TABLE_BY_CATEGORY[updates.category]
    const updatePayload = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    if (!config.hasCategoryColumn) {
      delete updatePayload.category
    }

    const { error } = await supabase
      .from(config.table)
      .update(updatePayload)
      .eq('id', id)
    
    if (error) throw error
  },

  delete: async (id: string, category: ProductCategory): Promise<void> => {
    const config = TABLE_BY_CATEGORY[category]
    const updateData = {
      active: false,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from(config.table)
      .update(updateData)
      .eq('id', id)
    
    if (error) throw error
  }
}




