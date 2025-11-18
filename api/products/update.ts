/**
 * PUT /api/products/update
 * Atualizar produto
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission, type Permission } from '../../server/lib/permissions'

const UpdateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
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
    const data = UpdateProductSchema.parse(req.body)

    // 3. Buscar produto para verificar categoria
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

    // 4. Verificar permissão específica da categoria
    const requiredPermission: Permission = `products:update_${product.category}` as Permission
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

    // 5. Atualizar produto
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

    return res.json({
      success: true,
      product: updated,
      message: 'Produto atualizado com sucesso!',
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    return res.status(500).json({ error: error.message || 'Erro ao atualizar produto' })
  }
}
