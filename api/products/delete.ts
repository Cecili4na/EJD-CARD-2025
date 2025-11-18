/**
 * DELETE /api/products/delete
 * Deletar produto (soft delete)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest } from '../lib/auth'
import { supabase } from '../../server/lib/supabase'
import { hasPermission } from '../../server/lib/permissions'

const DeleteProductSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['lojinha', 'lanchonete', 'sapatinho']),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
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
    const data = DeleteProductSchema.parse(req.body)

    // 3. Verificar permissão específica da categoria
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

    // 4. Determinar tabela
    const table = data.category === 'sapatinho' ? 'sapatinho_products' : 'products'

    // 5. Soft delete
    const { error } = await supabase
      .from(table)
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    if (error) throw error

    console.log('✅ PRODUCT DELETED:', { productId: data.id, category: data.category, userId: user.id })

    return res.json({
      success: true,
      message: 'Produto deletado com sucesso!',
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues })
    }

    return res.status(500).json({ error: error.message || 'Erro ao deletar produto' })
  }
}
