/**
 * Middleware de Autenticação
 * Valida JWT e extrai informações do usuário
 */

import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import { UserRole } from '../lib/permissions'

export interface AuthRequest extends Request {
  user: {
    id: string
    email: string
    role: UserRole
  }
}

/**
 * Middleware para autenticar requisições via JWT
 */
export async function authenticate(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.error('❌ Auth error:', error)
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Buscar role da tabela app_users (não está em user_metadata)
  const { data: profile } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Se não encontrar na tabela, tentar user_metadata como fallback
  const role = (profile?.role || user.user_metadata?.role || 'guest') as UserRole

  // Adicionar user ao request
  ;(req as AuthRequest).user = {
    id: user.id,
    email: user.email!,
    role,
  }

  next()
}

