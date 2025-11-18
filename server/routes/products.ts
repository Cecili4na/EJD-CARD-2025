/**
 * Rotas de Produtos
 * GET /api/products/list?category=X - Listar produtos por categoria
 * POST /api/products/create - Criar novo produto
 * PUT /api/products/update - Atualizar produto
 * DELETE /api/products/delete - Deletar produto (soft delete)
 */

import { Router } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { hasPermission } from '../lib/permissions'

export const productsRouter = Router()

// Schemas de validação
const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.enum(['lojinha', 'lanchonete', 'sapatinho']),
  description: z.string().optional(),
  stock: z.number().int().min(0).optional().default(0),
})

const UpdateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

const DeleteProductSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['lojinha', 'lanchonete', 'sapatinho']),
})

/**
 * GET /api/products/list?category=X
 * Listar produtos por categoria
 */
productsRouter.get('/list', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user
    const category = req.query.category as string

    // Verificar permissão básica
    if (!hasPermission(user.role, 'products:view')) {
      return res.status(403).json({ error: 'Sem permissão para visualizar produtos' })
    }

    // Determinar tabela
    const table = category === 'sapatinho' ? 'sapatinho_products' : 'products'

    let query = supabase
      .from(table)
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (category && category !== 'sapatinho') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    res.json(data || [])

  } catch (error: any) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/products/create
 * Criar novo produto
 */
productsRouter.post('/create', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Validar dados
    const data = CreateProductSchema.parse(req.body)

    // Verificar permissão específica da categoria
    const requiredPermission = `products:create_${data.category}` as const
    if (!hasPermission(user.role, requiredPermission)) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: requiredPermission,
      })
      return res.status(403).json({
        error: `Sem permissão para criar produtos em: ${data.category}`,
      })
    }

    // Determinar tabela
    const table = data.category === 'sapatinho' ? 'sapatinho_products' : 'products'

    // Verificar se nome já existe na categoria
    let checkQuery = supabase.from(table).select('id').eq('name', data.name).eq('active', true)

    if (data.category !== 'sapatinho') {
      checkQuery = checkQuery.eq('category', data.category)
    }

    const { data: existing } = await checkQuery.maybeSingle()

    if (existing) {
      return res.status(400).json({ error: 'Produto com este nome já existe nesta categoria' })
    }

    // Criar produto
    const insertData: any = {
      name: data.name,
      price: data.price,
      description: data.description || '',
      stock: data.stock,
      active: true,
    }

    if (data.category !== 'sapatinho') {
      insertData.category = data.category
    }

    const { data: product, error } = await supabase.from(table).insert(insertData).select().single()

    if (error) throw error

    console.log('✅ PRODUCT CREATED:', { productId: product.id, name: data.name, category: data.category, userId: user.id })

    res.json({
      success: true,
      product,
      message: `Produto ${data.name} criado com sucesso!`,
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors })
    }

    res.status(500).json({ error: error.message || 'Erro ao criar produto' })
  }
})

/**
 * PUT /api/products/update
 * Atualizar produto
 */
productsRouter.put('/update', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Validar dados
    const data = UpdateProductSchema.parse(req.body)

    // Buscar produto para verificar categoria
    const { data: product, error: findError } = await supabase
      .from('products')
      .select('category')
      .eq('id', data.id)
      .maybeSingle()

    if (findError) throw findError
    if (!product) {
      // Tentar sapatinho_products
      const { data: sapatinhoProduct } = await supabase
        .from('sapatinho_products')
        .select('id')
        .eq('id', data.id)
        .maybeSingle()

      if (!sapatinhoProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' })
      }

      // Atualizar sapatinho
      const { data: updated, error } = await supabase
        .from('sapatinho_products')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      return res.json({
        success: true,
        product: updated,
        message: 'Produto atualizado com sucesso!',
      })
    }

    // Verificar permissão específica da categoria
    const requiredPermission = `products:update_${product.category}` as const
    if (!hasPermission(user.role, requiredPermission)) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: requiredPermission,
      })
      return res.status(403).json({
        error: `Sem permissão para atualizar produtos em: ${product.category}`,
      })
    }

    // Atualizar produto
    const { data: updated, error } = await supabase
      .from('products')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .select()
      .single()

    if (error) throw error

    console.log('✅ PRODUCT UPDATED:', { productId: data.id, userId: user.id })

    res.json({
      success: true,
      product: updated,
      message: 'Produto atualizado com sucesso!',
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors })
    }

    res.status(500).json({ error: error.message || 'Erro ao atualizar produto' })
  }
})

/**
 * DELETE /api/products/delete
 * Deletar produto (soft delete)
 */
productsRouter.delete('/delete', authenticate, async (req, res) => {
  try {
    const user = (req as AuthRequest).user

    // Validar dados
    const data = DeleteProductSchema.parse(req.body)

    // Verificar permissão específica da categoria
    const requiredPermission = `products:delete_${data.category}` as const
    if (!hasPermission(user.role, requiredPermission)) {
      console.warn('❌ SECURITY: Permission denied', {
        userId: user.id,
        role: user.role,
        action: requiredPermission,
      })
      return res.status(403).json({
        error: `Sem permissão para deletar produtos em: ${data.category}`,
      })
    }

    // Determinar tabela
    const table = data.category === 'sapatinho' ? 'sapatinho_products' : 'products'

    // Soft delete
    const { error } = await supabase
      .from(table)
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    if (error) throw error

    console.log('✅ PRODUCT DELETED:', { productId: data.id, category: data.category, userId: user.id })

    res.json({
      success: true,
      message: 'Produto deletado com sucesso!',
    })

  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors })
    }

    res.status(500).json({ error: error.message || 'Erro ao deletar produto' })
  }
})

