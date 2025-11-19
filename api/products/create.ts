/**
 * POST /api/products/create
 * Criar novo produto
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission } from '../../server/lib/permissions'

const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.enum(['lojinha', 'lanchonete', 'sapatinho']),
  description: z.string().optional(),
  stock: z.number().int().min(0).optional().default(0),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
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
    const data = CreateProductSchema.parse(req.body)

    // 3. Verificar permissão específica da categoria
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

    // 4. Determinar tabela
    const table = data.category === 'sapatinho' ? 'sapatinho_products' : 'products'

    // 5. Verificar se nome já existe na categoria
    let checkQuery = supabase.from(table).select('id').eq('name', data.name).eq('active', true)

    if (data.category !== 'sapatinho') {
      checkQuery = checkQuery.eq('category', data.category)
    }

    const { data: existing } = await checkQuery.maybeSingle()

    if (existing) {
      return res.status(400).json({ error: 'Produto com este nome já existe nesta categoria' })
    }

    // 6. Criar produto
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

    console.log('✅ PRODUCT CREATED:', {
      productId: product.id,
      name: data.name,
      category: data.category,
      userId: user.id,
    })

    return res.json({
      success: true,
      product,
      message: `Produto ${data.name} criado com sucesso!`,
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    return res.status(500).json({ error: error.message || 'Erro ao criar produto' })
  }
}
