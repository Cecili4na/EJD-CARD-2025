/**
 * Helper de Autenticação para Vercel Serverless Functions
 * Adaptado de server/middleware/auth.ts
 */

import type { VercelRequest } from '@vercel/node'
import { supabase } from '../../server/lib/supabase'
import { UserRole } from '../../server/lib/permissions'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
}

/**
 * Autentica requisição Vercel e retorna usuário ou erro
 */
export async function authenticateRequest(
  req: VercelRequest
): Promise<{ user: AuthenticatedUser } | { error: string; status: number }> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { error: 'Invalid token', status: 401 }
  }

  // Buscar role da tabela app_users (não está em user_metadata)
  const { data: profile } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Se não encontrar na tabela, tentar user_metadata como fallback
  const role = (profile?.role || user.user_metadata?.role || 'guest') as UserRole

  return {
    user: {
      id: user.id,
      email: user.email!,
      role,
    },
  }
}
